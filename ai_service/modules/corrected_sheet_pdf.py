from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import textwrap
import os
import uuid


def check_page_space(c, y, height, font="Helvetica", size=11, needed=20):
    """
    Ensures there is enough space on the page before writing a new line.
    If not, create a new page.
    """
    if y < needed:
        c.showPage()
        c.setFont(font, size)
        return height - 60
    return y


def generate_corrected_sheet(results, total, max_total):

    os.makedirs("ai_service/generated_pdfs", exist_ok=True)

    file_id = str(uuid.uuid4())
    filename = f"ai_service/generated_pdfs/corrected_{file_id}.pdf"

    c = canvas.Canvas(filename, pagesize=letter)

    width, height = letter
    y = height - 60

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, y, "Corrected Answer Sheet")

    y -= 40
    c.setFont("Helvetica", 12)

    for i, r in enumerate(results):

        question = r.get("question", "")
        student = r.get("student_answer", "")
        key = r.get("correct_answer", "")
        marks = r.get("marks", 0)
        max_marks = r.get("max_marks", 0)

        # -------------------
        # QUESTION
        # -------------------
        wrapped_question = textwrap.wrap(f"Q{i+1}: {question}", 90)

        for line in wrapped_question:
            y = check_page_space(c, y, height)
            c.drawString(50, y, line)
            y -= 18

        y -= 5

        # -------------------
        # STUDENT ANSWER
        # -------------------
        y = check_page_space(c, y, height)

        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Student Answer:")
        y -= 18

        c.setFont("Helvetica", 11)

        for line in textwrap.wrap(student, 90):
            y = check_page_space(c, y, height)
            c.drawString(60, y, line)
            y -= 16

        y -= 5

        # -------------------
        # CORRECT ANSWER
        # -------------------
        y = check_page_space(c, y, height)

        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Correct Answer:")
        y -= 18

        c.setFont("Helvetica", 11)

        for line in textwrap.wrap(key, 90):
            y = check_page_space(c, y, height)
            c.drawString(60, y, line)
            y -= 16

        y -= 5

        # -------------------
        # MARKS
        # -------------------
        y = check_page_space(c, y, height)

        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, f"Marks: {marks} / {max_marks}")
        y -= 18

        # -------------------
        # FEEDBACK
        # -------------------
        y = check_page_space(c, y, height)

        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, y, "Feedback:")
        y -= 18

        c.setFont("Helvetica", 11)

        for crit in r.get("criteria", []):

            fb = crit.get("feedback", "")

            for line in textwrap.wrap(fb, 90):
                y = check_page_space(c, y, height)
                c.drawString(60, y, line)
                y -= 16

        y -= 25

    # -------------------
    # TOTAL MARKS
    # -------------------
    y = check_page_space(c, y, height)

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, f"Total Marks: {total} / {max_total}")

    c.save()

    return f"generated_pdfs/corrected_{file_id}.pdf"