from ai_service.rag.vector_store import search


def retrieve_context(query, max_docs=3, max_chars=3000, per_doc_chars=1200):

    docs = search(query, k=max_docs)

    trimmed_docs = []
    for doc in docs:
        text = (doc or "").strip()
        if not text:
            continue
        if len(text) > per_doc_chars:
            text = text[:per_doc_chars] + "..."
        trimmed_docs.append(text)

    context = "\n\n".join(trimmed_docs)
    if len(context) > max_chars:
        context = context[:max_chars] + "..."

    return context
