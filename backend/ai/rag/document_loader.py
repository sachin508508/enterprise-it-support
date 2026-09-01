from pathlib import Path

from langchain_community.document_loaders import TextLoader


# Project root:
# enterprise-it-support/
BASE_DIR = Path(__file__).resolve().parents[3]

DOCUMENTS_PATH = (
    BASE_DIR
    / "data"
    / "company_documents"
)


def load_documents():
    """Load all company Markdown documents."""

    if not DOCUMENTS_PATH.exists():
        raise FileNotFoundError(
            f"Company documents directory not found: "
            f"{DOCUMENTS_PATH}"
        )

    documents = []

    for file_path in sorted(
        DOCUMENTS_PATH.glob("DOC*.md")
    ):
        loader = TextLoader(
            str(file_path),
            encoding="utf-8"
        )

        docs = loader.load()

        for doc in docs:
            doc.metadata["source"] = file_path.name

        documents.extend(docs)

    if not documents:
        raise FileNotFoundError(
            f"No DOC*.md files found in {DOCUMENTS_PATH}"
        )

    return documents


if __name__ == "__main__":

    documents = load_documents()

    print(
        f"Total documents loaded: {len(documents)}"
    )

    for document in documents:

        print("\n" + "=" * 70)
        print(
            f"SOURCE: {document.metadata['source']}"
        )
        print("=" * 70)

        print(
            document.page_content[:500]
        )
