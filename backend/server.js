const express = require("express");
const cors = require("cors");
const compression = require("compression");
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
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
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

app.use("/api",questionRoutes );
app.use("/api",answerKeyRoutes);
app.use("/api",evaluationRoutes);
app.use("/api",reportRoutes);
app.use("/api", correctedRoutes);
app.use("/api", ragRoutes);
app.use("/api/auth", authRoutes);



app.listen(5000, () => {
  console.log("Backend server running on port 5000");
});
