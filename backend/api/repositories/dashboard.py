from typing import Any

from ...core.database.connection import get_db_connection


def get_dashboard_data(
    employee_id: str,
) -> dict[str, Any]:

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # =====================================================
        # CONVERSATION COUNTS
        # =====================================================

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_queries,

                COUNT(*) FILTER (
                    WHERE query_type = 'RAG'
                ) AS rag_queries,

                COUNT(*) FILTER (
                    WHERE query_type = 'Action'
                ) AS action_queries,

                COUNT(*) FILTER (
                    WHERE query_type = 'System Information'
                ) AS system_information_queries,

                COUNT(*) FILTER (
                    WHERE status = 'successful'
                ) AS successful,

                COUNT(*) FILTER (
                    WHERE status = 'failed'
                ) AS failed,

                COUNT(*) FILTER (
                    WHERE status = 'denied'
                ) AS denied

            FROM public.conversations
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        (
            total_queries,
            rag_queries,
            action_queries,
            system_information_queries,
            successful,
            failed,
            denied,
        ) = row

        # =====================================================
        # HITL PENDING
        # =====================================================

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM public.hitl_requests
            WHERE employee_id = %s
              AND status = 'pending';
            """,
            (employee_id,),
        )

        hitl_pending = cursor.fetchone()[0]

        # =====================================================
        # RECENT ACTIVITY
        # =====================================================

        cursor.execute(
            """
            SELECT
                id,
                query,
                query_type,
                status,
                created_at
            FROM public.conversations
            WHERE employee_id = %s
            ORDER BY created_at DESC
            LIMIT 5;
            """,
            (employee_id,),
        )

        recent_rows = cursor.fetchall()

        recent_activity = [
            {
                "id": str(row[0]),
                "query": row[1],
                "query_type": row[2],
                "status": row[3],
                "created_at": (
                    row[4].isoformat()
                    if row[4]
                    else None
                ),
            }
            for row in recent_rows
        ]

        return {
            "total_queries": int(total_queries or 0),
            "rag_queries": int(rag_queries or 0),
            "action_queries": int(action_queries or 0),
            "system_information_queries": int(
                system_information_queries or 0
            ),
            "successful": int(successful or 0),
            "failed": int(failed or 0),
            "denied": int(denied or 0),
            "hitl_pending": int(hitl_pending or 0),
            "recent_activity": recent_activity,
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()