import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


LOG_FILE = (
    Path(__file__).resolve().parent.parent
    / "logs"
    / "chat_logs.jsonl"
)

def _make_json_serializable(
    value: Any,
) -> Any:

    if value is None:
        return None

    if isinstance(
        value,
        (
            str,
            int,
            float,
            bool,
        ),
    ):
        return value

    if isinstance(value, dict):
        return {
            str(key): _make_json_serializable(
                item
            )
            for key, item in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [
            _make_json_serializable(item)
            for item in value
        ]

    if hasattr(value, "model_dump"):
        return _make_json_serializable(
            value.model_dump()
        )

    if hasattr(value, "__dict__"):
        return _make_json_serializable(
            value.__dict__
        )

    return str(value)


def store_chat_result(
    request_id: str,
    user_query: str,
    result: dict,
) -> None:

    LOG_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    log_entry = {
        "request_id": request_id,

        "created_at": datetime.now(
            timezone.utc
        ).isoformat(),

        "user_query": user_query,

        "result": _make_json_serializable(
            result
        ),
    }

    with LOG_FILE.open(
        "a",
        encoding="utf-8",
    ) as file:

        file.write(
            json.dumps(
                log_entry,
                ensure_ascii=False,
            )
            + "\n"
        )