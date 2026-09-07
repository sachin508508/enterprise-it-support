from ..conversation_repository import (
    _make_json_serializable,
)

from ...ai.tool_call.db.connection import (
    get_db_connection,
)


def get_employee_with_credentials(
    employee_id: str,
) -> dict | None:

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                e.employee_id,
                e.name,
                e.email,
                e.department,
                e.job_title,
                e.role,
                e.availability_status,
                e.manager_id,
                e.employment_status,
                c.password_hash
            FROM public.employees e
            INNER JOIN public.employee_credentials c
                ON e.employee_id = c.employee_id
            WHERE e.employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "employee_id": row[0],
            "name": row[1],
            "email": row[2],
            "department": row[3],
            "job_title": row[4],
            "role": row[5],
            "availability_status": row[6],
            "manager_id": row[7],
            "employment_status": row[8],
            "password_hash": row[9],
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_employee(
    employee_id: str,
) -> dict | None:

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                employee_id,
                name,
                email,
                department,
                job_title,
                role,
                availability_status,
                manager_id,
                employment_status
            FROM public.employees
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return {
            "employee_id": row[0],
            "name": row[1],
            "email": row[2],
            "department": row[3],
            "job_title": row[4],
            "role": row[5],
            "availability_status": row[6],
            "manager_id": row[7],
            "employment_status": row[8],
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()