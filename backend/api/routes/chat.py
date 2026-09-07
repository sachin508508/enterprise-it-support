import traceback
import uuid

from fastapi import APIRouter, Depends, HTTPException

from ..auth.dependencies import get_current_employee
from ..chat_logger import store_chat_result
from ..conversation_repository import save_conversation
from ..schemas.chat import (
    ChatRequest,
    ChatResponse,
)
from ...ai.graph.graph import graph


router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


def get_query_type(
    route: str | None,
) -> str:

    route_mapping = {
        "rag": "RAG",
        "db": "System Information",
        "mcp": "Action",
    }

    return route_mapping.get(
        route or "",
        "Other",
    )


def get_status(
    result: dict,
) -> str:

    error = result.get("error")

    if error:

        error_text = str(
            error
        ).lower()

        if any(
            phrase in error_text
            for phrase in [
                "not authorized",
                "unauthorized",
                "permission",
                "access denied",
                "not allowed",
            ]
        ):
            return "denied"

        return "failed"

    route = result.get(
        "route"
    )

    if route == "rag":

        data = result.get(
            "rag_result"
        )

    elif route == "db":

        data = result.get(
            "db_result"
        )

    elif route == "mcp":

        data = result.get(
            "mcp_result"
        )

    else:

        data = None

    if isinstance(data, dict):

        data_status = data.get(
            "status"
        )

        if data_status in {
            "denied",
            "unauthorized",
            "forbidden",
        }:
            return "denied"

        if data_status == "error":

            error_text = str(
                data.get("error", "")
            ).lower()

            if any(
                phrase in error_text
                for phrase in [
                    "not authorized",
                    "unauthorized",
                    "permission",
                    "access denied",
                    "not allowed",
                ]
            ):
                return "denied"

            return "failed"

        if data_status in {
            "success",
            "successful",
        }:
            return "successful"

    return "successful"


@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    request: ChatRequest,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    request_id = str(
        uuid.uuid4()
    )

    employee_id = current_employee[
        "employee_id"
    ]

    try:

        print(
            f"\n[CHAT] Request ID: {request_id}"
        )

        print(
            f"[CHAT] Employee: {employee_id}"
        )

        print(
            f"[CHAT] Query: {request.query}"
        )

        print(
            "[CHAT] Starting graph..."
        )

        result = await graph.ainvoke(
            {
                "user_query": request.query,
                "employee_id": employee_id,
            }
        )

        print(
            "[CHAT] Graph completed."
        )

        print(
            f"[CHAT] Route: {result.get('route')}"
        )

        print(
            f"[CHAT] Error: {result.get('error')}"
        )

        final_response = result.get(
            "final_response",
            {},
        )

        route = final_response.get(
            "route",
            result.get("route"),
        )

        query_type = get_query_type(
            route
        )

        status = get_status(
            result
        )

        response_data = final_response.get(
            "data",
            {},
        )

        response = {
            "route": route,
            "data": response_data,
        }

        print(
            "[CHAT] Storing chat result..."
        )

        store_chat_result(
            request_id=request_id,
            user_query=request.query,
            result=result,
        )

        print(
            "[CHAT] Chat result stored."
        )

        print(
            "[CHAT] Saving conversation..."
        )

        save_conversation(
            request_id=request_id,
            employee_id=employee_id,
            query=request.query,
            query_type=query_type,
            status=status,
            response=response,
            raw_result=result,
        )

        print(
            "[CHAT] Conversation saved."
        )

        return ChatResponse(
            request_id=request_id,
            status=status,
            query_type=query_type,
            response=response,
        )

    except Exception as e:

        print(
            "\n"
            "=================================================="
        )

        print(
            "CHAT ROUTE ERROR"
        )

        print(
            f"Request ID: {request_id}"
        )

        print(
            f"Employee ID: {employee_id}"
        )

        print(
            f"Error Type: {type(e).__name__}"
        )

        print(
            f"Error: {str(e)}"
        )

        traceback.print_exc()

        print(
            "=================================================="
            "\n"
        )

        raise HTTPException(
            status_code=500,
            detail={
                "request_id": request_id,
                "error_type": type(e).__name__,
                "message": str(e),
            },
        ) from e