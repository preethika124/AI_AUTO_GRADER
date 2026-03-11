from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import textwrap
import re
import uuid
import os

def clean_text(text):
    """
    Remove markdown and strange characters
    """

    text = re.sub(r"\*\*", "", text)   # remove **
    text = re.sub(r"[^\x00-\x7F]+", "", text)  # remove unicode
    return text


def generate_answer_key_pdf(answer_keys):
    os.makedirs("ai_service/generated_pdfs", exist_ok=True)

    file_id = str(uuid.uuid4())

    filename = f"ai_service/generated_pdfs/answer_key_{file_id}.pdf"


    c = canvas.Canvas(filename, pagesize=letter)

    width, height = letter
    y = height - 50


    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, y, "Answer Key")

    y -= 40

    c.setFont("Helvetica", 12)


    for q, ans in answer_keys.items():

        ans = clean_text(ans)

        text = f"Q{q}: {ans}"

        wrapped_lines = textwrap.wrap(text, 90)

        for line in wrapped_lines:

            c.drawString(50, y, line)

            y -= 20

            if y < 80:
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 50

        y -= 10


    c.save()

    return f"generated_pdfs/answer_key_{file_id}.pdf"