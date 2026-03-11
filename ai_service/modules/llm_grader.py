import json
from groq import Groq
import os
from ai_service.rag.retriever import retrieve_context

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)


def grade_with_rubric(question, student_answer, answer_key, schema):
    context = retrieve_context(question)
    schema_text = "\n".join(
        [f"{k}: {v} marks" for k, v in schema.items()]
    )

    prompt = f"""

    Reference material:

{context}


You are a strict university examiner.

Evaluate the student's answer using the rubric.

Question:
{question}

Answer Key:
{answer_key}

Student Answer:
{student_answer}

Evaluation Rubric:
{schema_text}

Grading method:

For each rubric criterion:

1. Carefully evaluate how well the student addressed it.
2. Determine the quality level:
   - Complete and correct
   - Mostly correct but missing details
   - Partially correct
   - Incorrect or missing
3. Assign marks proportionally based on quality.
4. Explain what is correct and what is missing.
5.use anser key as refernce
6. The answer must be releavant to given question.. this is very important...****

Marks must reflect answer quality.

Return STRICT JSON:
IMPORTANT OUTPUT RULES:

• Return ONLY valid JSON.
• Do NOT write explanations outside JSON.
• Do NOT include headings like "Evaluation".
• Do NOT include markdown.
• Do NOT include ```json blocks.

The response MUST follow this EXACT structure:

{{
 "criteria":[
   {{
     "name":"criterion",
     "quality":"complete / mostly correct / partial / incorrect",
     "marks_awarded":number,
     "max_marks":number,
     "feedback":"specific explanation"
   }}
 ],
 "total_marks":number
}}
"""


    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    result = response.choices[0].message.content

    try:
        return json.loads(result)
    except:
        return {"error": result}