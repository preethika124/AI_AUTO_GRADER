import os
import fitz
from ai_service.rag.vector_store import add_document, build_index


def load_pdfs(folder="knowledge"):

    for file in os.listdir(folder):

        if file.endswith(".pdf"):

            path = os.path.join(folder, file)

            doc = fitz.open(path)

            text = ""

            for page in doc:
                text += page.get_text()

            chunks = text.split("\n\n")

            for c in chunks:

                c = c.strip()

                if len(c) > 50:
                    add_document(c)

    build_index()