from .embeddings import (
    create_embedding,
    load_embedding_model,
)

from .vector_store import (
    get_chroma_client,
    get_collection,
    query_collection,
)


_model = None
_collection = None


def _initialize():
    """Initialize the embedding model and vector store."""

    global _model
    global _collection

    if _model is None:
        _model = load_embedding_model()

    if _collection is None:
        client = get_chroma_client()

        _collection = get_collection(
            client
        )


def retrieve_instructions(
    query: str,
    top_k: int = 1,
) -> list[dict]:
    """
    Retrieve MCP instructions relevant to the query.
    """

    _initialize()

    query_embedding = create_embedding(
        _model,
        query,
    )

    results = query_collection(
        collection=_collection,
        query_embedding=query_embedding,
        top_k=top_k,
    )

    documents = results.get(
        "documents",
        [[]],
    )[0]

    metadatas = results.get(
        "metadatas",
        [[]],
    )[0]

    distances = results.get(
        "distances",
        [[]],
    )[0]

    retrieved = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances,
    ):
        retrieved.append(
            {
                "tool_name": metadata["tool_name"],
                "content": document,
                "distance": distance,
            }
        )

    return retrieved


def get_instructions_for_llm(
    query: str,
    top_k: int = 1,
) -> str:
    """
    Retrieve MCP instructions and format them
    for the LLM.
    """

    results = retrieve_instructions(
        query=query,
        top_k=top_k,
    )

    if not results:
        return "No relevant MCP instructions found."

    formatted = []

    for result in results:
        formatted.append(
            f"""
MCP TOOL:
{result["tool_name"]}

INSTRUCTIONS:
{result["content"]}
"""
        )

    return "\n".join(formatted)