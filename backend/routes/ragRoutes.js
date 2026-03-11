const router = require("express").Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const authMiddleware = require("../middleware/auth");
const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

router.post("/upload-rag-documents", authMiddleware, upload.array("files"), async (req, res) => {

  try {

    console.log("FILES RECEIVED:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const formData = new FormData();

    req.files.forEach(file => {

      formData.append(
        "files",
        file.buffer,
        {
          filename: file.originalname,
          contentType: file.mimetype
        }
      );

    });

    const response = await axios.post(
      `${AI_URL}/upload-rag-documents`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    res.json(response.data);

  } catch (err) {

    console.error("RAG Upload Error:", err.response?.data || err);

    res.status(500).json({
      error: "RAG upload failed"
    });

  }

});

module.exports = router;
