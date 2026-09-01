import asyncio
import os
import sys

from dotenv import load_dotenv
from google import genai
from google.genai import types

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from ..rag.retriever import get_instructions_for_llm


# ============================================================
# ENVIRONMENT
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "..",
    )
)

load_dotenv(
    os.path.join(BASE_DIR, ".env")
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not set"
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# TEMPORARY ACCESS LEVEL
# ============================================================

# Temporary value for the demo.
# Replace this later with the actual
# authentication / access verification system.

ACCESS_LEVEL = "Manager"


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are a Jira assistant with access to MCP tools.

Use the retrieved MCP instructions to determine how to handle
the user's request.

- Follow the retrieved instructions.
- Do not call a tool when access is denied.
- Do not invent missing information.
- Ask for required information when it is missing.
- Call an MCP tool only when the request is authorized.
- Report the result clearly after a successful tool call.
"""


# ============================================================
# RAG CONTEXT
# ============================================================

def build_rag_context(
    user_message: str
) -> str:
    """
    Retrieve the relevant MCP instructions and
    add the requester's access level.
    """

    instructions = get_instructions_for_llm(
        user_message,
        top_k=1,
    )

    return f"""
REQUESTER ACCESS LEVEL:
{ACCESS_LEVEL}

RETRIEVED MCP INSTRUCTIONS:
{instructions}
"""


# ============================================================
# MCP TOOL CONVERSION
# ============================================================

def convert_mcp_tools_to_gemini(
    tools
):
    """
    Convert MCP tool definitions into
    Gemini function declarations.
    """

    function_declarations = []

    for tool in tools:
        function_declarations.append(
            types.FunctionDeclaration(
                name=tool.name,
                description=tool.description or "",
                parameters_json_schema=(
                    tool.input_schema
                ),
            )
        )

    return types.Tool(
        function_declarations=function_declarations
    )


# ============================================================
# MCP RESULT
# ============================================================

def extract_tool_result(result) -> str:
    """
    Extract text from an MCP tool response.
    """

    texts = []

    for content in result.content:

        if hasattr(content, "text"):
            texts.append(content.text)

    return "\n".join(texts)


# ============================================================
# MAIN
# ============================================================

async def main():

    # ========================================================
    # MCP SERVER CONFIGURATION
    # ========================================================

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[
            "-m",
            "backend.ai.mcp.server",
        ],
        env=os.environ.copy(),
    )

    # ========================================================
    # START MCP SERVER
    # ========================================================

    async with stdio_client(
        server_params
    ) as (read_stream, write_stream):

        async with ClientSession(
            read_stream,
            write_stream,
        ) as session:

            # ------------------------------------------------
            # Initialize MCP
            # ------------------------------------------------

            await session.initialize()

            # ------------------------------------------------
            # Get MCP tools
            # ------------------------------------------------

            tools_result = (
                await session.list_tools()
            )

            print("\nAvailable MCP tools:")

            for tool in tools_result.tools:
                print(
                    f"- {tool.name}"
                )

            # ------------------------------------------------
            # Convert MCP tools to Gemini tools
            # ------------------------------------------------

            gemini_tool = (
                convert_mcp_tools_to_gemini(
                    tools_result.tools
                )
            )

            # =================================================
            # USER INPUT
            # =================================================

            user_message = input(
                "\nYou: "
            ).strip()

            if not user_message:
                print(
                    "\nNo request provided."
                )
                return

            # =================================================
            # RAG RETRIEVAL
            # =================================================

            print(
                "\n[RAG] Retrieving relevant instructions..."
            )

            rag_context = build_rag_context(
                user_message
            )

            print(
                "[RAG] Instructions retrieved."
            )

            # =================================================
            # INITIAL PROMPT
            # =================================================

            initial_prompt = f"""
{SYSTEM_PROMPT}

CURRENT REQUEST:
{user_message}

{rag_context}

Determine the correct action based on the requester
access level and retrieved MCP instructions.

If the operation is denied, do not call an MCP tool.

If required information is missing, ask the user.

If the operation is authorized and all required
information is available, call the appropriate MCP tool.
"""

            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part(
                            text=initial_prompt
                        )
                    ],
                )
            ]

            # =================================================
            # GEMINI + MCP LOOP
            # =================================================

            while True:

                response = (
                    await client.aio.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=contents,
                        config=types.GenerateContentConfig(
                            tools=[gemini_tool]
                        ),
                    )
                )

                candidate = (
                    response.candidates[0]
                )

                contents.append(
                    candidate.content
                )

                function_calls = []

                # ------------------------------------------------
                # Process Gemini response
                # ------------------------------------------------

                for part in candidate.content.parts:

                    if part.text:
                        print(
                            "\nAssistant:",
                            part.text
                        )

                    if part.function_call:
                        function_calls.append(
                            part.function_call
                        )

                # ------------------------------------------------
                # No MCP tool call
                # ------------------------------------------------

                if not function_calls:
                    break

                # =================================================
                # EXECUTE MCP TOOLS
                # =================================================

                tool_response_parts = []

                for function_call in function_calls:

                    tool_name = (
                        function_call.name
                    )

                    arguments = dict(
                        function_call.args
                    )

                    print(
                        "\n"
                        + "-" * 60
                    )

                    print(
                        f"MCP Tool: {tool_name}"
                    )

                    print(
                        f"Arguments: {arguments}"
                    )

                    print(
                        "-" * 60
                    )

                    # ------------------------------------------------
                    # Execute MCP tool
                    # ------------------------------------------------

                    result = (
                        await session.call_tool(
                            tool_name,
                            arguments,
                        )
                    )

                    # ------------------------------------------------
                    # Extract result
                    # ------------------------------------------------

                    result_text = (
                        extract_tool_result(
                            result
                        )
                    )

                    print(
                        "\nMCP Result:"
                    )

                    print(
                        result_text
                    )

                    # ------------------------------------------------
                    # Send result back to Gemini
                    # ------------------------------------------------

                    tool_response_parts.append(
                        types.Part(
                            function_response=
                                types.FunctionResponse(
                                    name=tool_name,
                                    response={
                                        "result":
                                            result_text
                                    },
                                )
                        )
                    )

                # =================================================
                # CONTINUE GEMINI LOOP
                # =================================================

                contents.append(
                    types.Content(
                        role="user",
                        parts=tool_response_parts,
                    )
                )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())
