from typing import Any


def build_conversation_timeline(
    conversation: dict[str, Any],
    hitl_request: dict[str, Any] | None = None,
) -> list[dict[str, str]]:

    status = conversation.get(
        "status",
        "successful",
    )

    query_type = conversation.get(
        "query_type",
        "Other",
    )

    raw_result = conversation.get(
        "raw_result"
    )

    if not isinstance(
        raw_result,
        dict,
    ):
        raw_result = {}

    timeline: list[dict[str, str]] = []

    # ---------------------------------------------------------
    # 1. USER REQUEST
    # ---------------------------------------------------------

    timeline.append(
        {
            "title": "User Request",
            "description": (
                "Your IT request was received."
            ),
            "status": "completed",
        }
    )

    # ---------------------------------------------------------
    # 2. AI ANALYSIS
    # ---------------------------------------------------------

    timeline.append(
        {
            "title": "AI Analysis",
            "description": (
                "The AI analyzed the request and "
                "determined the appropriate operation."
            ),
            "status": "completed",
        }
    )

    # ---------------------------------------------------------
    # 3. ROUTE / OPERATION
    # ---------------------------------------------------------

    route = raw_result.get(
        "route"
    )

    route_names = {
        "rag": "Knowledge Search",
        "db": "System Investigation",
        "mcp": "IT Action",
    }

    route_name = route_names.get(
        route,
        query_type,
    )

    route_status = (
        "failed"
        if status == "failed"
        else "denied"
        if status == "denied"
        else "completed"
    )

    timeline.append(
        {
            "title": route_name,
            "description": _get_route_description(
                route
            ),
            "status": route_status,
        }
    )

    # ---------------------------------------------------------
    # 4. ORIGINAL AI RESULT
    # ---------------------------------------------------------

    if status == "successful":

        timeline.append(
            {
                "title": "Result",
                "description": (
                    "The requested operation "
                    "completed successfully."
                ),
                "status": "completed",
            }
        )

    elif status == "denied":

        timeline.append(
            {
                "title": "Access Decision",
                "description": (
                    "The requested operation "
                    "was not authorized."
                ),
                "status": "denied",
            }
        )

    elif status == "failed":

        timeline.append(
            {
                "title": "Operation Failed",
                "description": (
                    "The operation could not "
                    "be completed."
                ),
                "status": "failed",
            }
        )

    # ---------------------------------------------------------
    # 5. HITL LIFECYCLE
    # ---------------------------------------------------------

    if hitl_request:

        hitl_status = (
            hitl_request.get(
                "status"
            )
            or "pending"
        )

        reviewed_by = (
            hitl_request.get(
                "reviewed_by"
            )
        )

        review_comment = (
            hitl_request.get(
                "review_comment"
            )
        )

        execution_status = (
            hitl_request.get(
                "execution_status"
            )
        )

        # -----------------------------------------------------
        # HUMAN REVIEW SUBMITTED
        # -----------------------------------------------------

        timeline.append(
            {
                "title": "Human Review Submitted",
                "description": (
                    "The request was submitted "
                    "for administrator review."
                ),
                "status": "completed",
            }
        )

        # -----------------------------------------------------
        # PENDING
        # -----------------------------------------------------

        if hitl_status == "pending":

            timeline.append(
                {
                    "title": "Waiting for Human Review",
                    "description": (
                        "An administrator has not "
                        "reviewed this request yet."
                    ),
                    "status": "pending",
                }
            )

        # -----------------------------------------------------
        # REJECTED
        # -----------------------------------------------------

        elif hitl_status == "rejected":

            description = (
                "An administrator rejected "
                "the human review request."
            )

            if review_comment:

                description += (
                    f" Comment: {review_comment}"
                )

            timeline.append(
                {
                    "title": "Human Review Rejected",
                    "description": description,
                    "status": "denied",
                }
            )

        # -----------------------------------------------------
        # APPROVED
        # -----------------------------------------------------

        elif hitl_status == "approved":

            approval_description = (
                "An administrator approved "
                "the request."
            )

            if reviewed_by:

                approval_description += (
                    f" Approved by {reviewed_by}."
                )

            if review_comment:

                approval_description += (
                    f" Comment: {review_comment}"
                )

            timeline.append(
                {
                    "title": "Human Review Approved",
                    "description": approval_description,
                    "status": "completed",
                }
            )

            # -------------------------------------------------
            # EXECUTING
            # -------------------------------------------------

            if execution_status == "executing":

                timeline.append(
                    {
                        "title": "Execution",
                        "description": (
                            "The administrator-approved "
                            "request is currently being executed."
                        ),
                        "status": "pending",
                    }
                )

            # -------------------------------------------------
            # EXECUTION SUCCESS
            # -------------------------------------------------

            elif execution_status == "successful":

                timeline.append(
                    {
                        "title": "Execution",
                        "description": (
                            "The administrator-approved "
                            "request was successfully executed."
                        ),
                        "status": "completed",
                    }
                )

                timeline.append(
                    {
                        "title": "Final Result",
                        "description": (
                            "The approved operation completed "
                            "successfully."
                        ),
                        "status": "completed",
                    }
                )

            # -------------------------------------------------
            # EXECUTION FAILED
            # -------------------------------------------------

            elif execution_status == "failed":

                timeline.append(
                    {
                        "title": "Execution",
                        "description": (
                            "The administrator-approved "
                            "request could not be completed."
                        ),
                        "status": "failed",
                    }
                )

                timeline.append(
                    {
                        "title": "Execution Failed",
                        "description": (
                            "Human approval was granted, "
                            "but the final operation failed."
                        ),
                        "status": "failed",
                    }
                )

            # -------------------------------------------------
            # APPROVED BUT NOT EXECUTED
            # -------------------------------------------------

            else:

                timeline.append(
                    {
                        "title": "Execution",
                        "description": (
                            "The request has been approved "
                            "and is ready for execution."
                        ),
                        "status": "pending",
                    }
                )

    # ---------------------------------------------------------
    # 6. HITL AVAILABLE
    # ---------------------------------------------------------

    elif status in {
        "failed",
        "denied",
    }:

        timeline.append(
            {
                "title": "Human Review Available",
                "description": (
                    "You can submit this request "
                    "for administrator review."
                ),
                "status": "pending",
            }
        )

    return timeline


def _get_route_description(
    route: str | None,
) -> str:

    descriptions = {
        "rag": (
            "Relevant company knowledge and "
            "documentation were consulted."
        ),
        "db": (
            "Live system information "
            "was investigated."
        ),
        "mcp": (
            "An IT operation was processed "
            "through the authorized action system."
        ),
    }

    return descriptions.get(
        route,
        (
            "The request was processed by "
            "the AI operations system."
        ),
    )