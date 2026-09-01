import psycopg2

from ..db.connection import get_db_connection


def get_employee_details(employee_id: str):
    """
    Retrieve employee details from PostgreSQL using employee ID.
    """

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
            return {
                "status": "error",
                "message": "Employee not found",
                "employee_id": employee_id,
            }

        return {
            "status": "success",
            "employee": {
                "employee_id": row[0],
                "name": row[1],
                "email": row[2],
                "department": row[3],
                "job_title": row[4],
                "role": row[5],
                "availability_status": row[6],
                "manager_id": row[7],
                "employment_status": row[8],
            },
        }

    except psycopg2.Error as e:
        return {
            "status": "error",
            "message": "Database error while retrieving employee details",
            "details": str(e),
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()