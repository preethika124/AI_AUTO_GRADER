// import React,{useState} from "react";
// import API from "../services/api";

// function QuestionPaperSection({questions,setQuestions,schemas,setSchemas}){

// const [mode,setMode]=useState("ai")
// const [topic,setTopic]=useState("")
// const [numQuestions,setNumQuestions]=useState("")
// const [totalMarks,setTotalMarks]=useState("")

// const schemaOptions=[
// "Definition",
// "Explanation",
// "Example",
// "Application",
// "Diagram"
// ]

// const generateQuestions=async()=>{

// const res=await API.post("/generate-questions",{
// topic,
// num_questions:numQuestions,
// total_marks:totalMarks
// })

// setQuestions(res.data.questions)

// }

// const createManualQuestions=()=>{

// const arr=[]

// for(let i=0;i<numQuestions;i++){

// arr.push({
// question:"",
// marks:Math.floor(totalMarks/numQuestions)
// })

// }

// setQuestions(arr)

// }

// const updateQuestion=(index,value)=>{

// const updated=[...questions]
// updated[index].question=value
// setQuestions(updated)

// }

// const updateMarks=(index,value)=>{

// const updated=[...questions]
// updated[index].marks=value
// setQuestions(updated)

// }

// const updateSchema=(qIndex,criterion,value)=>{

// const newSchemas={...schemas}

// if(!newSchemas[qIndex]) newSchemas[qIndex]={}

// newSchemas[qIndex][criterion]=value

// setSchemas(newSchemas)

// }

// const schemaTotal=(index)=>{

// if(!schemas[index]) return 0

// return Object.values(schemas[index])
// .reduce((a,b)=>a+Number(b||0),0)

// }

// const totalQuestionMarks=()=>{

// return questions.reduce(
// (sum,q)=>sum+Number(q.marks||0),0
// )

// }

// const generatePDF=async()=>{

// const res=await API.post(
// "/generate-question-pdf",
// {questions}
// )

// const file=res.data.file

// window.open(`http://localhost:8000/${file}`)

// }

// return(

// <div className="bg-slate-800 p-8 rounded-xl mb-8">

// <h2 className="text-2xl font-semibold mb-6">
// Create Question Paper
// </h2>

// <div className="flex gap-6 mb-6">

// <label>
// <input
// type="radio"
// checked={mode==="ai"}
// onChange={()=>setMode("ai")}
// />
// Generate with AI
// </label>

// <label>
// <input
// type="radio"
// checked={mode==="manual"}
// onChange={()=>setMode("manual")}
// />
// Create Manually
// </label>

// </div>

// <div className="grid md:grid-cols-3 gap-4 mb-6">

// <input
// className="input"
// placeholder="Topic"
// value={topic}
// onChange={e=>setTopic(e.target.value)}
// />

// <input
// className="input"
// type="number"
// placeholder="Number of Questions"
// value={numQuestions}
// onChange={e=>setNumQuestions(e.target.value)}
// />

// <input
// className="input"
// type="number"
// placeholder="Total Marks"
// value={totalMarks}
// onChange={e=>setTotalMarks(e.target.value)}
// />

// </div>

// {mode==="ai" && (

// <button
// className="btn mb-6"
// onClick={generateQuestions}
// >
// Generate Questions
// </button>

// )}

// {mode==="manual" && (

// <button
// className="btn mb-6"
// onClick={createManualQuestions}
// >
// Create Question Fields
// </button>

// )}

// <div className="space-y-6">

// {questions.map((q,index)=>(

// <div
// key={index}
// className="bg-slate-700 p-5 rounded-lg"
// >

// <h3 className="font-semibold mb-2">
// Question {index+1}
// </h3>

// <textarea
// className="input"
// value={q.question}
// onChange={(e)=>updateQuestion(index,e.target.value)}
// />

// <div className="flex gap-3 mt-3">

// <label>Marks</label>

// <input
// className="input w-24"
// type="number"
// value={q.marks||""}
// onChange={(e)=>updateMarks(index,e.target.value)}
// />

// </div>

// <h4 className="mt-4 font-semibold">
// Evaluation Schema
// </h4>

// {schemaOptions.map(option=>(

// <div
// key={option}
// className="flex gap-3 mt-2"
// >

// <label className="w-32">
// {option}
// </label>

// <input
// className="input w-24"
// type="text"
// inputMode="numeric"
// value={schemas[index]?.[option] ?? ""}
// onChange={(e)=>{

// const val=e.target.value

// if(/^\d*$/.test(val)){
// updateSchema(index,option,val)
// }

// }}
// />

// </div>

// ))}

// {schemaTotal(index)!==Number(q.marks) && (

// <p className="text-red-400 mt-2">
// Schema marks must equal question marks
// </p>

// )}

// </div>

// ))}

// </div>

// {questions.length>0 && totalQuestionMarks()!==Number(totalMarks) && (

// <p className="text-red-400 mt-6">
// Total question marks must equal exam total marks
// </p>

// )}

// <button
// className="btn mt-6"
// onClick={generatePDF}
// >
// Generate Question Paper PDF
// </button>

// </div>

// )

// }

// export default QuestionPaperSection 

import React,{useState} from "react";
import API from "../services/api";

function QuestionPaperSection({questions,setQuestions,schemas,setSchemas}){

const [mode,setMode]=useState("ai")
const [topic,setTopic]=useState("")
const [numQuestions,setNumQuestions]=useState("")
const [totalMarks,setTotalMarks]=useState("")

const [loadingAI,setLoadingAI]=useState(false)
const [loadingPDF,setLoadingPDF]=useState(false)

const schemaOptions=[
"Definition",
"Explanation",
"Example",
"Application",
"Diagram"
]

const generateQuestions=async()=>{

if(!topic || !numQuestions || !totalMarks){
alert("Fill topic, number of questions and total marks")
return
}

setLoadingAI(true)

try{

const res=await API.post("/generate-questions",{
topic,
num_questions:numQuestions,
total_marks:totalMarks
})

setQuestions(res.data.questions)

}catch(err){

console.error(err)
alert("Failed to generate questions")

}finally{

setLoadingAI(false)

}

}

const createManualQuestions=()=>{

const arr=[]

for(let i=0;i<numQuestions;i++){

arr.push({
question:"",
marks:Math.floor(totalMarks/numQuestions)
})

}

setQuestions(arr)

}

const updateQuestion=(index,value)=>{

const updated=[...questions]
updated[index].question=value
setQuestions(updated)

}

const updateMarks=(index,value)=>{

const updated=[...questions]
updated[index].marks=value
setQuestions(updated)

}

const updateSchema=(qIndex,criterion,value)=>{

const newSchemas={...schemas}

if(!newSchemas[qIndex]) newSchemas[qIndex]={}

newSchemas[qIndex][criterion]=value

setSchemas(newSchemas)

}

const schemaTotal=(index)=>{

if(!schemas[index]) return 0

return Object.values(schemas[index])
.reduce((a,b)=>a+Number(b||0),0)

}

const totalQuestionMarks=()=>{

return questions.reduce(
(sum,q)=>sum+Number(q.marks||0),0
)

}

const generatePDF=async()=>{

setLoadingPDF(true)

try{

const res=await API.post(
"/generate-question-pdf",
{questions}
)

const file=res.data.file

window.open(`http://localhost:8000/${file}`)

}catch(err){

console.error(err)
alert("PDF generation failed")

}finally{

setLoadingPDF(false)

}

}

return(

<div className="bg-slate-800 p-8 rounded-xl mb-8">

<h2 className="text-2xl font-semibold mb-6">
Create Question Paper
</h2>

<div className="flex gap-6 mb-6">

<label>
<input
type="radio"
checked={mode==="ai"}
onChange={()=>setMode("ai")}
/>
Generate with AI
</label>

<label>
<input
type="radio"
checked={mode==="manual"}
onChange={()=>setMode("manual")}
/>
Create Manually
</label>

</div>

<div className="grid md:grid-cols-3 gap-4 mb-6">

<input
className="input"
placeholder="Topic"
value={topic}
onChange={e=>setTopic(e.target.value)}
/>

<input
className="input"
type="number"
placeholder="Number of Questions"
value={numQuestions}
onChange={e=>setNumQuestions(e.target.value)}
/>

<input
className="input"
type="number"
placeholder="Total Marks"
value={totalMarks}
onChange={e=>setTotalMarks(e.target.value)}
/>

</div>

{mode==="ai" && (

<button
className="btn mb-6"
onClick={generateQuestions}
disabled={loadingAI}
>
{loadingAI ? "Generating Questions..." : "Generate Questions"}
</button>

)}

{loadingAI && (

<div className="flex items-center gap-3 text-yellow-400 mb-6">
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
AI is generating questions...
</div>

)}

{mode==="manual" && (

<button
className="btn mb-6"
onClick={createManualQuestions}
>
Create Question Fields
</button>

)}

<div className="space-y-6">

{questions.map((q,index)=>(

<div
key={index}
className="bg-slate-700 p-5 rounded-lg"
>

<h3 className="font-semibold mb-2">
Question {index+1}
</h3>

<textarea
className="input"
value={q.question}
onChange={(e)=>updateQuestion(index,e.target.value)}
/>

<div className="flex gap-3 mt-3">

<label>Marks</label>

<input
className="input w-24"
type="number"
value={q.marks||""}
onChange={(e)=>updateMarks(index,e.target.value)}
/>

</div>

<h4 className="mt-4 font-semibold">
Evaluation Schema
</h4>

{schemaOptions.map(option=>(

<div
key={option}
className="flex gap-3 mt-2"
>

<label className="w-32">
{option}
</label>

<input
className="input w-24"
type="text"
inputMode="numeric"
value={schemas[index]?.[option] ?? ""}
onChange={(e)=>{

const val=e.target.value

if(/^\d*$/.test(val)){
updateSchema(index,option,val)
}

}}
/>

</div>

))}

{schemaTotal(index)!==Number(q.marks) && (

<p className="text-red-400 mt-2">
Schema marks must equal question marks
</p>

)}

</div>

))}

</div>

{questions.length>0 && totalQuestionMarks()!==Number(totalMarks) && (

<p className="text-red-400 mt-6">
Total question marks must equal exam total marks
</p>

)}

<button
className="btn mt-6"
onClick={generatePDF}
disabled={loadingPDF}
>
{loadingPDF ? "Generating PDF..." : "Generate Question Paper PDF"}
</button>

{loadingPDF && (

<div className="flex items-center gap-3 text-yellow-400 mt-4">
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
Creating PDF document...
</div>

)}

</div>

)

}

export default QuestionPaperSection

