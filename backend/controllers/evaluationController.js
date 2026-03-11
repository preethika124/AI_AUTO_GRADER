const { evaluateAnswers } = require("../services/aiService");

exports.evaluate = async (req, res) => {

  try {

    // Parse JSON string from form-data
    console.log(req.body);
    console.log("FILE:", req.file);
console.log("BODY:", req.body);
    const parsedData = JSON.parse(req.body.data);

    const questions = parsedData.questions;
    const schemas = parsedData.schemas;
    const answerKeys = parsedData.answer_keys;

    const result = await evaluateAnswers(
      req.file,
      questions,
  
      answerKeys
    );

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Evaluation failed"
    });

  }

};