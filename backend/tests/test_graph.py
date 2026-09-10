import asyncio
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv()

from backend.ai.graph.graph import graph


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("GRAPH_TEST")


# This should route to MCP
TEST_QUERY = "Get the details of Jira project KAN"

EMPLOYEE_ID = "EMP001"


async def test_graph():

    logger.info("=" * 70)
    logger.info("FULL AI SYSTEM TEST")
    logger.info("=" * 70)

    logger.info("User Query: %s", TEST_QUERY)
    logger.info("Employee ID: %s", EMPLOYEE_ID)

    logger.info("\nRunning complete AI graph...")

    result = await graph.ainvoke(
        {
            "user_query": TEST_QUERY,
            "employee_id": EMPLOYEE_ID,
        }
    )

    logger.info("\n" + "=" * 70)
    logger.info("GRAPH EXECUTION RESULT")
    logger.info("=" * 70)

    logger.info(
        "Route: %s",
        result.get("route"),
    )

    logger.info(
        "Final Response:\n%s",
        result.get("final_response"),
    )

    if result.get("route") != "mcp":
        raise AssertionError(
            f"Expected MCP route, got: {result.get('route')}"
        )

    if not result.get("mcp_result"):
        raise AssertionError(
            "MCP result is missing."
        )

    logger.info("\nMCP Result:")
    logger.info(
        "%s",
        result.get("mcp_result"),
    )

    logger.info("\n" + "=" * 70)
    logger.info("FULL AI SYSTEM TEST PASSED")
    logger.info("=" * 70)


if __name__ == "__main__":

    try:
        asyncio.run(test_graph())

    except Exception:

        logger.exception(
            "FULL AI SYSTEM TEST FAILED"
        )

        sys.exit(1)