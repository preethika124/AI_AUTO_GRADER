
const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const reportController = require("../controllers/reportController");

router.post(
  "/generate-report-pdf", authMiddleware,
  reportController.generateReportPDF
);


module.exports=router;
