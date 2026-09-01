import psycopg2

from ..db.connection import get_db_connection


def get_jira_account(employee_id: str):
    """
    Retrieve Jira account and access information for an employee.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                jira_account_id,
                employee_id,
                jira_email,
                jira_display_name,
                jira_role,
                jira_access_level,
                jira_status,
                jira_project_roles,
                last_verified_at,
                created_at,
                updated_at
            FROM public.jira_accounts
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return {
                "status": "error",
                "message": "Jira account not found",
                "employee_id": employee_id,
            }

        return {
            "status": "success",
            "jira_account": {
                "jira_account_id": row[0],
                "employee_id": row[1],
                "jira_email": row[2],
                "jira_display_name": row[3],
                "jira_role": row[4],
                "jira_access_level": row[5],
                "jira_status": row[6],
                "jira_project_roles": row[7],
                "last_verified_at": str(row[8]) if row[8] else None,
                "created_at": str(row[9]) if row[9] else None,
                "updated_at": str(row[10]) if row[10] else None,
            },
        }

    except psycopg2.Error as e:
        return {
            "status": "error",
            "message": "Database error while retrieving Jira account",
            "details": str(e),
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()