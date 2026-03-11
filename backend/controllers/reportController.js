const { generateReportPDF } = require("../services/aiService");



exports.generateReportPDF = async (req,res)=>{


  try{

    const result = await generateReportPDF(req.body);

    res.json(result);

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      error:"Report PDF generation failed"
    });

  }

};