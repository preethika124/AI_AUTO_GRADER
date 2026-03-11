const path = require("path");
const { execSync } = require("child_process");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const API_BASE = "http://localhost:5000/api";
const CORES = Number(process.env.NUMBER_OF_PROCESSORS || 1);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function percentile(sortedValues, p) {
  if (!sortedValues.length) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

function getBackendPid() {
  const output = execSync(
    'C:\\Windows\\System32\\netstat.exe -ano | C:\\Windows\\System32\\findstr.exe ":5000"',
    { encoding: "utf8" }
  );

  const listeningLine = output
    .split(/\r?\n/)
    .find((line) => line.includes("LISTENING"));

  if (!listeningLine) {
    throw new Error("No LISTENING process found on port 5000");
  }

  const parts = listeningLine.trim().split(/\s+/);
  return Number(parts[parts.length - 1]);
}

function getProcessStats(pid) {
  const cmd = `C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -Command Get-Process -Id ${pid} ^| Select-Object Id,CPU,WorkingSet64`;
  const output = execSync(cmd, { encoding: "utf8" });
  const line = output
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /^\d+\s+[\d.]+\s+\d+$/.test(l));

  if (!line) {
    throw new Error(`Could not parse process stats for PID ${pid}`);
  }

  const [id, cpuSeconds, workingSet64] = line.split(/\s+/);
  return {
    id: Number(id),
    cpuSeconds: Number(cpuSeconds),
    workingSetBytes: Number(workingSet64),
  };
}

async function ensureTestUser(email, password) {
  await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Load Test User",
      email,
      password,
    }),
  });
}

async function loginAndGetCookie(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }

  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No Set-Cookie header returned from login");
  }

  return setCookie.split(";")[0];
}

async function runLoadScenario({
  name,
  method,
  url,
  concurrency,
  durationSec,
  headers = {},
  bodyFactory = null,
}) {
  const stopAt = Date.now() + durationSec * 1000;
  const latencies = [];
  const statusCounts = {};
  let total = 0;
  let errors = 0;

  const workers = Array.from({ length: concurrency }, () =>
    (async () => {
      while (Date.now() < stopAt) {
        const started = process.hrtime.bigint();
        try {
          const body = bodyFactory ? bodyFactory() : undefined;
          const response = await fetch(url, {
            method,
            headers,
            body,
          });
          const elapsedMs =
            Number(process.hrtime.bigint() - started) / 1_000_000;

          latencies.push(elapsedMs);
          total += 1;
          statusCounts[response.status] = (statusCounts[response.status] || 0) + 1;

          if (response.status >= 400) {
            errors += 1;
          }
        } catch (err) {
          const elapsedMs =
            Number(process.hrtime.bigint() - started) / 1_000_000;
          latencies.push(elapsedMs);
          total += 1;
          errors += 1;
          statusCounts.NETWORK_ERROR = (statusCounts.NETWORK_ERROR || 0) + 1;
        }
      }
    })()
  );

  const startedAt = Date.now();
  await Promise.all(workers);
  const elapsedSec = (Date.now() - startedAt) / 1000;

  const sorted = [...latencies].sort((a, b) => a - b);
  const avgLatency = sorted.length
    ? sorted.reduce((a, b) => a + b, 0) / sorted.length
    : 0;
  const p95 = percentile(sorted, 95);
  const throughput = elapsedSec > 0 ? total / elapsedSec : 0;
  const errorRate = total > 0 ? (errors / total) * 100 : 0;

  return {
    name,
    concurrency,
    durationSec: elapsedSec,
    totalRequests: total,
    avgLatencyMs: avgLatency,
    p95LatencyMs: p95,
    throughputRps: throughput,
    errors,
    errorRatePercent: errorRate,
    statusCounts,
  };
}

async function monitorProcessWhile(pid, promise) {
  const samples = [];
  let stopped = false;

  const collect = () => {
    try {
      samples.push(getProcessStats(pid));
    } catch (err) {
      // Ignore transient sample failures
    }
  };

  collect();
  const interval = setInterval(collect, 1000);

  let result;
  try {
    result = await promise;
  } finally {
    if (!stopped) {
      clearInterval(interval);
      collect();
      stopped = true;
    }
  }

  return { result, samples };
}

function summarizeProcess(samples, elapsedSec) {
  if (samples.length < 2) {
    return {
      avgCpuPercent: 0,
      peakMemMb: 0,
      avgMemMb: 0,
    };
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  const cpuDeltaSec = Math.max(0, last.cpuSeconds - first.cpuSeconds);
  const avgCpuPercent = (cpuDeltaSec / Math.max(elapsedSec, 0.001) / CORES) * 100;

  const memMb = samples.map((s) => s.workingSetBytes / (1024 * 1024));
  const peakMemMb = Math.max(...memMb);
  const avgMemMb = memMb.reduce((a, b) => a + b, 0) / memMb.length;

  return {
    avgCpuPercent,
    peakMemMb,
    avgMemMb,
  };
}

async function getDbStats() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const t0 = process.hrtime.bigint();
    await pool.query("SELECT 1");
    const queryMs = Number(process.hrtime.bigint() - t0) / 1_000_000;

    const connRes = await pool.query(
      "SELECT state, COUNT(*)::int AS count FROM pg_stat_activity WHERE datname = current_database() GROUP BY state ORDER BY state"
    );

    const slowRes = await pool.query(
      "SELECT pid, state, NOW() - query_start AS duration, LEFT(query, 100) AS query FROM pg_stat_activity WHERE state <> 'idle' AND query NOT ILIKE '%pg_stat_activity%' ORDER BY duration DESC LIMIT 5"
    );

    return {
      queryExecutionMs: queryMs,
      connectionsByState: connRes.rows,
      activeQueries: slowRes.rows,
    };
  } finally {
    await pool.end();
  }
}

function printScenarioReport(scenario, procSummary) {
  console.log("\n====================================================");
  console.log(`Scenario: ${scenario.name}`);
  console.log("====================================================");
  console.log(`Virtual Users: ${scenario.concurrency}`);
  console.log(`Duration: ${scenario.durationSec.toFixed(2)} sec`);
  console.log(`Total Requests: ${scenario.totalRequests}`);
  console.log(`Average Response Time: ${scenario.avgLatencyMs.toFixed(2)} ms`);
  console.log(`P95 Response Time: ${scenario.p95LatencyMs.toFixed(2)} ms`);
  console.log(`Throughput: ${scenario.throughputRps.toFixed(2)} req/sec`);
  console.log(`Error Rate: ${scenario.errorRatePercent.toFixed(2)}%`);
  console.log(`Status Counts: ${JSON.stringify(scenario.statusCounts)}`);
  console.log(`Avg CPU Usage (process): ${procSummary.avgCpuPercent.toFixed(2)}%`);
  console.log(`Avg Memory (process): ${procSummary.avgMemMb.toFixed(2)} MB`);
  console.log(`Peak Memory (process): ${procSummary.peakMemMb.toFixed(2)} MB`);
}

async function main() {
  const pid = getBackendPid();
  const testEmail = `loadtest_${Date.now()}@example.com`;
  const testPassword = "StrongP@ssw0rd!";

  await ensureTestUser(testEmail, testPassword);
  const authCookie = await loginAndGetCookie(testEmail, testPassword);

  const scenarios = [
    {
      name: "Login Endpoint Load Test",
      method: "POST",
      url: `${API_BASE}/auth/login`,
      concurrency: 50,
      durationSec: 30,
      headers: {
        "Content-Type": "application/json",
      },
      bodyFactory: () =>
        JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
    },
    {
      name: "Auth Session Check (/auth/me)",
      method: "GET",
      url: `${API_BASE}/auth/me`,
      concurrency: 200,
      durationSec: 30,
      headers: {
        Cookie: authCookie,
      },
    },
    {
      name: "LLM Endpoint (/generate-questions)",
      method: "POST",
      url: `${API_BASE}/generate-questions`,
      concurrency: 20,
      durationSec: 30,
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      bodyFactory: () =>
        JSON.stringify({
          topic: "Concurrency testing topic",
          num_questions: 2,
          total_marks: 10,
        }),
    },
  ];

  const reports = [];

  for (const scenario of scenarios) {
    const monitored = await monitorProcessWhile(
      pid,
      runLoadScenario(scenario)
    );

    const procSummary = summarizeProcess(
      monitored.samples,
      monitored.result.durationSec
    );
    printScenarioReport(monitored.result, procSummary);
    reports.push({
      scenario: monitored.result,
      process: procSummary,
    });

    await sleep(1500);
  }

  let dbStats = null;
  try {
    dbStats = await getDbStats();
  } catch (err) {
    dbStats = { error: err.message };
  }

  console.log("\n================ DB Metrics ================");
  console.log(JSON.stringify(dbStats, null, 2));

  console.log("\n================ Summary JSON ================");
  console.log(JSON.stringify({ pid, reports, dbStats }, null, 2));
}

main().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});
