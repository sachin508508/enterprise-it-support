from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from pydantic import BaseModel

from .rate_limit import check_login_rate_limit

from .dependencies import (
    get_current_employee,
)

from .repository import (
    get_employee_with_credentials,
)

from .rate_limit import (
    check_login_rate_limit,
)

from .security import (
    create_access_token,
    verify_password,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


class LoginRequest(BaseModel):

    employee_id: str
    password: str


@router.post("/login")
async def login(
    request: LoginRequest,
):

    employee_id = (
        request.employee_id.strip()
    )
    check_login_rate_limit(employee_id)

    if not employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID is required.",
        )

    check_login_rate_limit(
        employee_id
    )

    employee = (
        get_employee_with_credentials(
            employee_id
        )
    )

    if employee is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid employee ID or password.",
        )

    if (
        employee[
            "employment_status"
        ]
        != "active"
    ):

        raise HTTPException(
            status_code=403,
            detail="Employee account is inactive.",
        )

    password_valid = (
        verify_password(
            request.password,
            employee[
                "password_hash"
            ],
        )
    )

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid employee ID or password.",
        )

    token = create_access_token(
        employee[
            "employee_id"
        ]
    )

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user": {
            "employee_id": employee[
                "employee_id"
            ],
            "name": employee[
                "name"
            ],
            "email": employee[
                "email"
            ],
            "department": employee[
                "department"
            ],
            "job_title": employee[
                "job_title"
            ],
            "role": employee[
                "role"
            ],
        },
    }


@router.get("/me")
async def get_me(
    current_employee: dict = Depends(
        get_current_employee
    ),
):

    return {
        "status": "success",
        "user": {
            "employee_id": current_employee[
                "employee_id"
            ],
            "name": current_employee[
                "name"
            ],
            "email": current_employee[
                "email"
            ],
            "department": current_employee[
                "department"
            ],
            "job_title": current_employee[
                "job_title"
            ],
            "role": current_employee[
                "role"
            ],
        },
    }