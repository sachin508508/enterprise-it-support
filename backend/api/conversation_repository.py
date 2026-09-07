from typing import Any

from psycopg2.extras import Json

from .conversation_timeline import (
    build_conversation_timeline,
)

from ..ai.tool_call.db.connection import (
    get_db_connection,
)


def _make_json_serializable(
    value: Any,
) -> Any:

    if isinstance(value, dict):

        return {
            str(key): _make_json_serializable(
                item
            )
            for key, item in value.items()
        }

    if isinstance(value, list):

        return [
            _make_json_serializable(
                item
            )
            for item in value
        ]

    if isinstance(value, tuple):

        return [
            _make_json_serializable(
                item
            )
            for item in value
        ]

    return value


def save_conversation(
    request_id: str,
    employee_id: str,
    query: str,
    query_type: str,
    status: str,
    response: dict,
    raw_result: dict,
) -> None:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        response_json = _make_json_serializable(
            response
        )

        raw_result_json = _make_json_serializable(
            raw_result
        )

        cursor.execute(
            """
            INSERT INTO public.conversations (
                id,
                employee_id,
                query,
                query_type,
                status,
                response_json,
                raw_result_json,
                created_at,
                completed_at
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                NOW(),
                NOW()
            );
            """,
            (
                request_id,
                employee_id,
                query,
                query_type,
                status,
                Json(response_json),
                Json(raw_result_json),
            ),
        )

        connection.commit()

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_conversations(
    employee_id: str,
) -> list[dict[str, Any]]:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                employee_id,
                query,
                query_type,
                status,
                response_json,
                raw_result_json,
                created_at,
                completed_at
            FROM public.conversations
            WHERE employee_id = %s
            ORDER BY created_at DESC;
            """,
            (
                employee_id,
            ),
        )

        rows = cursor.fetchall()

        conversations = []

        for row in rows:

            conversation = {
                "id": str(row[0]),
                "employee_id": row[1],
                "query": row[2],
                "query_type": row[3],
                "status": row[4],
                "response_json": row[5],
                "raw_result_json": row[6],
                "created_at": row[7],
                "completed_at": row[8],
            }

            conversations.append(
                _make_json_serializable(
                    conversation
                )
            )

        return conversations

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_conversation(
    conversation_id: str,
) -> dict[str, Any] | None:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        # -----------------------------------------------------
        # Conversation
        # -----------------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                employee_id,
                query,
                query_type,
                status,
                response_json,
                raw_result_json,
                created_at,
                completed_at
            FROM public.conversations
            WHERE id = %s;
            """,
            (
                conversation_id,
            ),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        conversation = {
            "id": str(row[0]),
            "employee_id": row[1],
            "query": row[2],
            "query_type": row[3],
            "status": row[4],
            "response_json": row[5],
            "raw_result_json": row[6],
            "created_at": row[7],
            "completed_at": row[8],
        }

        # -----------------------------------------------------
        # Related HITL request
        # -----------------------------------------------------

        cursor.execute(
            """
            SELECT
                id,
                conversation_id,
                employee_id,
                reason,
                status,
                reviewed_by,
                review_comment,
                created_at,
                reviewed_at,
                execution_status,
                execution_result,
                executed_at
            FROM public.hitl_requests
            WHERE conversation_id = %s
            ORDER BY created_at DESC
            LIMIT 1;
            """,
            (
                conversation_id,
            ),
        )

        hitl_row = cursor.fetchone()

        hitl_request = None

        if hitl_row is not None:

            hitl_request = {
                "id": str(hitl_row[0]),
                "conversation_id": str(
                    hitl_row[1]
                ),
                "employee_id": hitl_row[2],
                "reason": hitl_row[3],
                "status": hitl_row[4],
                "reviewed_by": hitl_row[5],
                "review_comment": hitl_row[6],
                "created_at": hitl_row[7],
                "reviewed_at": hitl_row[8],
                "execution_status": hitl_row[9],
                "execution_result": hitl_row[10],
                "executed_at": hitl_row[11],
            }

        # -----------------------------------------------------
        # Timeline
        # -----------------------------------------------------

        conversation[
            "timeline"
        ] = build_conversation_timeline(
            conversation,
            hitl_request=hitl_request,
        )

        # -----------------------------------------------------
        # Expose HITL information
        # -----------------------------------------------------

        conversation[
            "hitl_request"
        ] = hitl_request

        return _make_json_serializable(
            conversation
        )

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def mark_conversation_successful(
    conversation_id: str,
) -> None:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE public.conversations
            SET
                status = 'successful',
                completed_at = NOW()
            WHERE id = %s;
            """,
            (
                conversation_id,
            ),
        )

        connection.commit()

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()