const axios = require("axios");
const FormData = require("form-data");
const fs=require("fs");


const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";



exports.generateQuestions = async (data) => {

  const response = await axios.post(
    `${AI_URL}/generate-questions`,
    data
  );

  return response.data;

};
exports.uploadAnswerKey = async (file)=>{

const form = new FormData()

form.append(
"file",
fs.createReadStream(file.path)
)

const response = await axios.post(

`${AI_URL}/upload-answer-key`,
form,
{
headers:form.getHeaders()
}

)

return response.data

}

exports.generateAnswerKey = async (data) => {

  const questions = data.questions.map((q, index) => ({
    question: q.question,
    schema: data.schemas[index]
  }));

  const response = await axios.post(
    `${AI_URL}/generate-answer-key`,
    { questions }
  );

  return response.data;
};






exports.evaluateAnswers = async (file, questions,  answerKeys) => {

  if (!file) {
    throw new Error("File not uploaded");
  }

  // merge schema into questions
  const formattedQuestions = questions.map((q, i) => ({
    question: q.question,
    schema: q.schema
  }));

  const form = new FormData();

  form.append(
    "file",
     file.buffer,
     file.originalname
  );

  form.append(
    "data",
    JSON.stringify({
      questions: formattedQuestions,
      answer_keys: answerKeys
    })
  );

  const response = await axios.post(
    `${AI_URL}/evaluate`,
    form,
    { headers: form.getHeaders() }
  );

  return response.data;
};
exports.generateReportPDF = async (data) => {

  const response = await axios.post(
    `${AI_URL}/generate-report-pdf`,
    data
  );

  return response.data;

};

exports.generateQuestionPDF = async (data) => {

  const response = await axios.post(
    `${AI_URL}/generate-question-pdf`,
    data,
    {
      responseType: "arraybuffer"
    }
  );

  return response.data;

};

exports.generateAnswerKeyPDF = async (data) => {

  const response = await axios.post(
    `${AI_URL}/generate-answer-key-pdf`,
    data
  );

  return response.data;

};


exports.generateCorrectedSheet = async (data) => {

  const response = await axios.post(
    `${AI_URL}/generate-corrected-sheet`,
    data
  );

  return response.data;
};


