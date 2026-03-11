import React, { Suspense, lazy, useState } from "react";
import Card from "../components/Card";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import { FileText, Key, CheckCircle, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";

const QuestionPaperSection = lazy(() => import("../components/QuestionPaperSection"));
const AnswerKeySection = lazy(() => import("../components/AnswerKeySection"));
const EvaluationSection = lazy(() => import("../components/EvaluationSection"));
const RagUploader = lazy(() => import("../components/RagUploader"));

function SectionLoader({ text = "Loading section..." }) {
  return <p className="text-slate-300">{text}</p>;
}

function Dashboard() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [answerKeys, setAnswerKeys] = useState({});

  const logout = async () => {
    await API.post("/auth/logout");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-10 py-10">
      {/* Header */}
      <button
        onClick={logout}
        className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 mb-4"
      >
        Logout
      </button>
      <motion.div
        initial={{ opacity:0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6 }}
        className="text-center mb-14"
      >

        <h1 className="text-5xl font-bold mb-3">
          AI Auto Grading System
        </h1>

        <p className="text-lg text-gray-300">
          Let's make <span className="text-blue-400 font-semibold">teachers life easier</span> with AI-powered grading
        </p>

      </motion.div>


      {/* Workflow Steps */}

      <div className="grid md:grid-cols-4 gap-6 mb-14">

        <Step icon={<UploadCloud size={30} />} title="Upload Knowledge" />

        <Step icon={<FileText size={30} />} title="Create Questions" />

        <Step icon={<Key size={30} />} title="Generate Answer Key" />

        <Step icon={<CheckCircle size={30} />} title="Evaluate Answers" />

      </div>


      {/* Upload Knowledge */}

      <Card title="Upload Course Material (Knowledge Base)">
        <Suspense fallback={<SectionLoader text="Loading uploader..." />}>
          <RagUploader/>
        </Suspense>

      </Card>


      {/* Question Paper */}

      <Card title="Create Question Paper">
        <Suspense fallback={<SectionLoader text="Loading question tools..." />}>
          <QuestionPaperSection
            questions={questions}
            setQuestions={setQuestions}
            schemas={schemas}
            setSchemas={setSchemas}
          />
        </Suspense>

      </Card>


      {/* Answer Key */}

      <Card title="Generate Answer Key">
        <Suspense fallback={<SectionLoader text="Loading answer key tools..." />}>
          <AnswerKeySection
            questions={questions}
            schemas={schemas}
            answerKeys={answerKeys}
            setAnswerKeys={setAnswerKeys}
          />
        </Suspense>

      </Card>


      {/* Evaluation */}

      <Card title="Evaluate Student Answer Sheet">
        <Suspense fallback={<SectionLoader text="Loading evaluation tools..." />}>
          <EvaluationSection
            questions={questions}
            schemas={schemas}
            answerKeys={answerKeys}
          />
        </Suspense>

      </Card>

    </div>
  );
}


/* Step Card */

function Step({ icon, title }) {

  return (

    <motion.div
      whileHover={{ scale:1.05 }}
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4 }}
      className="bg-slate-800 p-6 rounded-xl shadow-lg text-center border border-slate-700"
    >

      <div className="flex justify-center text-blue-400 mb-3">
        {icon}
      </div>

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

    </motion.div>

  );

}

export default Dashboard;
