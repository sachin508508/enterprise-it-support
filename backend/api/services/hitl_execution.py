from typing import Any

from ..repositories.conversation import (
    get_conversation,
    mark_conversation_successful,
)

from ..repositories.hitl import (
    mark_execution_started,
    save_execution_result,
)

from ...ai.graph.graph import graph


async def execute_approved_hitl(
    hitl_request: dict[str, Any],
) -> dict[str, Any]:

    hitl_id = hitl_request["id"]

    conversation_id = (
        hitl_request["conversation_id"]
    )

    employee_id = (
        hitl_request["employee_id"]
    )

    reviewed_by = (
        hitl_request.get("reviewed_by")
    )

    if not reviewed_by:
        raise ValueError(
            "Approved HITL request has no administrator reviewer."
        )

    if hitl_request["status"] != "approved":
        raise ValueError(
            "HITL request must be approved before execution."
        )

    conversation = get_conversation(
        conversation_id
    )

    if conversation is None:
        raise ValueError(
            "Original conversation not found."
        )

    if conversation["employee_id"] != employee_id:
        raise PermissionError(
            "Conversation ownership mismatch."
        )

    if conversation["status"] == "successful":
        raise ValueError(
            "The original request was already successful."
        )

    # ---------------------------------------------------------
    # Mark HITL execution as started
    # ---------------------------------------------------------

    mark_execution_started(
        hitl_id
    )

    try:

        result = await graph.ainvoke(
            {
                "user_query": conversation["query"],
                "employee_id": employee_id,
                "hitl_approved": True,
                "hitl_id": hitl_id,
                "approved_by": reviewed_by,
            }
        )

        final_response = result.get(
            "final_response",
            {},
        )

        route = result.get(
            "route"
        )

        if route == "rag":
            route_result = result.get(
                "rag_result"
            )

        elif route == "db":
            route_result = result.get(
                "db_result"
            )

        elif route == "mcp":
            route_result = result.get(
                "mcp_result"
            )

        else:
            route_result = None

        execution_result = {
            "route": route,
            "response": final_response,
            "route_result": route_result,
            "raw_result": result,
            "hitl_id": hitl_id,
            "approved_by": reviewed_by,
            "employee_id": employee_id,
        }

        # ---------------------------------------------------------
        # Detect graph-level failure
        # ---------------------------------------------------------

        if result.get("error"):

            return save_execution_result(
                hitl_id=hitl_id,
                execution_status="failed",
                execution_result={
                    **execution_result,
                    "error": result["error"],
                },
            )

        # ---------------------------------------------------------
        # Detect route-level failure
        # ---------------------------------------------------------

        if isinstance(
            route_result,
            dict,
        ):

            if route_result.get(
                "status"
            ) in {
                "error",
                "failed",
            }:

                return save_execution_result(
                    hitl_id=hitl_id,
                    execution_status="failed",
                    execution_result=execution_result,
                )

        # ---------------------------------------------------------
        # Successful execution
        # ---------------------------------------------------------

        saved = save_execution_result(
            hitl_id=hitl_id,
            execution_status="successful",
            execution_result=execution_result,
        )

        # Human-approved execution successfully completed.
        mark_conversation_successful(
            conversation_id
        )

        return saved

    except PermissionError as e:

        return save_execution_result(
            hitl_id=hitl_id,
            execution_status="failed",
            execution_result={
                "error": str(e),
                "error_type": "PermissionError",
                "hitl_id": hitl_id,
                "approved_by": reviewed_by,
                "employee_id": employee_id,
            },
        )

    except Exception as e:

        return save_execution_result(
            hitl_id=hitl_id,
            execution_status="failed",
            execution_result={
                "error": str(e),
                "error_type": type(e).__name__,
                "hitl_id": hitl_id,
                "approved_by": reviewed_by,
                "employee_id": employee_id,
            },
        )