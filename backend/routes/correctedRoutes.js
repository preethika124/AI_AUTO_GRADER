const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const correctedController = require("../controllers/correctedController");

router.post(
  "/generate-corrected-sheet", authMiddleware,
  correctedController.generateCorrectedSheet
);

module.exports = router;
