from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit
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

    left_margin = 50
    right_margin = 50
    max_text_width = width - left_margin - right_margin
    line_height = 18

    total_marks = sum(int(q["marks"]) for q in questions)

    c.setFont("Helvetica", 12)

    for i, q in enumerate(questions):

        question = q["question"]
        marks = int(q["marks"])
        line_text = f"Q{i+1}. {question} ({marks} marks)"
        wrapped_lines = simpleSplit(line_text, "Helvetica", 12, max_text_width)

        for line in wrapped_lines:
            if y < 100:
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 60
            c.drawString(left_margin, y, line)
            y -= line_height

        y -= 8

    c.setFont("Helvetica-Bold", 14)

    if y < 100:
        c.showPage()
        y = height - 60

    c.drawString(left_margin, y - 20, f"Total Marks: {total_marks}")

    c.save()

    return f"generated_pdfs/questions_{file_id}.pdf"
