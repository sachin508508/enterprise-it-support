import json
import os
from pathlib import Path

from huggingface_hub import InferenceClient
from langchain_core.documents import Document
from langchain_chroma import Chroma
from rank_bm25 import BM25Okapi

from .embeddings import create_embeddings


BASE_DIR = Path(__file__).resolve().parent

CHROMA_PATH = (
    BASE_DIR.parent.parent.parent
    / "data"
    / "chroma"
    / "company"
)

COLLECTION_NAME = "company_documents"

BM25_PATH = CHROMA_PATH / "bm25_documents.json"

VECTOR_CANDIDATES = 5
BM25_CANDIDATES = 5
FINAL_TOP_K = 3

RERANKER_MODEL = "BAAI/bge-reranker-v2-m3"


def _load_bm25_documents():
    if not BM25_PATH.exists():
        raise FileNotFoundError(
            f"BM25 corpus not found: {BM25_PATH}. "
            "Run RAG ingestion first."
        )

    with open(
        BM25_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def _build_bm25(documents):
    tokenized_documents = [
        document["content"].lower().split()
        for document in documents
    ]

    return BM25Okapi(tokenized_documents)


def _vector_search(question: str):
    embeddings = create_embeddings()

    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=str(CHROMA_PATH),
    )

    return vector_store.similarity_search(
        question,
        k=VECTOR_CANDIDATES,
    )


def _bm25_search(
    question: str,
    documents,
):
    bm25 = _build_bm25(documents)

    scores = bm25.get_scores(
        question.lower().split()
    )

    ranked_indexes = sorted(
        range(len(scores)),
        key=lambda index: scores[index],
        reverse=True,
    )[:BM25_CANDIDATES]

    results = []

    for index in ranked_indexes:

        item = documents[index]

        results.append(
            Document(
                page_content=item["content"],
                metadata=item.get("metadata", {}),
            )
        )

    return results


def _merge_results(
    vector_results,
    bm25_results,
):
    merged = {}

    for document in vector_results:
        merged[document.page_content] = document

    for document in bm25_results:
        merged[document.page_content] = document

    return list(merged.values())


def _rerank(
    question: str,
    documents,
):
    token = os.getenv("HF_TOKEN")

    if not token:
        raise ValueError(
            "HF_TOKEN is not set."
        )

    client = InferenceClient(
        provider="hf-inference",
        api_key=token,
    )

    scored_documents = []

    for document in documents:

        text = (
            f"Query: {question}\n"
            f"Document: {document.page_content}"
        )

        result = client.text_classification(
            text,
            model=RERANKER_MODEL,
        )

        score = 0.0

        if result:
            score = max(
                item.score
                for item in result
            )

        scored_documents.append(
            (score, document)
        )

    scored_documents.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    return [
        document
        for _, document in scored_documents[:FINAL_TOP_K]
    ]


def get_retriever(
    top_k: int = FINAL_TOP_K,
):
    """
    Returns a callable retriever using:

    Vector Search
        +
    BM25
        ↓
    Candidate Merge
        ↓
    Hugging Face Reranking
        ↓
    Final Top-K
    """

    def retrieve(question: str):

        bm25_documents = _load_bm25_documents()

        vector_results = _vector_search(
            question
        )

        bm25_results = _bm25_search(
            question,
            bm25_documents,
        )

        candidates = _merge_results(
            vector_results,
            bm25_results,
        )

        reranked = _rerank(
            question,
            candidates,
        )

        return reranked[:top_k]

    return retrieve


if __name__ == "__main__":

    question = (
        "What are the standard working hours?"
    )

    retrieve = get_retriever()

    results = retrieve(question)

    print("\nQuestion:")
    print(question)

    print("\nFinal reranked chunks:")

    for index, document in enumerate(
        results,
        start=1,
    ):

        print("\n" + "=" * 70)
        print(f"RESULT {index}")
        print("=" * 70)

        print(
            "Source:",
            document.metadata.get("source"),
        )

        print("\nContent:")
        print(document.page_content)