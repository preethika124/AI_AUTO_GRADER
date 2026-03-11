
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const reportController = require("../controllers/reportController");

router.post(
  "/generate-report-pdf", authMiddleware,
  reportController.generateReportPDF
);


module.exports=router;