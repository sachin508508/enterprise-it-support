from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from ..auth.dependencies import (
    get_current_employee,
)

from ..hitl_repository import (
    create_hitl_request,
    get_all_hitl_requests,
    get_hitl_request,
    get_hitl_requests_for_employee,
    review_hitl_request,
)

from ..hitl_execution import (
    execute_approved_hitl,
)

from ..schemas.hitl import (
    HITLReviewRequest,
    HITLSubmitRequest,
)


router = APIRouter(
    prefix="/api/hitl",
    tags=["HITL"],
)


def require_admin(
    current_employee: dict,
) -> dict:

    role = (
        current_employee.get("role")
        or ""
    ).strip().lower()

    if role not in {
        "admin",
        "administrator",
    }:

        raise HTTPException(
            status_code=403,
            detail="Administrator access required.",
        )

    return current_employee


# ============================================================
# ADMIN ROUTES
# ============================================================

@router.get("/admin/queue")
async def admin_queue(
    status: str | None = None,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    require_admin(
        current_employee
    )

    if status and status not in {
        "pending",
        "approved",
        "rejected",
    }:

        raise HTTPException(
            status_code=400,
            detail="Invalid HITL status.",
        )

    requests = get_all_hitl_requests(
        status=status
    )

    return {
        "status": "success",
        "requests": requests,
    }


@router.get("/admin/{hitl_id}")
async def admin_get_request(
    hitl_id: str,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    require_admin(
        current_employee
    )

    request = get_hitl_request(
        hitl_id
    )

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="HITL request not found.",
        )

    return {
        "status": "success",
        "hitl_request": request,
    }


@router.patch("/admin/{hitl_id}")
async def admin_review_request(
    hitl_id: str,
    request: HITLReviewRequest,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    require_admin(
        current_employee
    )

    reviewer_id = current_employee[
        "employee_id"
    ]

    try:

        result = review_hitl_request(
            hitl_id=hitl_id,
            reviewer_id=reviewer_id,
            status=request.status,
            review_comment=request.review_comment,
        )

        return {
            "status": "success",
            "hitl_request": result,
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/admin/{hitl_id}/execute"
)
async def execute_hitl(
    hitl_id: str,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    require_admin(
        current_employee
    )

    request = get_hitl_request(
        hitl_id
    )

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="HITL request not found.",
        )

    if request["status"] != "approved":

        raise HTTPException(
            status_code=400,
            detail=(
                "Only approved HITL requests "
                "can be executed."
            ),
        )

    try:

        result = await execute_approved_hitl(
            request
        )

        return {
            "status": "success",
            "hitl_request": result,
        }

    except PermissionError as e:

        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# ============================================================
# EMPLOYEE ROUTES
# ============================================================

@router.post("")
async def submit_for_review(
    request: HITLSubmitRequest,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = current_employee[
        "employee_id"
    ]

    try:

        result = create_hitl_request(
            conversation_id=request.conversation_id,
            employee_id=employee_id,
            reason=request.reason,
        )

        return {
            "status": "success",
            "hitl_request": result,
        }

    except PermissionError as e:

        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/my")
async def my_hitl_requests(
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = current_employee[
        "employee_id"
    ]

    requests = (
        get_hitl_requests_for_employee(
            employee_id
        )
    )

    return {
        "status": "success",
        "requests": requests,
    }


@router.get("/{hitl_id}")
async def get_my_hitl_request(
    hitl_id: str,
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = current_employee[
        "employee_id"
    ]

    request = get_hitl_request(
        hitl_id
    )

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="HITL request not found.",
        )

    if request["employee_id"] != employee_id:

        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have access to "
                "this HITL request."
            ),
        )

    return {
        "status": "success",
        "hitl_request": request,
    }