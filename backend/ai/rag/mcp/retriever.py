from ..embeddings import create_embeddings

from .vector_store import (
    get_chroma_client,
    get_collection,
    query_collection,
)


_embeddings = None
_collection = None


def _initialize():
    """Initialize the embedding model and vector store."""

    global _embeddings
    global _collection

    if _embeddings is None:
        _embeddings = create_embeddings()

    if _collection is None:
        client = get_chroma_client()
        _collection = get_collection(client)


def retrieve_instructions(
    query: str,
    top_k: int = 1,
) -> list[dict]:
    """
    Retrieve MCP instructions relevant to
    the user's request.
    """

    if not query.strip():
        return []

    _initialize()

    query_embedding = _embeddings.embed_query(
        query
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
                "tool_name": metadata.get(
                    "tool_name",
                    "unknown",
                ),
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
        return ""

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


if __name__ == "__main__":

    query = input(
        "\nEnter MCP request: "
    ).strip()

    if query:

        results = retrieve_instructions(
            query=query,
            top_k=1,
        )

        print("\n" + "=" * 70)
        print("MCP RAG RETRIEVAL")
        print("=" * 70)

        for result in results:
            print(
                "\nTool:",
                result["tool_name"],
            )

            print(
                "\nDistance:",
                result["distance"],
            )

            print(
                "\nInstructions:"
            )

            print(
                result["content"]
            )