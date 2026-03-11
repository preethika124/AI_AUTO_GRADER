const { generateAnswerKey,generateAnswerKeyPDF } = require("../services/aiService");
const { uploadAnswerKey } = require("../services/aiService");

exports.uploadAnswerKey = async (req,res)=>{

try{

const result = await uploadAnswerKey(req.file)

res.json(result)

}

catch(err){

console.error(err)

res.status(500).json({
error:"Upload failed"
})

}

}
exports.generateAnswerKey = async (req,res)=>{

  try{

    const result = await generateAnswerKey(req.body);

    res.json(result);

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      error:"Answer key generation failed"
    });

  }

};

exports.generateAnswerKeyPDF = async (req, res) => {

  try {

    

    const result = await generateAnswerKeyPDF(req.body);



    res.json(result);

  } catch (err) {

  

    res.status(500).json({
      error: "PDF generation failed"
    });

  }
}


