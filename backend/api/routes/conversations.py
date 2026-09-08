from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from ..auth.dependencies import (
    get_current_employee,
)

from ..repositories.conversation import (
    get_conversation,
    get_conversations,
)


router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"],
)


def is_admin(
    employee: dict,
) -> bool:

    role = (
        employee.get("role")
        or ""
    ).strip().lower()

    return role in {
        "admin",
        "administrator",
    }


@router.get("")
async def list_conversations(
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = (
        current_employee["employee_id"]
    )

    conversations = get_conversations(
        employee_id=employee_id
    )

    return {
        "status": "success",
        "conversations": conversations,
    }


@router.get("/{conversation_id}")
async def conversation_details(
    conversation_id: str,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = (
        current_employee["employee_id"]
    )

    conversation = get_conversation(
        conversation_id
    )

    if conversation is None:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    # ---------------------------------------------------------
    # Normal employee:
    # only their own conversations.
    #
    # Administrator:
    # may inspect conversations for administrative review.
    # ---------------------------------------------------------

    if (
        not is_admin(current_employee)
        and conversation["employee_id"]
        != employee_id
    ):

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have access to "
                "this conversation"
            ),
        )

    return {
        "status": "success",
        "conversation": conversation,
    }