const express = require("express");
const multer=require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const answerKeyController = require("../controllers/answerKeyController");
const { uploadAnswerKey } = require("../controllers/answerKeyController");

router.post(
  "/generate-answer-key", authMiddleware,
  answerKeyController.generateAnswerKey
);
router.post(
"/generate-answer-key-pdf", authMiddleware,
answerKeyController.generateAnswerKeyPDF
);
router.post("/upload-answer-key",  authMiddleware,upload.single("file"),uploadAnswerKey);

module.exports = router;
