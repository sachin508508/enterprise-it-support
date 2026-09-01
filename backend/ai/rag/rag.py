from typing import List, Literal

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel

from .retriever import get_retriever


load_dotenv()


# ---------------------------------------------------------
# Structured response schema
# ---------------------------------------------------------

class ContentBlock(BaseModel):
    type: Literal[
        "text",
        "list",
        "steps",
        "warning",
        "note"
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
        "error"
    ]

    title: str
    summary: str

    content: List[ContentBlock]

    sources: List[Source]

    needs_action: bool = False


# ---------------------------------------------------------
# LLM
# ---------------------------------------------------------

def create_llm():

    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )


# ---------------------------------------------------------
# RAG
# ---------------------------------------------------------

def ask_question(
    question: str,
):

    # -----------------------------------------------------
    # 1. Retrieve relevant chunks
    # -----------------------------------------------------

    retriever = get_retriever(
        top_k=3
    )

    documents = retriever.invoke(
        question
    )

    # -----------------------------------------------------
    # 2. No results
    # -----------------------------------------------------

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
                    )
                )
            ],
            sources=[],
        )

    # -----------------------------------------------------
    # 3. Build context
    # -----------------------------------------------------

    context_parts = []

    sources = []

    for document in documents:

        source = document.metadata.get(
            "source",
            "Unknown"
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

    context = "\n\n".join(
        context_parts
    )

    # -----------------------------------------------------
    # 4. Structured Gemini
    # -----------------------------------------------------

    llm = create_llm()

    structured_llm = llm.with_structured_output(
        RAGResponse
    )

    # -----------------------------------------------------
    # 5. Prompt
    # -----------------------------------------------------

    prompt = f"""
You are a company knowledge assistant.

Answer the user's question using ONLY the
provided company document context.

Rules:

- Do not use outside knowledge.
- Do not invent information.
- Use "text" for normal explanations.
- Use "list" for bullet-point information.
- Use "steps" for procedures and troubleshooting.
- Use "warning" for important cautions.
- Use "note" for additional information.
- Keep the response concise.
- Set needs_action to false.

If the answer cannot be found in the context,
set status to "no_result".

Company document context:
-------------------------
{context}
-------------------------

User question:
{question}
"""

    # -----------------------------------------------------
    # 6. Generate structured response
    # -----------------------------------------------------

    response = structured_llm.invoke(
        prompt
    )

    # -----------------------------------------------------
    # 7. Add retrieved sources
    # -----------------------------------------------------

    response.sources = sources

    return response


# ---------------------------------------------------------
# Test
# ---------------------------------------------------------

if __name__ == "__main__":

    question = input(
        "\nAsk a question: "
    ).strip()

    if question:

        response = ask_question(
            question
        )

        print(
            "\n" + "=" * 70
        )

        print(
            "STRUCTURED RAG RESPONSE"
        )

        print(
            "=" * 70
        )

        print(
            response.model_dump_json(
                indent=2
            )
        )
        