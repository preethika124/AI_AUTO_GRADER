// import React, { useState } from "react";
// import API from "../services/api";

// function AnswerKeySection({ questions, schemas, answerKeys, setAnswerKeys }) {

//   const [uploadedFile, setUploadedFile] = useState("");

//   const generateAnswerKeys = async () => {

//     const res = await API.post("/generate-answer-key", {
//       questions,
//       schemas
//     });

//     setAnswerKeys(res.data.answer_keys);
//   };

//   const uploadAnswerKey = async (e) => {

//     const file = e.target.files[0];
//     if (!file) return;

//     setUploadedFile(file.name);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {

//       const res = await API.post(
//         "/upload-answer-key",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
//         }
//       );

//       console.log("Uploaded Answer Keys:", res.data.answer_keys);

//       setAnswerKeys(res.data.answer_keys);

//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const generatePDF = async () => {

//     const res = await API.post(
//       "/generate-answer-key-pdf",
//       { answer_keys: answerKeys }
//     );

//     const file = res.data.file;

//     window.open(`http://localhost:8000/${file}`);
//   };

//   return (

//     <div className="bg-slate-800 p-8 rounded-xl mb-8">

//       <h2 className="text-2xl font-semibold mb-6">
//         Answer Key
//       </h2>

//       <button
//         className="btn mb-6"
//         onClick={generateAnswerKeys}
//       >
//         Generate Answer Key
//       </button>

//       {/* Upload */}

//       <label className="upload block cursor-pointer">

//         Upload Answer Key PDF

//         <input
//           type="file"
//           accept="application/pdf"
//           className="hidden"
//           onChange={uploadAnswerKey}
//         />

//       </label>

//       {uploadedFile && (

//         <p className="text-green-400 mt-3">
//           Uploaded: {uploadedFile}
//         </p>

//       )}

//       {/* Display keys */}

//       <div className="mt-6 space-y-4">

//         {Object.entries(answerKeys || {}).map(([q, ans]) => (

//           <div
//             key={q}
//             className="bg-slate-700 p-4 rounded-lg"
//           >

//             <b>Q{q}</b>

//             <p className="mt-2 text-gray-300">
//               {ans}
//             </p>

//           </div>

//         ))}

//       </div>

//       {Object.keys(answerKeys || {}).length > 0 && (

//         <button
//           className="btn mt-6"
//           onClick={generatePDF}
//         >
//           Download Answer Key PDF
//         </button>

//       )}

//     </div>
//   );
// }

// export default AnswerKeySection;



import React, { useState } from "react";
import API from "../services/api";

function AnswerKeySection({ questions, schemas, answerKeys, setAnswerKeys }) {

  const [uploadedFile, setUploadedFile] = useState("");

  const [loadingAI, setLoadingAI] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const generateAnswerKeys = async () => {

    setLoadingAI(true);

    try {

      const res = await API.post("/generate-answer-key", {
        questions,
        schemas
      });

      setAnswerKeys(res.data.answer_keys);

    } catch (err) {

      console.error(err);
      alert("Failed to generate answer key");

    } finally {

      setLoadingAI(false);

    }

  };

  const uploadAnswerKey = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file.name);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {

      const res = await API.post(
        "/upload-answer-key",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Uploaded Answer Keys:", res.data.answer_keys);

      setAnswerKeys(res.data.answer_keys);

    } catch (err) {

      console.error(err);
      alert("Upload failed");

    } finally {

      setUploading(false);

    }
  };

  const generatePDF = async () => {

    setLoadingPDF(true);

    try {

      const res = await API.post(
        "/generate-answer-key-pdf",
        { answer_keys: answerKeys }
      );

      const file = res.data.file;

      window.open(`http://localhost:8000/${file}`);

    } catch (err) {

      console.error(err);
      alert("PDF generation failed");

    } finally {

      setLoadingPDF(false);

    }

  };

  return (

    <div className="bg-slate-800 p-8 rounded-xl mb-8">

      <h2 className="text-2xl font-semibold mb-6">
        Answer Key
      </h2>

      <button
        className="btn mb-6"
        onClick={generateAnswerKeys}
        disabled={loadingAI}
      >
        {loadingAI ? "Generating Answer Key..." : "Generate Answer Key"}
      </button>

      {loadingAI && (
        <div className="flex items-center gap-3 text-yellow-400 mb-6">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          AI is generating answer keys...
        </div>
      )}

      {/* Upload */}

      <label className="upload block cursor-pointer">

        Upload Answer Key PDF

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={uploadAnswerKey}
        />

      </label>

      {uploading && (
        <div className="flex items-center gap-3 text-yellow-400 mt-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Uploading answer key...
        </div>
      )}

      {uploadedFile && (
        <p className="text-green-400 mt-3">
          Uploaded: {uploadedFile}
        </p>
      )}

      {/* Display keys */}

      <div className="mt-6 space-y-4">

        {Object.entries(answerKeys || {}).map(([q, ans]) => (

          <div
            key={q}
            className="bg-slate-700 p-4 rounded-lg"
          >

            <b>Q{q}</b>

            <p className="mt-2 text-gray-300">
              {ans}
            </p>

          </div>

        ))}

      </div>

      {Object.keys(answerKeys || {}).length > 0 && (

        <button
          className="btn mt-6"
          onClick={generatePDF}
          disabled={loadingPDF}
        >
          {loadingPDF ? "Generating PDF..." : "Download Answer Key PDF"}
        </button>

      )}

      {loadingPDF && (
        <div className="flex items-center gap-3 text-yellow-400 mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Creating PDF document...
        </div>
      )}

    </div>
  );
}

export default AnswerKeySection;

