import re
from pathlib import Path

from .embeddings import (
    create_embedding,
    load_embedding_model,
)

from .vector_store import (
    add_documents,
    create_collection,
    get_chroma_client,
)


BASE_DIR = Path(__file__).resolve().parents[4]

INSTRUCTIONS_FILE = (
    BASE_DIR
    / "data"
    / "mcp_instruction"
    / "mcp_instructions.md"
)


def load_instructions(
    file_path: Path = INSTRUCTIONS_FILE,
) -> str:
    """Load the MCP instruction document."""

    if not file_path.exists():
        raise FileNotFoundError(
            f"Instructions file not found: {file_path}"
        )

    return file_path.read_text(
        encoding="utf-8"
    )


def split_instructions(
    text: str,
) -> list[dict]:
    """
    Split the Markdown document into one chunk
    per MCP tool.
    """

    pattern = r"(?m)^#\s+(.+?)\s*$"

    matches = list(
        re.finditer(pattern, text)
    )

    chunks = []

    for index, match in enumerate(matches):

        tool_name = match.group(1).strip()

        start = match.start()

        if index + 1 < len(matches):
            end = matches[index + 1].start()
        else:
            end = len(text)

        content = text[start:end].strip()

        chunks.append(
            {
                "tool_name": tool_name,
                "content": content,
            }
        )

    return chunks


def ingest():
    """Build the MCP instruction vector database."""

    print("Loading instructions...")

    text = load_instructions()

    chunks = split_instructions(
        text
    )

    print(
        f"Created {len(chunks)} instruction chunks."
    )

    print("Loading embedding model...")

    model = load_embedding_model()

    print("Creating vector database...")

    client = get_chroma_client()

    collection = create_collection(
        client
    )

    documents = []
    embeddings = []
    ids = []
    metadatas = []

    for index, chunk in enumerate(chunks):

        content = chunk["content"]

        embedding = create_embedding(
            model,
            content,
        )

        documents.append(content)
        embeddings.append(embedding)

        ids.append(
            f"mcp_instruction_{index}"
        )

        metadatas.append(
            {
                "tool_name": chunk["tool_name"]
            }
        )

        print(
            f"  ✓ {chunk['tool_name']}"
        )

    add_documents(
        collection=collection,
        documents=documents,
        embeddings=embeddings,
        ids=ids,
        metadatas=metadatas,
    )

    print(
        f"\nStored {len(chunks)} instruction chunks."
    )


if __name__ == "__main__":
    ingest()