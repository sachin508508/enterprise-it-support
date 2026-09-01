from langchain_chroma import Chroma

from .document_loader import load_documents
from .chunker import chunk_documents
from .embeddings import create_embeddings
from .vector_store import (
    CHROMA_PATH,
    COLLECTION_NAME,
)


def ingest():

    print("=" * 70)
    print("COMPANY DOCUMENT RAG INGESTION")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Load documents
    # --------------------------------------------------------

    print("\n[1] Loading company documents...")

    documents = load_documents()

    print(
        f"Loaded {len(documents)} documents."
    )

    # --------------------------------------------------------
    # 2. Create chunks
    # --------------------------------------------------------

    print("\n[2] Creating chunks...")

    chunks = chunk_documents(
        documents
    )

    print(
        f"Created {len(chunks)} chunks."
    )

    # --------------------------------------------------------
    # 3. Create embeddings
    # --------------------------------------------------------

    print("\n[3] Loading embedding model...")

    embeddings = create_embeddings()

    print(
        "Embedding model loaded."
    )

    # --------------------------------------------------------
    # 4. Create ChromaDB
    # --------------------------------------------------------

    print("\n[4] Creating vector database...")

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_PATH),
    )

    # --------------------------------------------------------
    # 5. Store chunks
    # --------------------------------------------------------

    print("\n[5] Storing chunks...")

    vector_store.add_documents(
        chunks
    )

    print(
        f"\nStored {len(chunks)} chunks."
    )

    print(
        f"ChromaDB: {CHROMA_PATH}"
    )

    print("\nIngestion completed successfully.")


if __name__ == "__main__":

    ingest()
