const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const evaluationController = require("../controllers/evaluationController");

const upload = require("../middleware/upload");

router.post(
  "/evaluate", authMiddleware,
  upload.single("file"),
  evaluationController.evaluate
);

module.exports = router;
