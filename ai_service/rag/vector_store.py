import numpy as np
from sentence_transformers import SentenceTransformer
import os
from huggingface_hub import login

try:
    import faiss  # type: ignore
except Exception:
    faiss = None

model = None

documents = []
embeddings = []

index = None


def get_model():
    global model
    if model is None:
        hf_token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACEHUB_API_TOKEN")
        if hf_token:
            login(token=hf_token, add_to_git_credential=False)
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model


def add_document(text):

    emb = get_model().encode(text)

    documents.append(text)
    embeddings.append(emb)


def build_index():

    global index

    if len(embeddings) == 0:
        return

    vectors = np.array(embeddings, dtype=np.float32)

    if faiss is None:
        index = vectors
        return

    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)


def search(query, k=3):

    if index is None:
        return []

    q_emb = np.array(get_model().encode([query]), dtype=np.float32)

    if faiss is None:
        dists = np.linalg.norm(index - q_emb[0], axis=1)
        ids = np.argsort(dists)[:k]
        return [documents[i] for i in ids if i < len(documents)]

    distances, ids = index.search(q_emb, k)

    results = []

    for i in ids[0]:

        if i < len(documents):
            results.append(documents[i])

    return results
