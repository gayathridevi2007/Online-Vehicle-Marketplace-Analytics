"""Initialize exactly one warehouse schema in an explicitly confirmed database."""

import argparse
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent
SCHEMA_FILES = {
    "star": BACKEND_DIR.parent / "database" / "schema" / "star_schema.sql",
    "snowflake": BACKEND_DIR.parent / "database" / "schema" / "snowflake_schema.sql",
}


def main():
    parser = argparse.ArgumentParser(
        description="Create one selected warehouse schema; existing objects are never replaced."
    )
    parser.add_argument(
        "--schema",
        required=True,
        choices=tuple(SCHEMA_FILES),
        help="Explicit schema to initialize; no default is selected.",
    )
    parser.add_argument(
        "--confirm-database",
        required=True,
        help="Must exactly match the connected PostgreSQL database name.",
    )
    args = parser.parse_args()

    load_dotenv(BACKEND_DIR / ".env")
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        parser.error("DATABASE_URL is unset; configure it in backend/.env or the environment.")

    sql_path = SCHEMA_FILES[args.schema]
    sql_text = sql_path.read_text(encoding="utf-8")
    connection = psycopg2.connect(dsn)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_database()")
                database_name = cursor.fetchone()[0]
                if database_name != args.confirm_database:
                    raise RuntimeError(
                        f"Connected database {database_name!r} does not match "
                        f"--confirm-database {args.confirm_database!r}; no schema changes made."
                    )

                cursor.execute(
                    "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = %s)",
                    (args.schema,),
                )
                schema_exists = cursor.fetchone()[0]
                if schema_exists:
                    cursor.execute(
                        """
                        SELECT relname
                        FROM pg_class
                        WHERE relnamespace = to_regnamespace(%s)
                          AND relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
                        ORDER BY relname
                        """,
                        (args.schema,),
                    )
                    existing_relations = [row[0] for row in cursor.fetchall()]
                    if existing_relations:
                        names = ", ".join(existing_relations)
                        raise RuntimeError(
                            f"Schema {args.schema!r} already contains relations "
                            f"({names}); refusing to modify it."
                        )

                cursor.execute(sql_text)
    finally:
        connection.close()

    print(
        f"Initialized the {args.schema!r} schema in confirmed database "
        f"{database_name!r}."
    )


if __name__ == "__main__":
    main()
