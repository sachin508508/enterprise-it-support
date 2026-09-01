import os

import psycopg2
from dotenv import load_dotenv


# Load variables from backend/.env
load_dotenv()


def get_db_connection():
    """
    Create and return a PostgreSQL database connection.

    Database configuration is read from environment variables.
    """

    connection = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "it_operations_db"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

    return connection