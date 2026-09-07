import time
from collections import defaultdict

from fastapi import HTTPException


MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300

_attempts: dict[str, list[float]] = defaultdict(list)


def check_login_rate_limit(
    employee_id: str,
) -> None:

    now = time.time()

    attempts = _attempts[employee_id]

    attempts[:] = [
        timestamp
        for timestamp in attempts
        if now - timestamp < WINDOW_SECONDS
    ]

    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=(
                "Too many login attempts. "
                "Please try again later."
            ),
        )

    attempts.append(now)