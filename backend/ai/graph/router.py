import os
from typing import Literal

from dotenv import load_dotenv
from langchain_deepseek import ChatDeepSeek
from pydantic import BaseModel, Field


load_dotenv()


class RouteDecision(BaseModel):
    route: Literal["rag", "db", "mcp"] = Field(
        description="The capability required to answer the user's request."
    )


def get_router_llm():
    api_key = os.getenv("DEEPSEEK_API_KEY")

    if not api_key:
        raise ValueError(
            "DEEPSEEK_API_KEY is not set"
        )

    return ChatDeepSeek(
        model="deepseek-chat",
        api_key=api_key,
    )

def route_query(question: str) -> str:

    llm = get_router_llm()

    structured_llm = llm.with_structured_output(
        RouteDecision
    )

    prompt = f"""
You are an IT request router. Choose exactly one:

RAG = static company knowledge/documents.
DB = live information stored in PostgreSQL.
MCP = direct interaction with Jira.

Examples:
"standard working hours" -> RAG
"employee department" -> DB
"Jira account for employee" -> DB
"get Jira project KAN details" -> MCP
"create Jira project" -> MCP
"create/assign/resolve Jira issue" -> MCP
"add user to Jira project" -> MCP

Important:
Any request about a Jira project, Jira issue, or
performing an operation directly in Jira -> MCP,
unless it specifically asks for an employee's
Jira account stored in PostgreSQL.

User query:
{question}
"""

    decision = structured_llm.invoke(prompt)

    return decision.route