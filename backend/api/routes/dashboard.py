from fastapi import (
    APIRouter,
    Depends,
)

from ..auth.dependencies import (
    get_current_employee,
)

from ..dashboard_repository import (
    get_dashboard_data,
)

from ..schemas.dashboard import (
    DashboardResponse,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
async def dashboard(
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    employee_id = current_employee[
        "employee_id"
    ]

    data = get_dashboard_data(
        employee_id
    )

    return {
        "status": "success",
        **data,
    }