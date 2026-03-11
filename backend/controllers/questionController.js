const { generateQuestions, generateQuestionPDF } = require("../services/aiService");

exports.generateQuestions = async (req,res)=>{

  try{

    const result = await generateQuestions(req.body);

    res.json(result);

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      error:"Question generation failed"
    });

  }

};







exports.generateQuestionPDF = async(req,res)=>{

  try{

    const result = await generateQuestionPDF(req.body);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=question_paper.pdf');

    // Send the PDF bytes directly
    res.send(result);

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      error:"PDF generation failed"
    });

  }

};