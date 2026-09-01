from pathlib import Path

import chromadb


BASE_DIR = Path(__file__).resolve().parents[2]

CHROMA_DB_PATH = BASE_DIR / "data" / "chroma_db"
COLLECTION_NAME = "mcp_instructions"


def get_chroma_client():
    """Create a persistent ChromaDB client."""

    return chromadb.PersistentClient(
        path=str(CHROMA_DB_PATH)
    )


def create_collection(
    client,
    name: str = COLLECTION_NAME,
):
    """Create a fresh ChromaDB collection."""

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
    """Get an existing ChromaDB collection."""

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
    """Store documents and embeddings in ChromaDB."""

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
    """Retrieve the most relevant documents."""

    return collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )