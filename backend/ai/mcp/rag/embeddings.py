from sentence_transformers import SentenceTransformer


EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def load_embedding_model() -> SentenceTransformer:
    """Load the embedding model."""

    return SentenceTransformer(
        EMBEDDING_MODEL
    )


def create_embedding(
    model: SentenceTransformer,
    text: str,
) -> list[float]:
    """Create a normalized embedding for text."""

    return model.encode(
        text,
        normalize_embeddings=True,
    ).tolist()
