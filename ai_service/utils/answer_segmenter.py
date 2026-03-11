import re

def segment_answers(text):

    answers = {}

    # Find all question markers (Q1, Q2, Q3 etc)
    matches = list(re.finditer(r"Q(\d+)\s*[:\-]?", text))

    for i in range(len(matches)):

        qnum = matches[i].group(1)

        start = matches[i].end()

        if i + 1 < len(matches):
            end = matches[i+1].start()
        else:
            end = len(text)

        answer = text[start:end].strip()

        answers[qnum] = answer

    return answers