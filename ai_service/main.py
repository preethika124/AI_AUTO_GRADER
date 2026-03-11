from fastapi import FastAPI,Form
from pydantic import BaseModel
from typing import Dict
from fastapi import UploadFile, File
from typing import List
from ai_service.modules.pdf_generator import generate_question_pdf
from fastapi.staticfiles import StaticFiles
import shutil
from ai_service.modules.answer_key_pdf import generate_answer_key_pdf
from ai_service.modules.ocr_module import extract_text_from_pdf
from ai_service.modules.llm_grader import grade_with_rubric
from ai_service.utils.answer_segmenter import segment_answers
from ai_service.modules.question_generator import generate_question_paper
from fastapi import UploadFile, File
from ai_service.utils.answer_segmenter import segment_answers
import shutil
from ai_service.modules.report_card_pdf import generate_report_pdf
from ai_service.modules.corrected_sheet_pdf import generate_corrected_sheet

app = FastAPI()


class QuestionRequest(BaseModel):
    topic: str
    num_questions: int
    total_marks: int


class QuestionPaperRequest(BaseModel):
    questions: list



class Question(BaseModel):
    question: str
    schema: Dict[str, int]

class AnswerKeyRequest(BaseModel):
   
    questions: List[Question]
class EvaluationRequest(BaseModel):
    questions: List[Question]
    answer_keys: Dict[str, str]


@app.get("/")
def home():
    return {"message": "AI Auto Grader Service Running"}

from typing import List
from ai_service.rag.knowledge_loader import load_pdfs


@app.post("/upload-rag-documents")
async def upload_rag_documents(files: List[UploadFile] = File(...)):

    import os
    if os.path.exists("knowledge"):
        shutil.rmtree("knowledge")

    os.makedirs("knowledge", exist_ok=True)

    saved = []

    for file in files:

        path = f"knowledge/{file.filename}"

        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        saved.append(path)

    load_pdfs("knowledge")

    return {
        "message": "RAG documents uploaded",
        "files": saved
    }

@app.post("/generate-questions")
def generate_questions(data: QuestionRequest):

    questions = generate_question_paper(
        data.topic,
        data.num_questions,
        data.total_marks
    )
 
    return {
        "questions": questions
    }


from ai_service.modules.answer_key_generator import generate_answer_key


@app.post("/generate-answer-key")
def generate_answer_key_api(data: AnswerKeyRequest):

    answer_keys = {}

    for i, q in enumerate(data.questions):

        key = generate_answer_key(
            q.question,
            q.schema
        )

        answer_keys[str(i + 1)] = key

    return {"answer_keys": answer_keys}

@app.post("/evaluate")
async def evaluate_answers(
    file: UploadFile = File(...),
    data: str = Form(...)
):

    import json

    request = json.loads(data)

    questions = request["questions"]
    answer_keys = request["answer_keys"]

    # save uploaded pdf
    file_location = "temp_student.pdf"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # OCR
    text = extract_text_from_pdf(file_location)

    student_answers = segment_answers(text)

    print("OCR TEXT:")
    print(text)

    print("SEGMENTED ANSWERS:")
    print(student_answers)

    total = 0
    max_total = 0
    results = []

    for i, q in enumerate(questions):

        qn = str(i+1)

        student = student_answers.get(qn, "")
        key = answer_keys.get(qn, "")

        result = grade_with_rubric(
            q["question"],
            student,
            key,
            q["schema"]
        )

        # ensure marks is numeric; allow fractions like "11/2"
        from fractions import Fraction
        raw_marks = result.get("total_marks", 0)
        try:
            if isinstance(raw_marks, str):
                marks = float(Fraction(raw_marks))
            else:
                marks = float(raw_marks)
        except Exception:
            marks = 0.0

        schema = q.get("schema", {})
        # convert schema values to float in case of decimals
        max_marks = sum(float(v) for v in schema.values())

        # clamp to maximum
        marks = min(marks, max_marks)

        total += marks
        max_total += max_marks

        # also sanitize criterion details
        criteria_list = []
        for c in result.get("criteria", []):
            crit = c.copy()
            try:
                awarded = crit.get("marks_awarded", 0)
                if isinstance(awarded, str):
                    awarded = float(Fraction(awarded))
                else:
                    awarded = float(awarded)
            except Exception:
                awarded = 0.0
            maxc = crit.get("max_marks", 0)
            try:
                maxc = float(maxc)
            except Exception:
                maxc = 0.0
            crit["marks_awarded"] = min(awarded, maxc)
            crit["max_marks"] = maxc
            criteria_list.append(crit)

        results.append({
            "question": q["question"],
            "student_answer": student,
            "correct_answer": key,
            "marks": marks,
            "max_marks": max_marks,
            "criteria": criteria_list
        })

    return {
        "results": results,
        "total": total,
        "max_total": max_total
    }


@app.post("/generate-question-pdf")
def generate_pdf(data: QuestionPaperRequest):

    filename = generate_question_pdf(data.questions)

    return {
        "file": filename
    }

app.mount(
    "/generated_pdfs",
    StaticFiles(directory="ai_service/generated_pdfs"),
    name="generated_pdfs"
)

@app.post("/generate-answer-key-pdf")
def generate_answer_key_pdf_api(data:dict):
    
    file = generate_answer_key_pdf(
        data["answer_keys"]
    )

    return {"file":file}


@app.post("/upload-answer-key")
async def upload_answer_key(file: UploadFile = File(...)):

    file_location = "temp_answer_key.pdf"

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text_from_pdf(file_location)

    answer_keys = segment_answers(text)

    return {
        "answer_keys": answer_keys
    }


@app.post("/generate-report-pdf")
def generate_report(data: dict):

    results = data["results"]
    total_marks = data["total"]
    max_total = data["max_total"]

    # Calculate percentage
    percentage = (total_marks / max_total) * 100

    if percentage >= 90:
        message = "Excellent"
    elif percentage >= 75:
        message = "Very Good"
    elif percentage >= 60:
        message = "Good"
    else:
        message = "Needs Improvement"

    filename = generate_report_pdf(
        results,
        total_marks,
        max_total,
        message
    )

    return {
        "file": filename
    }


@app.post("/generate-corrected-sheet")
def generate_corrected(data: dict):

    results = data["results"]
    total = data["total"]
    max_total = data["max_total"]

    file = generate_corrected_sheet(
        results,
        total,
        max_total
    )

    return {"file": file}