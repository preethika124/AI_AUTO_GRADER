import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []
embeddings = []

index = None


def add_document(text):

    emb = model.encode(text)

    documents.append(text)
    embeddings.append(emb)


def build_index():

    global index

    if len(embeddings) == 0:
        return

    vectors = np.array(embeddings)

    index = faiss.IndexFlatL2(vectors.shape[1])

    index.add(vectors)


def search(query, k=3):

    if index is None:
        return []

    q_emb = model.encode([query])

    distances, ids = index.search(np.array(q_emb), k)

    results = []

    for i in ids[0]:

        if i < len(documents):
            results.append(documents[i])

    return results