import re
from pathlib import Path

from ..embeddings import create_embeddings

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

    if not file_path.exists():
        raise FileNotFoundError(
            f"MCP instruction file not found: {file_path}"
        )

    return file_path.read_text(
        encoding="utf-8"
    )


def split_instructions(
    text: str,
) -> list[dict]:

    pattern = r"(?m)^#\s+(.+?)\s*$"

    matches = list(
        re.finditer(
            pattern,
            text,
        )
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

    print("=" * 70)
    print("MCP INSTRUCTION RAG INGESTION")
    print("=" * 70)

    print("\n[1] Loading MCP instructions...")

    print(
        f"Instruction file: {INSTRUCTIONS_FILE}"
    )

    text = load_instructions()

    chunks = split_instructions(text)

    print(
        f"Created {len(chunks)} instruction chunks."
    )

    print("\n[2] Loading embedding model...")

    embeddings = create_embeddings()

    print("Embedding model loaded.")

    print("\n[3] Creating vector database...")

    client = get_chroma_client()

    collection = create_collection(client)

    documents = []
    embeddings_list = []
    ids = []
    metadatas = []

    print("\n[4] Creating embeddings...")

    for index, chunk in enumerate(chunks):

        content = chunk["content"]

        embedding = embeddings.embed_documents(
            [content]
        )[0]

        documents.append(content)

        embeddings_list.append(embedding)

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

    print("\n[5] Storing instructions...")

    add_documents(
        collection=collection,
        documents=documents,
        embeddings=embeddings_list,
        ids=ids,
        metadatas=metadatas,
    )

    print(
        f"\nStored {len(chunks)} MCP instruction chunks."
    )

    print("\nIngestion completed successfully.")


if __name__ == "__main__":
    ingest()