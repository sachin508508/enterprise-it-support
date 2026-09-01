from langchain_text_splitters import (
    MarkdownHeaderTextSplitter,
)

from .document_loader import load_documents


def chunk_documents(documents):
    """
    Split company documents according to their
    Markdown heading structure.
    """

    headers_to_split_on = [
        ("#", "Title"),
        ("##", "Section"),
        ("###", "Subsection"),
    ]

    splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False,
    )

    all_chunks = []

    for document in documents:

        chunks = splitter.split_text(
            document.page_content
        )

        for chunk in chunks:

            # Preserve original document source.
            chunk.metadata["source"] = (
                document.metadata["source"]
            )

        all_chunks.extend(chunks)

    return all_chunks


if __name__ == "__main__":

    documents = load_documents()

    print(
        f"Documents loaded: {len(documents)}"
    )

    chunks = chunk_documents(documents)

    print(
        f"Total chunks: {len(chunks)}"
    )

    for index, chunk in enumerate(chunks):

        print("\n" + "=" * 70)
        print(f"CHUNK {index + 1}")
        print("=" * 70)

        print(
            "Source:",
            chunk.metadata.get("source")
        )

        print("\nMetadata:")
        print(chunk.metadata)

        print("\nContent:")
        print(chunk.page_content)