from modules.ocr_module import extract_text_from_pdf
from utils.answer_segmenter import segment_answers


def process_answer_sheet(pdf_path):

    text = extract_text_from_pdf(pdf_path)

    answers = segment_answers(text)

    return answers