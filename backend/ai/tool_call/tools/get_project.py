import psycopg2

from ..db.connection import get_db_connection


def get_project_details(project_id: str):
    """
    Retrieve project details from PostgreSQL using project ID.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                project_id,
                project_name,
                description,
                status,
                project_manager_id,
                start_date,
                end_date,
                created_at,
                updated_at
            FROM public.projects
            WHERE project_id = %s;
            """,
            (project_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return {
                "status": "error",
                "message": "Project not found",
                "project_id": project_id,
            }

        return {
            "status": "success",
            "project": {
                "project_id": row[0],
                "project_name": row[1],
                "description": row[2],
                "status": row[3],
                "project_manager_id": row[4],
                "start_date": str(row[5]) if row[5] else None,
                "end_date": str(row[6]) if row[6] else None,
                "created_at": str(row[7]) if row[7] else None,
                "updated_at": str(row[8]) if row[8] else None,
            },
        }

    except psycopg2.Error as e:
        return {
            "status": "error",
            "message": "Database error while retrieving project details",
            "details": str(e),
        }

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()