from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from ..auth.dependencies import get_current_employee
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.chat_logger import store_chat_result
from ..repositories.conversation import save_conversation

from ...ai.graph.graph import graph


router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"],
)


def get_query_type(route: str | None) -> str:
    query_type_map = {
        "rag": "RAG",
        "db": "System Information",
        "mcp": "Action",
    }

    return query_type_map.get(
        route,
        "Other",
    )


def get_status(result: dict) -> str:
    status = result.get(
        "status",
        "failed",
    )

    if status == "error":
        return "failed"

    if status == "success":
        return "successful"

    if status in {
        "successful",
        "failed",
        "denied",
        "pending",
    }:
        return status

    return "failed"


@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = current_employee[
        "employee_id"
    ]

    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query is required.",
        )

    try:

        # ----------------------------------------------------
        # 1. Execute AI graph
        # ----------------------------------------------------

        result = await graph.ainvoke(
            {
                "user_query": query,
                "employee_id": employee_id,
            }
        )

        # ----------------------------------------------------
        # 2. Get normalized final response
        # ----------------------------------------------------

        final_response = result.get(
            "final_response"
        )

        if not final_response:

            final_response = {
                "status": "failed",
                "route": result.get(
                    "route"
                ),
                "query_type": get_query_type(
                    result.get("route")
                ),
                "message": (
                    "The AI could not generate "
                    "a response."
                ),
                "data": None,
            }

        route = final_response.get(
            "route",
            result.get("route"),
        )

        query_type = final_response.get(
            "query_type",
            get_query_type(route),
        )

        status = get_status(
            final_response
        )

        # ----------------------------------------------------
        # 3. Store conversation
        # ----------------------------------------------------

        conversation_id = str(uuid4())

        save_conversation(
            request_id=conversation_id,
            employee_id=employee_id,
            query=query,
            query_type=query_type,
            status=status,
            response=final_response,
            raw_result=result,
        )

        # ----------------------------------------------------
        # 4. Development/debug logging
        # ----------------------------------------------------

        try:

            store_chat_result(
                {
                    "conversation_id": str(
                        conversation_id
                    ),
                    "employee_id": employee_id,
                    "query": query,
                    "query_type": query_type,
                    "status": status,
                    "route": route,
                    "response": final_response,
                }
            )

        except Exception:

            # Logging failure must not cause
            # the user's request to fail.
            pass

        # ----------------------------------------------------
        # 5. Return frontend-friendly response
        # ----------------------------------------------------

        return ChatResponse(
            request_id=conversation_id,
            status=status,
            query_type=query_type,
            response={
                "status": status,
                "route": route,
                "query_type": query_type,
                "message": final_response.get(
                    "message",
                    "The AI could not generate a response.",
                ),
            },
        )

    except HTTPException:
        raise

    except Exception as e:
        print(
            f"\n[CHAT ERROR] {type(e).__name__}: {e}\n",
            flush=True,
        )
        raise