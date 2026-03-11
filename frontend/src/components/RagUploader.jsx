import React, { useState } from "react";
import API from "../services/api";

function RagUploader() {

  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const uploadFiles = async () => {

    if (files.length === 0) {
      alert("Please select PDFs first");
      return;
    }

    const formData = new FormData();

    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      await API.post("/upload-rag-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Knowledge uploaded!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    }

  };

  return (

    <div className="bg-slate-800 p-8 rounded-xl mb-8">

      <h2 className="text-2xl font-semibold mb-6 text-white">
        Upload Course Material
      </h2>

      {/* Upload Box */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-500 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition">

        <input
          type="file"
          multiple
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <span className="text-blue-400 text-lg font-medium">
          📄 Choose PDF Files
        </span>

        <span className="text-sm text-slate-400 mt-1">
          or drag & drop here
        </span>

      </label>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mt-4 text-sm text-slate-300">
          {files.map((file, index) => (
            <div key={index}>• {file.name}</div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        className="mt-5 bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg text-white font-medium transition"
        onClick={uploadFiles}
      >
        Upload PDFs
      </button>

    </div>

  );

}

export default RagUploader;