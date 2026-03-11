const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

const questionController = require("../controllers/questionController");

router.post(
  "/generate-questions", authMiddleware,
  questionController.generateQuestions
);


router.post(
  "/generate-question-pdf", authMiddleware,
  questionController.generateQuestionPDF
);

module.exports = router;