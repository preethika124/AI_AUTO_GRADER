const { generateCorrectedSheet } = require("../services/aiService");

exports.generateCorrectedSheet = async (req,res)=>{

  try{

    const result = await generateCorrectedSheet(req.body);

    res.json(result);

  }catch(err){

    console.error(err);

    res.status(500).json({
      error:"Corrected sheet generation failed"
    });

  }

}