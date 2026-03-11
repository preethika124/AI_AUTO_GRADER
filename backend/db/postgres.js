const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { DATABASE_URL } = process.env;

if (!DATABASE_URL || typeof DATABASE_URL !== "string") {
  throw new Error(
    "DATABASE_URL is missing. Set it in the project root .env file."
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

module.exports = pool;
