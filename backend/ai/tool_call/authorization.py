from .access_control import (
    can_access_employee,
    get_employee_role,
    is_admin,
)

from .db.connection import get_db_connection


EMPLOYEE_SCOPED_TOOLS = {
    "get_employee_details",
    "get_system_access",
    "get_employee_configurations",
    "get_jira_account",
}


def verify_hitl_approval(
    hitl_id: str,
    requester_id: str,
    approved_by: str,
) -> bool:
    """
    Verify that the supplied HITL approval is a real,
    approved request belonging to the requester and
    approved by an administrator.
    """

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                status,
                employee_id,
                reviewed_by
            FROM public.hitl_requests
            WHERE id = %s;
            """,
            (hitl_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return False

        status = row[0]
        hitl_employee_id = row[1]
        reviewed_by = row[2]

        # HITL must actually be approved.
        if status != "approved":
            return False

        # HITL must belong to the employee executing
        # the original request.
        if hitl_employee_id != requester_id:
            return False

        # The approving administrator must match the
        # administrator supplied in the execution context.
        if reviewed_by != approved_by:
            return False

        # The approver must currently have admin privileges.
        if not is_admin(approved_by):
            return False

        return True

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


def authorize_tool_call(
    tool_name: str,
    requester_id: str,
    arguments: dict,
    hitl_approved: bool = False,
    hitl_id: str | None = None,
    approved_by: str | None = None,
) -> None:

    # ---------------------------------------------------------
    # Non employee-scoped tools do not require employee RBAC.
    # ---------------------------------------------------------

    if tool_name not in EMPLOYEE_SCOPED_TOOLS:
        return

    target_employee_id = arguments.get(
        "employee_id"
    )

    if not target_employee_id:
        raise PermissionError(
            "Employee ID is required for this operation."
        )

    # ---------------------------------------------------------
    # Verify that target employee exists.
    # ---------------------------------------------------------

    target_role = get_employee_role(
        target_employee_id
    )

    if target_role is None:
        raise PermissionError(
            "The requested employee does not exist."
        )

    # ---------------------------------------------------------
    # Normal RBAC
    # ---------------------------------------------------------

    allowed = can_access_employee(
        requester_id=requester_id,
        target_employee_id=target_employee_id,
    )

    if allowed:
        return

    # ---------------------------------------------------------
    # HITL override
    #
    # Normal RBAC denied the operation, so a HITL approval
    # is required.
    # ---------------------------------------------------------

    if hitl_approved:

        if not hitl_id:
            raise PermissionError(
                "HITL approval ID is required."
            )

        if not approved_by:
            raise PermissionError(
                "HITL approving administrator is required."
            )

        approval_valid = verify_hitl_approval(
            hitl_id=hitl_id,
            requester_id=requester_id,
            approved_by=approved_by,
        )

        if not approval_valid:
            raise PermissionError(
                "The HITL approval is invalid or no longer active."
            )

        return

    # ---------------------------------------------------------
    # Normal authorization denial
    # ---------------------------------------------------------

    raise PermissionError(
        "You are not authorized to access "
        "information for this employee."
    )