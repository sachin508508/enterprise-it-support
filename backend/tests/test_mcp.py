import asyncio
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# ---------------------------------------------------------
# Project path
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


load_dotenv()


# ---------------------------------------------------------
# Test configuration
# ---------------------------------------------------------

EMPLOYEE_ID = "EMP001"

TEST_TOOL = "get_jira_project_info_authorized"

TEST_ARGUMENTS = {
    "project_id_or_key": "KAN",
}


# ---------------------------------------------------------
# Logging
# ---------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("MCP_TEST")


# ---------------------------------------------------------
# MCP test
# ---------------------------------------------------------

async def test_mcp():

    logger.info("=" * 70)
    logger.info("MCP END-TO-END TEST")
    logger.info("=" * 70)

    # -----------------------------------------------------
    # 1. Validate environment
    # -----------------------------------------------------

    logger.info("[1/6] Checking environment...")

    if not os.getenv("DEEPSEEK_API_KEY"):
        raise AssertionError(
            "DEEPSEEK_API_KEY is not configured."
        )

    if not os.getenv("JIRA_BASE_URL"):
        raise AssertionError(
            "JIRA_BASE_URL is not configured."
        )

    logger.info("Environment OK.")

    # -----------------------------------------------------
    # 2. Start MCP server
    # -----------------------------------------------------

    logger.info("[2/6] Starting MCP server...")

    env = os.environ.copy()

    env["MCP_EMPLOYEE_ID"] = EMPLOYEE_ID
    env["MCP_HITL_APPROVED"] = "false"

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[
            "-m",
            "backend.ai.mcp.server",
        ],
        env=env,
    )

    # -----------------------------------------------------
    # 3. Connect
    # -----------------------------------------------------

    async with stdio_client(
        server_params
    ) as (read, write):

        async with ClientSession(
            read,
            write,
        ) as session:

            logger.info(
                "[3/6] Initializing MCP..."
            )

            await session.initialize()

            # -------------------------------------------------
            # 4. Discover tools
            # -------------------------------------------------

            logger.info(
                "[4/6] Discovering MCP tools..."
            )

            tools_result = (
                await session.list_tools()
            )

            tools = tools_result.tools

            if not tools:
                raise AssertionError(
                    "No MCP tools discovered."
                )

            for tool in tools:
                logger.info(
                    "Tool: %s",
                    tool.name,
                )

            # -------------------------------------------------
            # 5. Execute tool
            # -------------------------------------------------

            logger.info(
                "[5/6] Calling MCP tool..."
            )

            tool_names = {
                tool.name
                for tool in tools
            }

            if TEST_TOOL not in tool_names:
                raise AssertionError(
                    f"Tool not found: {TEST_TOOL}"
                )

            result = await session.call_tool(
                TEST_TOOL,
                TEST_ARGUMENTS,
            )

            logger.info(
                "MCP tool executed."
            )

            logger.info(
                "Result:\n%s",
                result,
            )

            # -------------------------------------------------
            # 6. Validate
            # -------------------------------------------------

            logger.info(
                "[6/6] Validating result..."
            )

            if getattr(
                result,
                "isError",
                False,
            ):
                raise AssertionError(
                    "MCP tool returned an error."
                )

            logger.info("=" * 70)
            logger.info("MCP TEST PASSED")
            logger.info("=" * 70)


# ---------------------------------------------------------
# Run
# ---------------------------------------------------------

if __name__ == "__main__":

    try:

        asyncio.run(
            test_mcp()
        )

    except Exception:

        logger.exception(
            "MCP TEST FAILED"
        )

        sys.exit(1)