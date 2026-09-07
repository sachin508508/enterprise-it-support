from ..tool_call.db.connection import get_db_connection


ROLE_LEVELS = {
    "employee": 1,
    "tls": 2,
    "manager": 3,
    "admin": 4,
    "administrator": 4,
}


def normalize_role(role: str | None) -> str | None:
    if not role:
        return None

    return role.strip().lower()


def get_employee_role(
    employee_id: str,
) -> str | None:

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT role
            FROM public.employees
            WHERE employee_id = %s;
            """,
            (employee_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return normalize_role(row[0])

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def get_role_level(
    role: str | None,
) -> int:

    normalized_role = normalize_role(role)

    if normalized_role is None:
        return 0

    return ROLE_LEVELS.get(
        normalized_role,
        0,
    )


def is_admin(
    employee_id: str,
) -> bool:

    role = get_employee_role(
        employee_id
    )

    return role in {
        "admin",
        "administrator",
    }


def is_manager_of(
    manager_id: str,
    employee_id: str,
) -> bool:

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT 1
            FROM public.employees
            WHERE employee_id = %s
              AND manager_id = %s;
            """,
            (
                employee_id,
                manager_id,
            ),
        )

        return cursor.fetchone() is not None

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def can_access_employee(
    requester_id: str,
    target_employee_id: str,
) -> bool:

    # Everyone can access their own information.
    if requester_id == target_employee_id:
        return True

    requester_role = get_employee_role(
        requester_id
    )

    if requester_role is None:
        return False

    # Admin has full employee-data access.
    if requester_role in {
        "admin",
        "administrator",
    }:
        return True

    # Manager can access direct reports.
    if requester_role == "manager":
        return is_manager_of(
            manager_id=requester_id,
            employee_id=target_employee_id,
        )

    # Employee and TLS cannot access
    # another employee's information.
    return False