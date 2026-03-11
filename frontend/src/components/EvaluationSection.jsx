// 

import React, { useState } from "react";
import API from "../services/api";

function EvaluationSection({ questions, answerKeys, schemas }) {

  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [maxTotal, setMaxTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const evaluateAnswers = async () => {

    if (!file) {
      alert("Upload student answer sheet first");
      return;
    }

    setLoading(true);

    try {

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "data",
        JSON.stringify({
          questions: questions.map((q, index) => ({
            question: q.question,
            schema: schemas[index]
          })),
          answer_keys: answerKeys
        })
      );

      console.log("Sending answer keys:", answerKeys);

      const res = await API.post(
        "/evaluate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResults(res.data.results);
      setTotal(res.data.total);
      setMaxTotal(res.data.max_total);

    } catch (err) {

      console.error(err);
      alert("Evaluation failed");

    } finally {

      setLoading(false);

    }
  };


  const downloadCorrectedSheet = async () => {

    const res = await API.post(
      "/generate-corrected-sheet",
      {
        results,
        total,
        max_total: maxTotal
      }
    );

    window.open(`http://localhost:8000/${res.data.file}`);
  };


  const downloadReport = async () => {

    const res = await API.post(
      "/generate-report-pdf",
      {
        results,
        total,
        max_total: maxTotal
      }
    );

    window.open(`http://localhost:8000/${res.data.file}`);
  };


  return (

    <div className="bg-slate-800 p-8 rounded-xl mb-8">

      <h2 className="text-2xl font-semibold mb-6">
        Evaluate Student Answer Sheet
      </h2>

      {/* Upload student sheet */}

      <label className="upload block cursor-pointer">

        Upload Student Answer Sheet

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />

      </label>

      {file && (
        <p className="text-green-400 mt-3">
          Uploaded: {file.name}
        </p>
      )}

      {/* Evaluate button */}

      <button
        className="btn mt-4"
        onClick={evaluateAnswers}
        disabled={loading}
      >
        {loading ? "Evaluating... Please wait ⏳" : "Evaluate Answer Sheet"}
      </button>

      {/* Loading spinner */}

      {loading && (
        <div className="flex items-center gap-3 mt-4 text-yellow-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Processing answer sheet... This may take a few seconds.
        </div>
      )}

      {/* Results */}

      {results.length > 0 && (

        <div className="mt-8 space-y-6">

          {results.map((r, index) => (

            <div
              key={index}
              className="bg-slate-700 p-5 rounded-lg"
            >

              <h3 className="font-semibold">
                Question {index + 1}
              </h3>

              <p>
                Marks: {r.marks} / {r.max_marks}
              </p>

              {r.criteria.map((c, i) => (

                <div key={i} className="mt-2">

                  <p className="font-semibold">
                    {c.name}
                  </p>

                  <p>
                    {c.marks_awarded} / {c.max_marks}
                  </p>

                  <p className="text-gray-300">
                    {c.feedback}
                  </p>

                </div>

              ))}

            </div>

          ))}

          <h3 className="text-lg font-semibold">
            Total Score: {total} / {maxTotal}
          </h3>

          <button
            className="btn mt-4"
            onClick={downloadCorrectedSheet}
          >
            Download Corrected Answer Sheet
          </button>

          <button
            className="btn ml-4"
            onClick={downloadReport}
          >
            Download Report Card
          </button>

        </div>

      )}

    </div>
  );
}

export default EvaluationSection;
