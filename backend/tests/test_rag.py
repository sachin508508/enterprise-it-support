import logging
import sys
import time
from pathlib import Path


# ---------------------------------------------------------
# Project path
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("RAG_TEST")


# ---------------------------------------------------------
# RAG imports
# ---------------------------------------------------------

from backend.ai.rag.retriever import (
    get_retriever,
    BM25_PATH,
    CHROMA_PATH,
    VECTOR_CANDIDATES,
    BM25_CANDIDATES,
    FINAL_TOP_K,
)

from backend.ai.rag.deepseek import ask_question


# ---------------------------------------------------------
# Test configuration
# ---------------------------------------------------------

TEST_QUERY = (
    "What are the times that our passwords should be reset?"
)


# ---------------------------------------------------------
# Tests
# ---------------------------------------------------------

def test_rag_pipeline():

    logger.info("=" * 70)
    logger.info("COMPANY RAG END-TO-END TEST")
    logger.info("=" * 70)

    start_time = time.time()

    # -----------------------------------------------------
    # 1. Check ChromaDB
    # -----------------------------------------------------

    logger.info("[1/6] Checking ChromaDB...")

    if not CHROMA_PATH.exists():
        raise AssertionError(
            f"ChromaDB not found: {CHROMA_PATH}"
        )

    logger.info(
        "ChromaDB found: %s",
        CHROMA_PATH,
    )

    # -----------------------------------------------------
    # 2. Check BM25 corpus
    # -----------------------------------------------------

    logger.info("[2/6] Checking BM25 corpus...")

    if not BM25_PATH.exists():
        raise AssertionError(
            f"BM25 corpus not found: {BM25_PATH}"
        )

    logger.info(
        "BM25 corpus found: %s",
        BM25_PATH,
    )

    # -----------------------------------------------------
    # 3. Hybrid retrieval
    # -----------------------------------------------------

    logger.info("[3/6] Running hybrid retrieval...")

    logger.info(
        "Vector candidates: %s",
        VECTOR_CANDIDATES,
    )

    logger.info(
        "BM25 candidates: %s",
        BM25_CANDIDATES,
    )

    retriever = get_retriever(
        top_k=FINAL_TOP_K
    )

    retrieval_start = time.time()

    documents = retriever(
        TEST_QUERY
    )

    retrieval_time = (
        time.time() - retrieval_start
    )

    if not documents:
        raise AssertionError(
            "Hybrid retrieval returned no documents."
        )

    logger.info(
        "Hybrid + reranking returned %s documents.",
        len(documents),
    )

    logger.info(
        "Retrieval time: %.2f seconds",
        retrieval_time,
    )

    # -----------------------------------------------------
    # 4. Display final ranked chunks
    # -----------------------------------------------------

    logger.info("[4/6] Final reranked chunks:")

    for index, document in enumerate(
        documents,
        start=1,
    ):

        source = document.metadata.get(
            "source",
            "Unknown",
        )

        logger.info(
            "\n--- RANK %s ---\n"
            "Source: %s\n"
            "Content: %s",
            index,
            source,
            document.page_content[:500],
        )

    # -----------------------------------------------------
    # 5. Generate DeepSeek answer
    # -----------------------------------------------------

    logger.info(
        "[5/6] Sending retrieved context to DeepSeek..."
    )

    llm_start = time.time()

    response = ask_question(
        TEST_QUERY
    )

    llm_time = (
        time.time() - llm_start
    )

    if response is None:
        raise AssertionError(
            "DeepSeek returned no response."
        )

    logger.info(
        "DeepSeek response generated."
    )

    logger.info(
        "LLM time: %.2f seconds",
        llm_time,
    )

    # -----------------------------------------------------
    # 6. Validate final response
    # -----------------------------------------------------

    logger.info(
        "[6/6] Validating final RAG response..."
    )

    logger.info(
        "Status: %s",
        response.status,
    )

    logger.info(
        "Title: %s",
        response.title,
    )

    logger.info(
        "Summary: %s",
        response.summary,
    )

    logger.info(
        "Sources: %s",
        len(response.sources),
    )

    if response.status not in {
        "success",
        "no_result",
    }:
        raise AssertionError(
            f"Unexpected RAG status: {response.status}"
        )

    if response.status == "success":

        if not response.summary:
            raise AssertionError(
                "RAG response summary is empty."
            )

        if not response.sources:
            raise AssertionError(
                "Successful RAG response has no sources."
            )

    total_time = (
        time.time() - start_time
    )

    logger.info("=" * 70)
    logger.info(
        "RAG TEST PASSED"
    )
    logger.info(
        "Total execution time: %.2f seconds",
        total_time,
    )
    logger.info("=" * 70)


# ---------------------------------------------------------
# Run directly
# ---------------------------------------------------------

if __name__ == "__main__":

    try:
        test_rag_pipeline()

    except Exception:
        logger.exception(
            "RAG TEST FAILED"
        )
        sys.exit(1)