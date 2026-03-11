import React, { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

function QuestionPaperSection({ questions, setQuestions, schemas, setSchemas }) {

  const [mode, setMode] = useState("ai");
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const schemaOptions = [
    "Definition",
    "Explanation",
    "Example",
    "Application",
    "Diagram"
  ];

  // Generate questions using AI
  const generateQuestions = async () => {

    if (!topic || !numQuestions || !totalMarks) {
      alert("Please fill all fields");
      return;
    }

    const res = await API.post("/generate-questions", {
      topic,
      num_questions: numQuestions,
      total_marks: totalMarks
    });

    setQuestions(res.data.questions);
  };

  // Create manual question fields
  const createManualQuestions = () => {

    const arr = [];

    for (let i = 0; i < numQuestions; i++) {

      arr.push({
        question: "",
        marks: Math.floor(totalMarks / numQuestions)
      });

    }

    setQuestions(arr);
  };

  // Update question text
  const updateQuestion = (index, value) => {

    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  // Update question marks
  const updateMarks = (index, value) => {

    const updated = [...questions];
    updated[index].marks = value === "" ? "" : parseInt(value);
    setQuestions(updated);
  };

  // Update schema values (FIXED FOR BACKSPACE)
  const updateSchema = (qIndex, criterion, value) => {

    const newSchemas = { ...schemas };

    if (!newSchemas[qIndex]) newSchemas[qIndex] = {};

    newSchemas[qIndex][criterion] =
      value === "" ? "" : parseInt(value);

    setSchemas(newSchemas);
  };

  // Calculate schema total
  const schemaTotal = (index) => {

    if (!schemas[index]) return 0;

    return Object.values(schemas[index])
      .reduce((a, b) => a + (b || 0), 0);
  };

  // Total question marks
  const totalQuestionMarks = () => {

    return questions.reduce(
      (sum, q) => sum + (q.marks || 0),
      0
    );
  };

  return (

    <div>

      {/* Mode selector */}

      <div className="flex gap-6 mb-6">

        <label className="flex items-center gap-2">

          <input
            type="radio"
            checked={mode === "ai"}
            onChange={() => setMode("ai")}
          />

          Generate with AI

        </label>

        <label className="flex items-center gap-2">

          <input
            type="radio"
            checked={mode === "manual"}
            onChange={() => setMode("manual")}
          />

          Create Manually

        </label>

      </div>

      {/* Inputs */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <input
          className="input"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Number of Questions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Total Marks"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
        />

      </div>

      {/* AI Mode */}

      {mode === "ai" && (

        <button
          className="btn mb-6"
          onClick={generateQuestions}
        >
          Generate Questions
        </button>

      )}

      {/* Manual Mode */}

      {mode === "manual" && (

        <button
          className="btn mb-6"
          onClick={createManualQuestions}
        >
          Create Question Fields
        </button>

      )}

      {/* Question Cards */}

      <div className="space-y-6">

        {questions.map((q, index) => (

          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-700 p-5 rounded-lg"
          >

            <h3 className="font-semibold mb-2">
              Question {index + 1}
            </h3>

            <textarea
              className="input"
              value={q.question}
              onChange={(e) => updateQuestion(index, e.target.value)}
            />

            {/* Marks */}

            <div className="flex gap-3 items-center mt-3">

              <label className="w-24">
                Marks
              </label>

              <input
                type="number"
                className="input w-32"
                value={q.marks ?? ""}
                onChange={(e) =>
                  updateMarks(index, e.target.value)
                }
              />

            </div>

            {/* Schema */}

            <h4 className="mt-4 font-semibold">
              Evaluation Schema
            </h4>

            {schemaOptions.map(option => (

              <div
                key={option}
                className="flex gap-3 mt-2"
              >

                <label className="w-40">
                  {option}
                </label>

               
<input
className="input w-32"
type="text"
inputMode="numeric"
value={schemas[index]?.[option] ?? ""}
onChange={(e) => {

  const val = e.target.value;

  if (/^\d*$/.test(val)) {
    updateSchema(index, option, val);
  }

}}
/>
              </div>

            ))}

            {/* Schema Validation */}

            {schemaTotal(index) !== q.marks && (

              <p className="text-red-400 mt-2">
                Schema marks must equal question marks
              </p>

            )}

          </motion.div>

        ))}

      </div>

      {/* Total Marks Validation */}

      {questions.length > 0 &&
        totalQuestionMarks() !== Number(totalMarks) && (

          <p className="text-red-400 mt-6">
            Total question marks must equal exam total marks
          </p>

        )}

    </div>

  );

}

export default QuestionPaperSection;