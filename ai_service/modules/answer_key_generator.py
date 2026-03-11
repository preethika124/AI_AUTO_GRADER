from groq import Groq
import os
from ai_service.rag.retriever import retrieve_context

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)



def generate_answer_key(question, schema):
    context = retrieve_context(question)
    schema_points = ", ".join(schema.keys())

    prompt = f"""
Reference material:

{context}

    
You are an expert teacher writing a model answer.

Question:
{question}

The answer will be graded using these rubric criteria:
{schema_points}

Write a model answer that clearly covers these aspects.

Requirements:
• concise academic answer
• include all important concepts
• **** the important point to do care of  ensure the answer covers the rubric criteria which is very much required ******

Return ONLY the answer text.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()