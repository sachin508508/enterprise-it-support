from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .repository import get_employee
from .security import decode_access_token


security = HTTPBearer()


def get_current_employee(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> dict:

    token = credentials.credentials

    employee_id = decode_access_token(token)

    if not employee_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    employee = get_employee(employee_id)

    if employee is None:
        raise HTTPException(
            status_code=401,
            detail="Employee not found",
        )

    if employee["employment_status"] != "active":
        raise HTTPException(
            status_code=403,
            detail="Employee account is inactive",
        )

    return employee