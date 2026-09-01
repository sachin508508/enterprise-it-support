import asyncio
import json

from .graph import graph


async def main():

    print("=" * 70)
    print("ENTERPRISE IT SUPPORT - LANGGRAPH TEST")
    print("=" * 70)

    while True:

        question = input("\nYou: ").strip()

        if question.lower() in {
            "exit",
            "quit",
        }:
            break

        if not question:
            continue

        try:

            result = await graph.ainvoke(
                {
                    "user_query": question
                }
            )

            print("\nResponse:")
            print(
                json.dumps(
                    result["final_response"],
                    indent=2,
                    default=str,
                )
            )

        except Exception as e:

            print("\nERROR:")
            print(str(e))


if __name__ == "__main__":
    asyncio.run(main())