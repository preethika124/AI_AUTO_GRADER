from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import uuid


def generate_question_pdf(questions):

    os.makedirs("ai_service/generated_pdfs", exist_ok=True)

    file_id = str(uuid.uuid4())

    filename = f"ai_service/generated_pdfs/questions_{file_id}.pdf"

    c = canvas.Canvas(filename, pagesize=letter)

    width, height = letter
    y = height - 60

    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, y, "Question Paper")

    y -= 40

    total_marks = sum(int(q["marks"]) for q in questions)

    c.setFont("Helvetica", 12)

    for i, q in enumerate(questions):

        question = q["question"]
        marks = int(q["marks"])

        c.drawString(50, y, f"Q{i+1}. {question} ({marks} marks)")

        y -= 30

        if y < 100:
            c.showPage()
            c.setFont("Helvetica", 12)
            y = height - 60

    c.setFont("Helvetica-Bold", 14)

    c.drawString(50, y - 20, f"Total Marks: {total_marks}")

    c.save()

    return f"generated_pdfs/questions_{file_id}.pdf"