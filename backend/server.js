const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const evaluationRoutes = require("./routes/evaluationRoutes");
const answerKeyRoutes = require("./routes/answerKeyRoutes");
const questionRoutes = require("./routes/questionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const correctedRoutes = require("./routes/correctedRoutes");
const ragRoutes = require("./routes/ragRoutes");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");



const app = express();
const PORT = Number(process.env.PORT) || 5000;

const llmLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again in a minute",
  },
});

const normalizeOrigin = (value) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "");

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:3000,http://127.0.0.1:3000"
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));

app.use(
  [
    "/api/generate-questions",
    "/api/generate-answer-key",
    "/api/evaluate",
    "/api/upload-rag-documents",
    "/api/generate-report-pdf",
    "/api/generate-question-pdf",
    "/api/generate-answer-key-pdf",
    "/api/generate-corrected-sheet",
    "/api/upload-answer-key",
  ],
  llmLimiter
);

app.use("/api",questionRoutes );
app.use("/api",answerKeyRoutes);
app.use("/api",evaluationRoutes);
app.use("/api",reportRoutes);
app.use("/api", correctedRoutes);
app.use("/api", ragRoutes);
app.use("/api/auth", authRoutes);



app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
