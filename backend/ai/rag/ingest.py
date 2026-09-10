import json
from pathlib import Path

from langchain_chroma import Chroma

from .document_loader import load_documents
from .chunker import chunk_documents
from .embeddings import create_embeddings
from .vector_store import CHROMA_PATH, COLLECTION_NAME


BM25_PATH = CHROMA_PATH / "bm25_documents.json"


def ingest():

    print("=" * 70)
    print("COMPANY DOCUMENT RAG INGESTION")
    print("=" * 70)

    print("\n[1] Loading company documents...")

    documents = load_documents()

    print(f"Loaded {len(documents)} documents.")

    print("\n[2] Creating chunks...")

    chunks = chunk_documents(documents)

    print(f"Created {len(chunks)} chunks.")

    print("\n[3] Loading embedding model...")

    embeddings = create_embeddings()

    print("Embedding model loaded.")

    print("\n[4] Creating vector database...")

    CHROMA_PATH.mkdir(parents=True, exist_ok=True)

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_PATH),
    )

    print("\n[5] Storing chunks in ChromaDB...")

    vector_store.add_documents(chunks)

    print(f"Stored {len(chunks)} chunks.")

    print("\n[6] Creating BM25 corpus...")

    bm25_documents = []

    for index, document in enumerate(chunks):

        bm25_documents.append(
            {
                "id": str(index),
                "content": document.page_content,
                "metadata": document.metadata,
            }
        )

    with open(
        BM25_PATH,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            bm25_documents,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print(
        f"BM25 corpus stored at: {BM25_PATH}"
    )

    print("\nIngestion completed successfully.")


if __name__ == "__main__":
    ingest()