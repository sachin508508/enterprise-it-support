import json
import uuid
from typing import Any

from .conversation_repository import (
    get_conversation,
)

from ..ai.tool_call.db.connection import (
    get_db_connection,
)


def create_hitl_request(
    conversation_id: str,
    employee_id: str,
    reason: str,
) -> dict[str, Any]:

    conversation = get_conversation(
        conversation_id
    )

    if conversation is None:
        raise ValueError(
            "Conversation not found."
        )

    if conversation["employee_id"] != employee_id:
        raise PermissionError(
            "You do not have access to this conversation."
        )

    if conversation["status"] not in {
        "failed",
        "denied",
    }:
        raise ValueError(
            "Only failed or denied conversations "
            "can be submitted for human review."
        )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

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
            FROM hitl_requests
            WHERE conversation_id = %s
              AND status = 'pending'
            LIMIT 1;
            """,
            (conversation_id,),
        )

        existing = cursor.fetchone()

        if existing:
            return _row_to_dict(existing)

        hitl_id = str(uuid.uuid4())

        cursor.execute(
            """
            INSERT INTO hitl_requests (
                id,
                conversation_id,
                employee_id,
                reason,
                status,
                execution_status
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                'pending',
                NULL
            )
            RETURNING
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
                executed_at;
            """,
            (
                hitl_id,
                conversation_id,
                employee_id,
                reason,
            ),
        )

        row = cursor.fetchone()

        connection.commit()

        return _row_to_dict(row)

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_hitl_requests_for_employee(
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
            FROM hitl_requests
            WHERE employee_id = %s
            ORDER BY created_at DESC;
            """,
            (employee_id,),
        )

        rows = cursor.fetchall()

        return [
            _row_to_dict(row)
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_all_hitl_requests(
    status: str | None = None,
) -> list[dict[str, Any]]:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        if status:

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
                FROM hitl_requests
                WHERE status = %s
                ORDER BY created_at DESC;
                """,
                (status,),
            )

        else:

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
                FROM hitl_requests
                ORDER BY created_at DESC;
                """
            )

        rows = cursor.fetchall()

        return [
            _row_to_dict(row)
            for row in rows
        ]

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_hitl_request(
    hitl_id: str,
) -> dict[str, Any] | None:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

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
            FROM hitl_requests
            WHERE id = %s;
            """,
            (hitl_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return _row_to_dict(row)

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def review_hitl_request(
    hitl_id: str,
    reviewer_id: str,
    status: str,
    review_comment: str | None = None,
) -> dict[str, Any]:

    if status not in {
        "approved",
        "rejected",
    }:
        raise ValueError(
            "Review status must be 'approved' or 'rejected'."
        )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

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
            FROM hitl_requests
            WHERE id = %s
            FOR UPDATE;
            """,
            (hitl_id,),
        )

        row = cursor.fetchone()

        if row is None:
            raise ValueError(
                "HITL request not found."
            )

        if row[4] != "pending":
            raise ValueError(
                "This HITL request has already been reviewed."
            )

        cursor.execute(
            """
            UPDATE hitl_requests
            SET
                status = %s,
                reviewed_by = %s,
                review_comment = %s,
                reviewed_at = NOW()
            WHERE id = %s
            RETURNING
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
                executed_at;
            """,
            (
                status,
                reviewer_id,
                review_comment,
                hitl_id,
            ),
        )

        updated_row = cursor.fetchone()

        connection.commit()

        return _row_to_dict(
            updated_row
        )

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def mark_execution_started(
    hitl_id: str,
) -> dict[str, Any]:

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE hitl_requests
            SET execution_status = 'executing'
            WHERE id = %s
              AND status = 'approved'
              AND (
                  execution_status IS NULL
                  OR execution_status = 'failed'
              )
            RETURNING
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
                executed_at;
            """,
            (hitl_id,),
        )

        row = cursor.fetchone()

        if row is None:
            raise ValueError(
                "HITL request cannot be executed."
            )

        connection.commit()

        return _row_to_dict(row)

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def save_execution_result(
    hitl_id: str,
    execution_status: str,
    execution_result: dict[str, Any],
) -> dict[str, Any]:

    if execution_status not in {
        "successful",
        "failed",
    }:
        raise ValueError(
            "Invalid execution status."
        )

    connection = None
    cursor = None

    try:

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE hitl_requests
            SET
                execution_status = %s,
                execution_result = %s::jsonb,
                executed_at = NOW()
            WHERE id = %s
            RETURNING
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
                executed_at;
            """,
            (
                execution_status,
                json.dumps(
                    execution_result
                ),
                hitl_id,
            ),
        )

        row = cursor.fetchone()

        if row is None:
            raise ValueError(
                "HITL request not found."
            )

        connection.commit()

        return _row_to_dict(row)

    except Exception:

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


def _row_to_dict(
    row,
) -> dict[str, Any]:

    return {
        "id": str(row[0]),
        "conversation_id": str(row[1]),
        "employee_id": row[2],
        "reason": row[3],
        "status": row[4],
        "reviewed_by": row[5],
        "review_comment": row[6],
        "created_at": (
            row[7].isoformat()
            if row[7]
            else None
        ),
        "reviewed_at": (
            row[8].isoformat()
            if row[8]
            else None
        ),
        "execution_status": row[9],
        "execution_result": row[10],
        "executed_at": (
            row[11].isoformat()
            if row[11]
            else None
        ),
    }