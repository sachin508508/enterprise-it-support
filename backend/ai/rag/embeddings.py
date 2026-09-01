from langchain_huggingface import (
    HuggingFaceEmbeddings,
)


EMBEDDING_MODEL = (
    "sentence-transformers/all-MiniLM-L6-v2"
)


def create_embeddings():

    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL
    )


if __name__ == "__main__":

    embeddings = create_embeddings()

    vector = embeddings.embed_query(
        "What are the standard working hours?"
    )

    print(
        "Embedding created successfully!"
    )

    print(
        "Vector length:",
        len(vector)
    )

    print(
        "First 10 values:",
        vector[:10]
    )