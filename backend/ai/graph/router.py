import os
import re
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

    q = question.lower().strip()

    # -------------------------
    # MCP - Jira operations
    # -------------------------

    mcp_patterns = [
        r"\bcreate\b.*\bjira\b",
        r"\bcreate\b.*\bissue\b",
        r"\bcreate\b.*\bproject\b",
        r"\bassign\b.*\bissue\b",
        r"\bresolve\b.*\bissue\b",
        r"\badd\b.*\buser\b.*\bproject\b",
        r"\bremove\b.*\buser\b.*\bproject\b",
        r"\bupdate\b.*\bjira\b",
        r"\bget\b.*\bproject\b.*\bdetails\b",
        r"\bproject\b.*\bdetails\b",
        r"\bjira\b.*\bproject\b",
    ]

    if any(re.search(pattern, q) for pattern in mcp_patterns):
        print("[ROUTER] MCP", flush=True)
        return "mcp"

    # -------------------------
    # DB - employee/system data
    # -------------------------

    db_patterns = [
        r"\bmy\b.*\bdepartment\b",
        r"\bmy\b.*\brole\b",
        r"\bmy\b.*\bemployee\b",
        r"\bmy\b.*\baccess\b",
        r"\bmy\b.*\bconfiguration\b",
        r"\bmy\b.*\bjira\s+account\b",
        r"\bjira\s+account\b",
        r"\bemployee\b.*\bdetails\b",
        r"\bemployee\b.*\baccess\b",
        r"\bsystem\s+access\b",
        r"\bwhich\s+projects\b.*\bauthorized\b",
        r"\bprojects\b.*\bauthorized\b",
    ]

    if any(re.search(pattern, q) for pattern in db_patterns):
        print("[ROUTER] DB", flush=True)
        return "db"

    # -------------------------
    # RAG - company knowledge
    # -------------------------

    rag_patterns = [
        r"\bworking\s+hours\b",
        r"\boffice\s+hours\b",
        r"\blunch\s+break\b",
        r"\bholiday\b",
        r"\bleave\s+policy\b",
        r"\bcompany\s+policy\b",
        r"\bremote\s+work\b",
        r"\bwork\s+from\s+home\b",
        r"\bcompany\b.*\bpolicy\b",
        r"\bwhat\s+is\b.*\bpolicy\b",
        r"\bhow\s+does\b.*\bcompany\b",
    ]

    if any(re.search(pattern, q) for pattern in rag_patterns):
        print("[ROUTER] RAG", flush=True)
        return "rag"

    # -------------------------
    # LLM for ambiguous queries
    # -------------------------

    llm = get_router_llm()

    structured_llm = llm.with_structured_output(
        RouteDecision
    )

    prompt = f"""
You are the final fallback router for an enterprise IT support system.

Choose exactly one route.

RAG:
Use for static company knowledge, policies,
procedures, documentation, FAQs, and general
company information.

DB:
Use for live employee/system information stored
in the company's database.

Examples:
- employee details
- employee department
- employee configuration
- system access
- Jira account information stored for an employee

MCP:
Use ONLY for direct Jira interaction.

Examples:
- create Jira project
- get Jira project details
- create Jira issue
- assign Jira issue
- resolve Jira issue
- add user to Jira project

Important:
If the request requires changing or retrieving
information directly from Jira, choose MCP.

If the request asks about information stored
about an employee, choose DB.

If the request asks about company documentation
or policy, choose RAG.

User query:
{question}
"""

    decision = structured_llm.invoke(prompt)
    route = decision.route.lower().strip()

    print(
        f"[ROUTER] LLM -> {route}",
        flush=True,
    )

    return decision.route