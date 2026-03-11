import json
from groq import Groq
from ai_service.rag.retriever import retrieve_context
import os

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)


def generate_question_paper(topic, num_questions, total_marks):
    context=retrieve_context(topic)
    marks_per_question = total_marks // num_questions

    prompt = f"""

    Use the following study material:

{context}
Generate a question paper.

Topic: {topic}
Number of Questions: {num_questions}
Total Marks: {total_marks}

Each question should have {marks_per_question} marks.

Return ONLY valid JSON in this format:

[
  {{"question": "Question text here", "marks": {marks_per_question}}},
  {{"question": "Question text here", "marks": {marks_per_question}}}
]

Important Rules:
- Return ONLY JSON
- Do NOT include explanation
- Do NOT include headings
- Do NOT include markdown
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    result = response.choices[0].message.content.strip()

    try:
        questions = json.loads(result)
    except:
        questions = []

    return questions[:num_questions]