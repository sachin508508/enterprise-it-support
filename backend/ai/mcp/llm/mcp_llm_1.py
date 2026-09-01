import asyncio
import os
import sys

from dotenv import load_dotenv
from openai import AsyncOpenAI

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from backend.ai.mcp.rag.retriever import get_instructions_for_llm


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY is not set")


# ============================================================
# DEEPSEEK CLIENT
# ============================================================

client = AsyncOpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com",
)


MODEL = "deepseek-chat"


# ============================================================
# TEMPORARY ACCESS LEVEL
# ============================================================

ACCESS_LEVEL = "Manager"


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are a Jira assistant with access to MCP tools.

Use the retrieved MCP instructions as the rules for the
requested operation.

Rules:
- Follow the retrieved instructions before calling any MCP tool.
- Do not call a tool if the retrieved instructions require denial.
- Do not invent missing information.
- If required information is missing, ask the user.
- Call an MCP tool only when permitted by the retrieved instructions.
- After a successful tool call, clearly report the result.
"""


# ============================================================
# RAG CONTEXT
# ============================================================

def build_rag_context(user_message: str) -> str:

    instructions = get_instructions_for_llm(
        user_message,
        top_k=1
    )

    return f"""
REQUESTER INFORMATION

Requester access level:
{ACCESS_LEVEL}


RETRIEVED MCP INSTRUCTIONS

{instructions}
"""


# ============================================================
# MAIN
# ============================================================

async def main():

    # ========================================================
    # MCP SERVER
    # ========================================================

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "backend.ai.mcp.server"],
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
            write_stream
        ) as session:

            await session.initialize()

            # =================================================
            # GET MCP TOOLS
            # =================================================

            tools_result = await session.list_tools()

            print("\nAvailable MCP tools:")

            for tool in tools_result.tools:
                print(f"- {tool.name}")

            # =================================================
            # CONVERT MCP TOOLS TO OPENAI/DEEPSEEK FORMAT
            # =================================================

            tools = []

            for tool in tools_result.tools:

                tools.append(
                    {
                        "type": "function",
                        "function": {
                            "name": tool.name,
                            "description": (
                                tool.description or ""
                            ),
                            "parameters": (
                                tool.input_schema
                            ),
                        },
                    }
                )

            # =================================================
            # USER INPUT
            # =================================================

            user_message = input(
                "\nYou: "
            ).strip()

            if not user_message:
                return

            # =================================================
            # RAG
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
            # MESSAGES
            # =================================================

            messages = [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": f"""
CURRENT REQUEST

{user_message}


{rag_context}

Determine whether the request is allowed.

If the request is authorized and all required
information is available, use the appropriate
MCP tool.

If it is not authorized, do not call a tool.

If required information is missing, ask the user.
""",
                },
            ]

            # =================================================
            # LLM + MCP LOOP
            # =================================================

            while True:

                response = await client.chat.completions.create(
                    model=MODEL,
                    messages=messages,
                    tools=tools,
                    tool_choice="auto",
                )

                message = response.choices[0].message

                # ---------------------------------------------
                # Add assistant response
                # ---------------------------------------------

                messages.append(
                    message.model_dump(
                        exclude_none=True
                    )
                )

                # ---------------------------------------------
                # Normal response
                # ---------------------------------------------

                if message.content:
                    print(
                        "\nAssistant:",
                        message.content
                    )

                # ---------------------------------------------
                # No MCP call
                # ---------------------------------------------

                if not message.tool_calls:
                    break

                # =================================================
                # EXECUTE MCP TOOLS
                # =================================================

                for tool_call in message.tool_calls:

                    tool_name = (
                        tool_call.function.name
                    )

                    arguments = (
                        tool_call.function.arguments
                    )

                    import json

                    arguments = json.loads(
                        arguments
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

                    # ---------------------------------------------
                    # CALL MCP
                    # ---------------------------------------------

                    result = await session.call_tool(
                        tool_name,
                        arguments
                    )

                    # ---------------------------------------------
                    # Extract result
                    # ---------------------------------------------

                    result_text = "\n".join(
                        content.text
                        for content in result.content
                        if hasattr(
                            content,
                            "text"
                        )
                    )

                    print(
                        "\nMCP Result:"
                    )

                    print(
                        result_text
                    )

                    # ---------------------------------------------
                    # Send result back to DeepSeek
                    # ---------------------------------------------

                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": (
                                tool_call.id
                            ),
                            "content": result_text,
                        }
                    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())