from .connection import get_connection


def execute_query(query, params=None):
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)

            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()

            return [
                dict(zip(columns, row))
                for row in rows
            ]

    finally:
        conn.close()