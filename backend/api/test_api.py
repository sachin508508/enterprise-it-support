import os
import sys

import requests


BASE_URL = os.getenv(
    "API_BASE_URL",
    "http://localhost:8000",
)

EMPLOYEE_ID = os.getenv(
    "TEST_EMPLOYEE_ID",
    "EMP001",
)

PASSWORD = os.getenv(
    "TEST_PASSWORD",
    "password",
)


def check(
    name: str,
    condition: bool,
    details: str = "",
):
    if condition:
        print(f"✅ {name}")
    else:
        print(f"❌ {name}")
        if details:
            print(f"   {details}")
        return False

    return True


def main():
    print("\n==============================")
    print(" Enterprise IT Support Test")
    print("==============================\n")

    failures = 0

    # ---------------------------------
    # 1. Health
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/health",
        timeout=10,
    )

    if not check(
        "Health endpoint",
        response.status_code == 200
        and response.json().get("status") == "healthy",
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 2. Login
    # ---------------------------------

    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "employee_id": EMPLOYEE_ID,
            "password": PASSWORD,
        },
        timeout=10,
    )

    login_ok = (
        response.status_code == 200
        and "access_token" in response.json()
    )

    if not check(
        "Login",
        login_ok,
        response.text,
    ):
        failures += 1
        print("\nCannot continue without login token.")
        sys.exit(1)

    login_data = response.json()
    token = login_data["access_token"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    print(f"   Logged in as: {EMPLOYEE_ID}")
    print(f"   Role: {login_data['user'].get('role')}")

    # ---------------------------------
    # 3. /me
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers=headers,
        timeout=10,
    )

    if not check(
        "Authenticated /me",
        response.status_code == 200,
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 4. Dashboard
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/dashboard",
        headers=headers,
        timeout=10,
    )

    if not check(
        "Dashboard",
        response.status_code == 200,
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 5. Conversations
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/conversations",
        headers=headers,
        timeout=10,
    )

    if not check(
        "Conversation history",
        response.status_code == 200,
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 6. One RAG request
    # ---------------------------------

    print("\nRunning one AI request...")
    print("This may consume an LLM API call.\n")

    response = requests.post(
        f"{BASE_URL}/api/chat",
        headers=headers,
        json={
            "query": (
                "What are the general IT support "
                "guidelines for employees?"
            )
        },
        timeout=120,
    )

    chat_ok = response.status_code == 200

    if not check(
        "AI chat request",
        chat_ok,
        response.text,
    ):
        failures += 1

    conversation_id = None

    if chat_ok:
        chat_data = response.json()

        print(
            f"   Query type: "
            f"{chat_data.get('query_type')}"
        )

        print(
            f"   Status: "
            f"{chat_data.get('status')}"
        )

        conversation_id = chat_data.get(
            "request_id"
        )

    # ---------------------------------
    # 7. History after chat
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/conversations",
        headers=headers,
        timeout=10,
    )

    if not check(
        "Conversation history after chat",
        response.status_code == 200,
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 8. Unauthorized request
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        timeout=10,
    )

    if not check(
        "Unauthorized request rejected",
        response.status_code in {401, 403},
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 9. Invalid token
    # ---------------------------------

    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={
            "Authorization": "Bearer invalid-token"
        },
        timeout=10,
    )

    if not check(
        "Invalid token rejected",
        response.status_code == 401,
        response.text,
    ):
        failures += 1

    # ---------------------------------
    # 10. Conversation details
    # ---------------------------------

    if conversation_id:
        response = requests.get(
            f"{BASE_URL}/api/conversations/"
            f"{conversation_id}",
            headers=headers,
            timeout=10,
        )

        if not check(
            "Conversation details",
            response.status_code == 200,
            response.text,
        ):
            failures += 1

    # ---------------------------------
    # Result
    # ---------------------------------

    print("\n==============================")

    if failures == 0:
        print("🎉 ALL TESTS PASSED")
    else:
        print(
            f"❌ {failures} TEST(S) FAILED"
        )

    print("==============================\n")

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()