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
        raise ValueError("DEEPSEEK_API_KEY is not set")

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
You are the routing controller for an Enterprise IT Support system.

Choose exactly one route:

RAG:
Use when the user is asking about company policies,
procedures, FAQs, documentation, working hours,
troubleshooting instructions, or other static company knowledge.

DB:
Use when the user asks for live employee, project,
system access, device configuration, or Jira account
information stored in PostgreSQL.

MCP:
Use when the user wants to perform an action in Jira,
such as creating a project, creating an issue,
assigning an issue, resolving an issue, or adding
a user to a project.

Return only the appropriate route.

User query:
{question}
"""

    decision = structured_llm.invoke(prompt)

    return decision.route