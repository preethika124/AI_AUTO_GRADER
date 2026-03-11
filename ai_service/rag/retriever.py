from ai_service.rag.vector_store import search


def retrieve_context(query):

    docs = search(query)

    context = "\n".join(docs)

    return context