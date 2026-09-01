import psycopg2

from ..db.connection import get_db_connection


def get_system_access(employee_id: str):
    """
    Retrieve all system access records for an employee.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                access_id,
                employee_id,
                system_name,
                system_account_id,
                system_role,
                access_status,
                granted_at,
                expires_at,
                updated_at
            FROM public.system_access
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        rows = cursor.fetchall()

        if not rows:
            return {
                "status": "error",
                "message": "No system access found",
                "employee_id": employee_id,
            }

        system_access = []

        for row in rows:
            system_access.append(
                {
                    "access_id": str(row[0]),
                    "employee_id": row[1],
                    "system_name": row[2],
                    "system_account_id": row[3],
                    "system_role": row[4],
                    "access_status": row[5],
                    "granted_at": str(row[6]) if row[6] else None,
                    "expires_at": str(row[7]) if row[7] else None,
                    "updated_at": str(row[8]) if row[8] else None,
                }
            )

        return {
            "status": "success",
            "system_access": system_access,
        }

    except psycopg2.Error as e:
        return {
            "status": "error",
            "message": "Database error while retrieving system access",
            "details": str(e),
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()