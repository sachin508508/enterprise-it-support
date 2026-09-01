from pathlib import Path

from langchain_chroma import Chroma

from .document_loader import load_documents
from .chunker import chunk_documents
from .embeddings import create_embeddings


BASE_DIR = Path(__file__).resolve().parent

CHROMA_PATH = (
    BASE_DIR / "chroma_db"
)

COLLECTION_NAME = "company_documents"


def create_vector_store():

    # --------------------------------------------------------
    # 1. Load documents
    # --------------------------------------------------------

    documents = load_documents()

    print(
        f"Documents loaded: {len(documents)}"
    )

    # --------------------------------------------------------
    # 2. Chunk documents
    # --------------------------------------------------------

    chunks = chunk_documents(
        documents
    )

    print(
        f"Chunks created: {len(chunks)}"
    )

    # --------------------------------------------------------
    # 3. Create embedding model
    # --------------------------------------------------------

    embeddings = create_embeddings()

    # --------------------------------------------------------
    # 4. Create ChromaDB
    # --------------------------------------------------------

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_PATH),
    )

    # --------------------------------------------------------
    # 5. Add chunks
    # --------------------------------------------------------

    vector_store.add_documents(
        chunks
    )

    print(
        "Documents successfully stored "
        "in ChromaDB!"
    )

    print(
        f"Database location: {CHROMA_PATH}"
    )

    return vector_store


if __name__ == "__main__":

    create_vector_store()
