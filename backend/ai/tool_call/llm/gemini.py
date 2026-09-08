import os
from dotenv import load_dotenv
from google import genai

load_dotenv()


def get_gemini_client():
    return genai.Client(
        api_key=os.getenv("GEMINI_API_KEY")
    )