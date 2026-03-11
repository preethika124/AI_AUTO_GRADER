from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import textwrap
import re
import os
import uuid


def clean_text(text):
    text = re.sub(r"\*\*", "", text)
    text = re.sub(r"[^\x00-\x7F]+", "", text)
    return text


def generate_report_pdf(results, total_marks, max_total, message):

    os.makedirs("ai_service/generated_pdfs", exist_ok=True)

    file_id = str(uuid.uuid4())
    filename = f"ai_service/generated_pdfs/report_{file_id}.pdf"

    c = canvas.Canvas(filename, pagesize=letter)

    width, height = letter
    y = height - 60

    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, y, "Student Report Card")

    y -= 40
    c.setFont("Helvetica", 12)

    for i, r in enumerate(results):

        question = clean_text(r["question"])
        marks = r["marks"]
        max_marks = r["max_marks"]

        wrapped_lines = textwrap.wrap(f"Q{i+1}: {question}", 90)

        for line in wrapped_lines:
            c.drawString(50, y, line)
            y -= 18

            if y < 100:
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 60

        c.drawString(70, y, f"Marks: {marks} / {max_marks}")
        y -= 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Total Marks: {total_marks} / {max_total}")

    y -= 30

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Remark: {message}")

    c.save()

    return f"generated_pdfs/report_{file_id}.pdf"