from pathlib import Path

import chromadb


# Project root
BASE_DIR = Path(__file__).resolve().parents[4]

CHROMA_DB_PATH = (
    BASE_DIR
    / "data"
    / "chroma"
    / "mcp"
)

COLLECTION_NAME = "mcp_instructions"


def get_chroma_client():
    """Create a persistent ChromaDB client."""

    CHROMA_DB_PATH.mkdir(
        parents=True,
        exist_ok=True,
    )

    return chromadb.PersistentClient(
        path=str(CHROMA_DB_PATH)
    )


def create_collection(
    client,
    name: str = COLLECTION_NAME,
):
    """
    Create a fresh MCP instruction collection.

    The existing collection is deleted so that
    ingestion always produces a clean database.
    """

    try:
        client.delete_collection(name)
    except Exception:
        pass

    return client.create_collection(
        name=name,
        metadata={
            "description": (
                "MCP tool instructions and "
                "authorization rules"
            )
        },
    )


def get_collection(
    client,
    name: str = COLLECTION_NAME,
):
    """Get the existing MCP instruction collection."""

    return client.get_collection(
        name=name
    )


def add_documents(
    collection,
    documents: list[str],
    embeddings: list[list[float]],
    ids: list[str],
    metadatas: list[dict],
):
    """Store MCP instruction documents."""

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def query_collection(
    collection,
    query_embedding: list[float],
    top_k: int = 1,
):
    """Retrieve the most relevant MCP instructions."""

    return collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=top_k,
    )