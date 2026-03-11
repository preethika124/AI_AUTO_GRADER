from pdf2image import convert_from_path
import pytesseract
import cv2
import numpy as np

# Set tesseract path (change if different)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_pdf(pdf_path):

    images = convert_from_path(pdf_path)

    full_text = ""

    for img in images:

        img = np.array(img)

        # convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # improve contrast
        gray = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)[1]

        text = pytesseract.image_to_string(gray)

        full_text += text + "\n"

    return full_text