from pathlib import Path

from langchain_chroma import Chroma

from .embeddings import create_embeddings


BASE_DIR = Path(__file__).resolve().parent

CHROMA_PATH = (
    BASE_DIR / "chroma_db"
)

COLLECTION_NAME = "company_documents"


def get_retriever(
    top_k: int = 3,
):
    """
    Connect to the existing company-document
    vector database and return a retriever.
    """

    embeddings = create_embeddings()

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_PATH),
    )

    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": top_k
        }
    )

    return retriever


if __name__ == "__main__":

    retriever = get_retriever()

    question = (
        "What are the standard working hours?"
    )

    results = retriever.invoke(
        question
    )

    print("\nQuestion:")
    print(question)

    print("\nRetrieved chunks:")

    for index, document in enumerate(
        results,
        start=1
    ):

        print("\n" + "=" * 70)
        print(f"RESULT {index}")
        print("=" * 70)

        print(
            "Source:",
            document.metadata.get("source")
        )

        print("\nContent:")
        print(
            document.page_content
        )
