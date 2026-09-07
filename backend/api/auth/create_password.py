import sys

from .security import hash_password

from ...ai.tool_call.db.connection import (
    get_db_connection,
)


def set_password(
    employee_id: str,
    password: str,
):

    password_hash = hash_password(
        password
    )

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO employee_credentials (
                employee_id,
                password_hash
            )
            VALUES (%s, %s)
            ON CONFLICT (employee_id)
            DO UPDATE SET
                password_hash = EXCLUDED.password_hash;
            """,
            (
                employee_id,
                password_hash,
            ),
        )

        connection.commit()

        print(
            f"Password created for {employee_id}"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


if __name__ == "__main__":

    if len(sys.argv) != 3:
        print(
            "Usage: python -m "
            "backend.api.auth.create_password "
            "<employee_id> <password>"
        )
        sys.exit(1)

    set_password(
        sys.argv[1],
        sys.argv[2],
    )