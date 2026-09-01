import os
from pathlib import Path

import requests
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env")


JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
JIRA_EMAIL = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")


if not JIRA_BASE_URL:
    raise ValueError("JIRA_BASE_URL is missing from .env")

if not JIRA_EMAIL:
    raise ValueError("JIRA_EMAIL is missing from .env")

if not JIRA_API_TOKEN:
    raise ValueError("JIRA_API_TOKEN is missing from .env")


class JiraClient:
    """Low-level client for Jira Cloud REST API."""

    def __init__(self):
        self.base_url = JIRA_BASE_URL.rstrip("/")

        self.auth = (
            JIRA_EMAIL,
            JIRA_API_TOKEN,
        )

        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def get(self, endpoint: str):
        response = requests.get(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            auth=self.auth,
            timeout=30,
        )

        self._raise_for_error(response)

        return response.json()

    def post(self, endpoint: str, payload: dict):
        response = requests.post(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            auth=self.auth,
            json=payload,
            timeout=30,
        )

        self._raise_for_error(response)

        return response.json()

    def put(self, endpoint: str, payload: dict):
        response = requests.put(
            f"{self.base_url}{endpoint}",
            headers=self.headers,
            auth=self.auth,
            json=payload,
            timeout=30,
        )

        self._raise_for_error(response)

        # Some Jira endpoints return no JSON.
        if response.content:
            return response.json()

        return {}

    @staticmethod
    def _raise_for_error(response):
        if not response.ok:
            raise RuntimeError(
                f"Jira error {response.status_code}: "
                f"{response.text}"
            )
