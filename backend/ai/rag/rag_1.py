import os
from typing import List, Literal

from dotenv import load_dotenv
from langchain_deepseek import ChatDeepSeek
from pydantic import BaseModel

from .retriever import get_retriever
from .mcp.retriever import get_instructions_for_llm


load_dotenv()


# ---------------------------------------------------------
# Structured RAG response
# ---------------------------------------------------------

class ContentBlock(BaseModel):
    type: Literal[
        "text",
        "list",
        "steps",
        "warning",
        "note",
    ]

    text: str | None = None
    items: List[str] | None = None


class Source(BaseModel):
    document: str
    section: str | None = None


class RAGResponse(BaseModel):
    type: Literal["rag_response"] = "rag_response"

    status: Literal[
        "success",
        "no_result",
        "error",
    ]

    title: str
    summary: str
    content: List[ContentBlock]
    sources: List[Source]

    needs_action: bool = False


# ---------------------------------------------------------
# DeepSeek LLM
# ---------------------------------------------------------

def create_llm():

    api_key = os.getenv("DEEPSEEK_API_KEY")

    if not api_key:
        raise ValueError(
            "DEEPSEEK_API_KEY is not set"
        )

    return ChatDeepSeek(
        model="deepseek-chat",
        api_key=api_key,
    )


# ---------------------------------------------------------
# Company-document RAG
# ---------------------------------------------------------

def ask_question(question: str):

    # Retrieve company documents
    retriever = get_retriever(top_k=3)

    documents = retriever.invoke(question)

    # No results
    if not documents:

        return RAGResponse(
            status="no_result",
            title="Information Not Found",
            summary=(
                "I could not find this information "
                "in the company documents."
            ),
            content=[
                ContentBlock(
                    type="text",
                    text=(
                        "I could not find this information "
                        "in the company documents."
                    ),
                )
            ],
            sources=[],
        )

    # Build context + sources
    context_parts = []
    sources = []

    for document in documents:

        source = document.metadata.get(
            "source",
            "Unknown",
        )

        context_parts.append(
            f"""
SOURCE: {source}

{document.page_content}
"""
        )

        sources.append(
            Source(
                document=source
            )
        )

    context = "\n\n".join(context_parts)

    # Structured DeepSeek output
    llm = create_llm()

    structured_llm = llm.with_structured_output(
        RAGResponse
    )

    # Prompt
    prompt = f"""
You are a company knowledge assistant.

Answer the user's question using ONLY the
provided company document context.

Rules:
- Do not use outside knowledge.
- Do not invent information.
- Use "text" for explanations.
- Use "list" for bullet points.
- Use "steps" for procedures.
- Use "warning" for cautions.
- Keep the answer concise.
- Set needs_action to false.

If the context does not contain the answer,
return status="no_result".

Company document context:
-------------------------
{context}
-------------------------

User question:
{question}
"""

    response = structured_llm.invoke(prompt)

    # Add retrieved sources
    response.sources = sources

    return response


# ---------------------------------------------------------
# MCP instruction RAG
# ---------------------------------------------------------

def get_mcp_instructions(
    query: str,
    top_k: int = 1,
) -> str:

    return get_instructions_for_llm(
        query=query,
        top_k=top_k,
    )


# ---------------------------------------------------------
# Local test
# ---------------------------------------------------------

if __name__ == "__main__":

    question = input(
        "\nAsk a question: "
    ).strip()

    if question:

        response = ask_question(
            question
        )

        print("\n" + "=" * 70)
        print("STRUCTURED RAG RESPONSE")
        print("=" * 70)

        print(
            response.model_dump_json(
                indent=2
            )
        )