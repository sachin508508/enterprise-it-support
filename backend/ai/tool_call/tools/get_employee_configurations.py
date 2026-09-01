import psycopg2

from ..db.connection import get_db_connection


def get_employee_configurations(employee_id: str):
    """
    Retrieve device and configuration information for an employee.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                configuration_id,
                employee_id,
                device_type,
                device_name,
                os,
                os_version,
                vpn_enabled,
                mfa_enabled,
                last_seen_at,
                updated_at
            FROM public.employee_configurations
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return {
                "status": "error",
                "message": "Employee configuration not found",
                "employee_id": employee_id,
            }

        return {
            "status": "success",
            "configuration": {
                "configuration_id": str(row[0]),
                "employee_id": row[1],
                "device_type": row[2],
                "device_name": row[3],
                "os": row[4],
                "os_version": row[5],
                "vpn_enabled": row[6],
                "mfa_enabled": row[7],
                "last_seen_at": str(row[8]) if row[8] else None,
                "updated_at": str(row[9]) if row[9] else None,
            },
        }

    except psycopg2.Error as e:
        return {
            "status": "error",
            "message": "Database error while retrieving employee configuration",
            "details": str(e),
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()