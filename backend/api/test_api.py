import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

# Allow imports from project root when running:
# python backend/api/test_api.py
PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

BASE_URL = os.getenv(
    "TEST_API_BASE_URL",
    "http://localhost:8000",
)

EMPLOYEE_ID = os.getenv("TEST_EMPLOYEE_ID", "EMP001")
PASSWORD = os.getenv("TEST_EMPLOYEE_PASSWORD", "password")


def print_result(name: str, response: requests.Response):
    print(f"\n{'=' * 70}")
    print(name)
    print(f"{'=' * 70}")
    print("HTTP:", response.status_code)

    try:
        print("Response:")
        print(response.json())
    except Exception:
        print(response.text)


def login() -> str:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "employee_id": EMPLOYEE_ID,
            "password": PASSWORD,
        },
        timeout=30,
    )

    print_result("1. LOGIN", response)

    assert response.status_code == 200, (
        f"Login failed: {response.text}"
    )

    data = response.json()

    token = data.get("access_token")

    assert token, "Login succeeded but access_token was not returned."

    return token


def test_mcp_jira(token: str):
    """
    Real MCP/Jira integration test.

    Flow:
        FastAPI
          ↓
        LangGraph
          ↓
        DeepSeek Router
          ↓
        MCP Node
          ↓
        MCP Server
          ↓
        Jira
    """

    query = "Get the details of Jira project KAN."

    response = requests.post(
        f"{BASE_URL}/api/chat",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "query": query,
        },
        timeout=120,
    )

    print_result(
        "2. REAL MCP / JIRA TEST",
        response,
    )

    assert response.status_code == 200, (
        f"MCP/Jira request failed with HTTP "
        f"{response.status_code}: {response.text}"
    )

    data = response.json()

    assert data.get("query_type") == "Action", (
        f"Expected query_type='Action', "
        f"got: {data.get('query_type')}"
    )

    assert data.get("status") == "successful", (
        f"MCP/Jira request was not successful.\n"
        f"Status: {data.get('status')}\n"
        f"Response: {data.get('response')}"
    )

    assert data.get("response"), (
        "MCP/Jira request succeeded but no response was returned."
    )

    print("\n✅ REAL MCP/JIRA TEST PASSED")
    print("Query Type:", data.get("query_type"))
    print("Status:", data.get("status"))
    print("Response:", data.get("response"))


def main():
    print("\n" + "=" * 70)
    print("ENTERPRISE IT SUPPORT API TEST")
    print("=" * 70)
    print("API:", BASE_URL)
    print("Employee:", EMPLOYEE_ID)

    # 1. Health check
    response = requests.get(
        f"{BASE_URL}/health",
        timeout=10,
    )

    print_result("HEALTH CHECK", response)

    assert response.status_code == 200
    assert response.json().get("status") == "healthy"

    # 2. Login
    token = login()

    # 3. Real MCP/Jira integration
    test_mcp_jira(token)

    print("\n" + "=" * 70)
    print("ALL MCP/JIRA TESTS PASSED")
    print("=" * 70)


if __name__ == "__main__":
    main()