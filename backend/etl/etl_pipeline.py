"""Transform verified vehicle source groups into Star-schema load records."""

import argparse
import csv
import hashlib
import json
import os
import sys
from collections import Counter
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

import psycopg2
from dotenv import load_dotenv

try:
    from .inspect_datasets import _duplicate_counts, _header_rows, pd
except ImportError:
    from inspect_datasets import _duplicate_counts, _header_rows, pd


BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BACKEND_DIR / "data" / "raw"
OUTPUT_DIR = BACKEND_DIR / "data" / "processed"
REPORT_DIR = BACKEND_DIR / "etl"
INPUT_FILES = ("combined_cars.csv", "combined_cars2.csv", "combined_cars3.csv")

ACCEPTED_GROUPS = {
    ("combined_cars.csv", "car data.csv"): {
        "required": (
            "Car_Name", "Year", "Selling_Price", "Present_Price", "Kms_Driven",
            "Fuel_Type", "Seller_Type", "Transmission", "Owner",
        ),
    },
    ("combined_cars2.csv", "Dataset.csv"): {
        "required": (
            "Id", "year", "brand", "full_model_name", "model_name", "price",
            "distance_travelled(kms)", "fuel_type", "city", "car_age",
        ),
    },
    ("combined_cars3.csv", "cardekho_dataset.csv"): {
        "required": (
            "car_name", "brand", "model", "vehicle_age", "km_driven",
            "seller_type", "fuel_type", "transmission_type", "mileage", "engine",
            "max_power", "seats", "selling_price",
        ),
    },
}

FACT_COLUMNS = (
    "source_file_name", "source_record_ordinal", "source_name_value",
    "source_row_identifier_field", "source_row_identifier_raw",
    "brand_name_raw", "source_model_field", "model_name_raw",
    "full_model_name_raw", "city_name_raw", "vehicle_year", "fuel_type_raw",
    "transmission_type_raw", "seller_type_raw",
    "combined_cars_selling_price_raw", "combined_cars_present_price_raw",
    "combined_cars2_price_raw", "combined_cars3_selling_price_raw",
    "odometer_km", "combined_cars2_car_age_raw",
    "combined_cars3_vehicle_age_raw", "combined_cars_owner_raw",
    "combined_cars3_mileage_raw", "combined_cars3_engine_raw",
    "combined_cars3_max_power_raw", "combined_cars3_seats_raw",
)

NUMERIC_COLUMNS = tuple(
    column for column in FACT_COLUMNS
    if column in {
        "vehicle_year", "combined_cars_selling_price_raw",
        "combined_cars_present_price_raw", "combined_cars2_price_raw",
        "combined_cars3_selling_price_raw", "odometer_km",
        "combined_cars2_car_age_raw", "combined_cars3_vehicle_age_raw",
        "combined_cars_owner_raw", "combined_cars3_mileage_raw",
        "combined_cars3_engine_raw", "combined_cars3_max_power_raw",
        "combined_cars3_seats_raw",
    }
)


class InvalidRecord(ValueError):
    """A mapped value cannot be represented by the approved Star schema."""


def _raw_text(row: dict[str, str], column: str) -> str | None:
    value = row.get(column, "")
    return value if value.strip() else None


def _decimal(row: dict[str, str], column: str) -> Decimal | None:
    value = _raw_text(row, column)
    if value is None:
        return None
    try:
        parsed = Decimal(value.strip())
    except InvalidOperation as error:
        raise InvalidRecord(f"{column} is not a valid number: {value!r}") from error
    if not parsed.is_finite():
        raise InvalidRecord(f"{column} is not finite: {value!r}")
    return parsed


def _vehicle_year(row: dict[str, str], column: str) -> int | None:
    value = _decimal(row, column)
    if value is None:
        return None
    if value != value.to_integral_value():
        raise InvalidRecord(f"{column} is not an integer vehicle year: {row[column]!r}")
    year = int(value)
    if not -32768 <= year <= 32767:
        raise InvalidRecord(f"{column} does not fit the warehouse SMALLINT: {row[column]!r}")
    return year


def _model_fields(
    row: dict[str, str], source_model_field: str, model_column: str,
    full_model_column: str | None = None,
) -> dict[str, str | None]:
    model = _raw_text(row, model_column)
    field = source_model_field
    if model is None and full_model_column is not None:
        model = _raw_text(row, full_model_column)
        field = full_model_column if model is not None else source_model_field
    return {
        "source_model_field": field if model is not None else None,
        "model_name_raw": model,
        "full_model_name_raw": (
            _raw_text(row, full_model_column) if full_model_column else None
        ),
    }


def _transform(
    file_name: str, source_name: str, ordinal: int, row: dict[str, str]
) -> dict[str, Any]:
    source_key = (file_name, source_name)
    if source_key == ("combined_cars.csv", "car data.csv"):
        record = {
            "source_file_name": file_name,
            "source_record_ordinal": ordinal,
            "source_name_value": source_name,
            "source_row_identifier_field": None,
            "source_row_identifier_raw": None,
            "brand_name_raw": None,
            "city_name_raw": None,
            "vehicle_year": _vehicle_year(row, "Year"),
            "fuel_type_raw": _raw_text(row, "Fuel_Type"),
            "transmission_type_raw": _raw_text(row, "Transmission"),
            "seller_type_raw": _raw_text(row, "Seller_Type"),
            "combined_cars_selling_price_raw": _decimal(row, "Selling_Price"),
            "combined_cars_present_price_raw": _decimal(row, "Present_Price"),
            "combined_cars2_price_raw": None,
            "combined_cars3_selling_price_raw": None,
            "odometer_km": _decimal(row, "Kms_Driven"),
            "combined_cars2_car_age_raw": None,
            "combined_cars3_vehicle_age_raw": None,
            "combined_cars_owner_raw": _decimal(row, "Owner"),
            "combined_cars3_mileage_raw": None,
            "combined_cars3_engine_raw": None,
            "combined_cars3_max_power_raw": None,
            "combined_cars3_seats_raw": None,
        }
        record.update(_model_fields(row, "Car_Name", "Car_Name"))
        return record

    if source_key == ("combined_cars2.csv", "Dataset.csv"):
        record = {
            "source_file_name": file_name,
            "source_record_ordinal": ordinal,
            "source_name_value": source_name,
            "source_row_identifier_field": "Id",
            "source_row_identifier_raw": _raw_text(row, "Id"),
            "brand_name_raw": _raw_text(row, "brand"),
            "city_name_raw": _raw_text(row, "city"),
            "vehicle_year": _vehicle_year(row, "year"),
            "fuel_type_raw": _raw_text(row, "fuel_type"),
            "transmission_type_raw": None,
            "seller_type_raw": None,
            "combined_cars_selling_price_raw": None,
            "combined_cars_present_price_raw": None,
            "combined_cars2_price_raw": _decimal(row, "price"),
            "combined_cars3_selling_price_raw": None,
            "odometer_km": _decimal(row, "distance_travelled(kms)"),
            "combined_cars2_car_age_raw": _decimal(row, "car_age"),
            "combined_cars3_vehicle_age_raw": None,
            "combined_cars_owner_raw": None,
            "combined_cars3_mileage_raw": None,
            "combined_cars3_engine_raw": None,
            "combined_cars3_max_power_raw": None,
            "combined_cars3_seats_raw": None,
        }
        record.update(
            _model_fields(row, "model_name", "model_name", "full_model_name")
        )
        return record

    if source_key == ("combined_cars3.csv", "cardekho_dataset.csv"):
        record = {
            "source_file_name": file_name,
            "source_record_ordinal": ordinal,
            "source_name_value": source_name,
            "source_row_identifier_field": None,
            "source_row_identifier_raw": _raw_text(row, "Source_Row_Index"),
            "brand_name_raw": _raw_text(row, "brand"),
            "city_name_raw": None,
            "vehicle_year": None,
            "fuel_type_raw": _raw_text(row, "fuel_type"),
            "transmission_type_raw": _raw_text(row, "transmission_type"),
            "seller_type_raw": _raw_text(row, "seller_type"),
            "combined_cars_selling_price_raw": None,
            "combined_cars_present_price_raw": None,
            "combined_cars2_price_raw": None,
            "combined_cars3_selling_price_raw": _decimal(row, "selling_price"),
            "odometer_km": _decimal(row, "km_driven"),
            "combined_cars2_car_age_raw": None,
            "combined_cars3_vehicle_age_raw": _decimal(row, "vehicle_age"),
            "combined_cars_owner_raw": None,
            "combined_cars3_mileage_raw": _decimal(row, "mileage"),
            "combined_cars3_engine_raw": _decimal(row, "engine"),
            "combined_cars3_max_power_raw": _decimal(row, "max_power"),
            "combined_cars3_seats_raw": _decimal(row, "seats"),
        }
        record.update(_model_fields(row, "model", "model", "car_name"))
        return record

    raise InvalidRecord(f"No approved mapping for source group {source_name!r}")


def _read_source(path: Path) -> pd.DataFrame:
    header_rows, field_names = _header_rows(path)
    return pd.read_csv(
        path,
        header=None,
        skiprows=header_rows,
        names=field_names,
        dtype=str,
        keep_default_na=False,
        na_filter=False,
        encoding="utf-8-sig",
        low_memory=False,
    )


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _audit_raw_record(row: dict[str, str]) -> str:
    source_values = dict(row)
    if "Source_Row_Index" in source_values:
        source_values["Column1"] = source_values.pop("Source_Row_Index")
    return json.dumps(source_values, ensure_ascii=False)


def _write_csv(path: Path, columns: tuple[str, ...], rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    key: str(value) if isinstance(value, Decimal) else value
                    for key, value in row.items()
                }
            )


def _prepare_outputs() -> dict[str, Any]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    accepted: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []
    summary: dict[str, Any] = {
        "files": {},
        "accepted_by_source": Counter(),
        "pending_by_source": Counter(),
        "rejected_by_source": Counter(),
        "pending_reasons": Counter(),
        "rejected_reasons": Counter(),
        "missing_values": Counter(),
        "payload_duplicates_preserved": {},
        "input_hashes_before": {},
    }

    for file_name in INPUT_FILES:
        path = RAW_DIR / file_name
        if not path.is_file():
            raise FileNotFoundError(f"Required source CSV not found: {path}")
        summary["input_hashes_before"][file_name] = _sha256(path)
        frame = _read_source(path)
        source_column = "Source.Name"
        if source_column not in frame.columns:
            raise ValueError(f"{file_name} has no Source.Name column.")

        source_groups = frame[source_column].value_counts(dropna=False).to_dict()
        summary["files"][file_name] = {
            "input_rows": len(frame),
            "source_groups": {str(k): int(v) for k, v in source_groups.items()},
        }
        approved_payload = frame.loc[
            frame[source_column].isin(
                source_name
                for candidate_file, source_name in ACCEPTED_GROUPS
                if candidate_file == file_name
            )
        ]
        if not approved_payload.empty:
            _, payload_duplicates = _duplicate_counts(approved_payload)
            summary["payload_duplicates_preserved"][file_name] = payload_duplicates
        else:
            summary["payload_duplicates_preserved"][file_name] = 0

        for ordinal, values in enumerate(
            frame.to_dict(orient="records"), start=1
        ):
            row = {str(key): str(value) for key, value in values.items()}
            source_name = _raw_text(row, source_column)
            if source_name is None:
                reason = "Source.Name is empty; source mapping cannot be established."
                status = "pending"
            else:
                layout = ACCEPTED_GROUPS.get((file_name, source_name))
                if layout is None:
                    if file_name == "combined_cars2.csv" and source_name.startswith("UsedCars_"):
                        if row.get("Id", "").strip().casefold() == "year":
                            reason = "Repeated embedded header row; subgroup layout remains pending."
                        else:
                            reason = "UsedCars subgroup has shifted/narrowed layout; mapping remains pending."
                    elif file_name == "combined_cars.csv":
                        reason = "Source group is sparse or misaligned with the flattened header; mapping remains pending."
                    else:
                        reason = "Source group has no approved, verified mapping."
                    status = "pending"
                elif not set(layout["required"]).issubset(frame.columns):
                    missing = sorted(set(layout["required"]) - set(frame.columns))
                    reason = f"Approved source layout is missing mapped columns: {', '.join(missing)}."
                    status = "pending"
                else:
                    try:
                        record = _transform(file_name, source_name, ordinal, row)
                        for column in (
                            "combined_cars_selling_price_raw",
                            "combined_cars_present_price_raw",
                            "combined_cars2_price_raw",
                            "combined_cars3_selling_price_raw",
                            "odometer_km",
                        ):
                            value = record[column]
                            if value is not None and value < 0:
                                raise InvalidRecord(
                                    f"{column} is negative and requires review: {value}"
                                )
                    except InvalidRecord as error:
                        reason = str(error)
                        status = "rejected"
                    else:
                        accepted.append(record)
                        summary["accepted_by_source"][f"{file_name} | {source_name}"] += 1
                        for column in FACT_COLUMNS:
                            if record[column] is None:
                                summary["missing_values"][column] += 1
                        continue

            issues.append(
                {
                    "status": status,
                    "source_file_name": file_name,
                    "source_record_ordinal": ordinal,
                    "source_name_value": source_name,
                    "reason": reason,
                    "raw_record_json": _audit_raw_record(row),
                }
            )
            reason_counter = (
                summary["pending_reasons"] if status == "pending"
                else summary["rejected_reasons"]
            )
            reason_counter[reason] += 1
            source_counter = (
                summary["pending_by_source"] if status == "pending"
                else summary["rejected_by_source"]
            )
            source_counter[f"{file_name} | {source_name or '<missing>'}"] += 1

    _write_csv(OUTPUT_DIR / "accepted_vehicle_marketplace.csv", FACT_COLUMNS, accepted)
    issue_columns = (
        "status", "source_file_name", "source_record_ordinal",
        "source_name_value", "reason", "raw_record_json",
    )
    _write_csv(OUTPUT_DIR / "rejected_pending_records.csv", issue_columns, issues)

    input_rows = sum(file["input_rows"] for file in summary["files"].values())
    if len(accepted) + len(issues) != input_rows:
        raise RuntimeError("ETL accounting mismatch: input rows do not reconcile.")
    summary["accepted_total"] = len(accepted)
    summary["pending_total"] = sum(summary["pending_by_source"].values())
    summary["rejected_total"] = sum(summary["rejected_by_source"].values())
    summary["input_total"] = input_rows
    summary["accepted"] = accepted
    summary["issues"] = issues
    summary["input_hashes_after"] = {
        name: _sha256(RAW_DIR / name) for name in INPUT_FILES
    }
    return summary


def _upsert_key(cursor: Any, statement: str, parameters: tuple[Any, ...]) -> int:
    cursor.execute(statement, parameters)
    result = cursor.fetchone()
    if result is None:
        raise RuntimeError("Dimension upsert did not return a key.")
    return int(result[0])


def _load_star(records: list[dict[str, Any]], database_name: str) -> tuple[int, int]:
    load_dotenv(BACKEND_DIR / ".env")
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL is unset; no database inserts were attempted.")

    connection = psycopg2.connect(dsn)
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT current_database()")
                connected_database = cursor.fetchone()[0]
                if connected_database != database_name:
                    raise RuntimeError(
                        f"Connected database {connected_database!r} does not match "
                        f"the explicit confirmation {database_name!r}."
                    )
                cursor.execute(
                    "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'star')"
                )
                if not cursor.fetchone()[0]:
                    raise RuntimeError(
                        "The Star schema is not initialized in the confirmed database; "
                        "initialize it separately before loading."
                    )
                cursor.execute(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'star'
                    """
                )
                available = {row[0] for row in cursor.fetchall()}
                required = {
                    "dim_source_dataset", "dim_brand", "dim_model", "dim_location",
                    "dim_vehicle_year", "dim_fuel", "dim_transmission",
                    "dim_seller_type", "fact_vehicle_marketplace",
                }
                if not required.issubset(available):
                    missing = ", ".join(sorted(required - available))
                    raise RuntimeError(
                        f"Star schema is incomplete; missing tables: {missing}."
                    )

                cursor.execute("SELECT pg_advisory_xact_lock(%s)", (741923061,))
                model_cache: dict[tuple[Any, ...], int] = {}
                inserted = 0
                skipped = 0
                for record in records:
                    source_key = _upsert_key(
                        cursor,
                        """
                        INSERT INTO star.dim_source_dataset
                            (container_csv_name, source_name_value)
                        VALUES (%s, %s)
                        ON CONFLICT (container_csv_name, source_name_value)
                        DO UPDATE SET source_name_value = EXCLUDED.source_name_value
                        RETURNING source_dataset_key
                        """,
                        (record["source_file_name"], record["source_name_value"]),
                    )
                    source_scope = record["source_name_value"]

                    brand_key = None
                    if record["brand_name_raw"] is not None:
                        brand_key = _upsert_key(
                            cursor,
                            """
                            INSERT INTO star.dim_brand
                                (source_dataset_name, brand_name_raw)
                            VALUES (%s, %s)
                            ON CONFLICT (source_dataset_name, brand_name_raw)
                            DO UPDATE SET brand_name_raw = EXCLUDED.brand_name_raw
                            RETURNING brand_key
                            """,
                            (source_scope, record["brand_name_raw"]),
                        )

                    model_key = None
                    if record["model_name_raw"] is not None:
                        model_identity = (
                            source_scope, record["source_model_field"],
                            record["model_name_raw"], record["full_model_name_raw"],
                        )
                        if model_identity not in model_cache:
                            cursor.execute(
                                """
                                SELECT model_key
                                FROM star.dim_model
                                WHERE source_dataset_name = %s
                                  AND source_model_field = %s
                                  AND model_name_raw = %s
                                  AND full_model_name_raw IS NOT DISTINCT FROM %s
                                ORDER BY model_key
                                LIMIT 1
                                """,
                                model_identity,
                            )
                            found = cursor.fetchone()
                            if found is None:
                                cursor.execute(
                                    """
                                    INSERT INTO star.dim_model
                                        (source_dataset_name, source_model_field,
                                         model_name_raw, full_model_name_raw)
                                    VALUES (%s, %s, %s, %s)
                                    RETURNING model_key
                                    """,
                                    model_identity,
                                )
                                found = cursor.fetchone()
                            model_cache[model_identity] = int(found[0])
                        model_key = model_cache[model_identity]

                    location_key = None
                    if record["city_name_raw"] is not None:
                        location_key = _upsert_key(
                            cursor,
                            """
                            INSERT INTO star.dim_location
                                (source_dataset_name, city_name_raw)
                            VALUES (%s, %s)
                            ON CONFLICT (source_dataset_name, city_name_raw)
                            DO UPDATE SET city_name_raw = EXCLUDED.city_name_raw
                            RETURNING location_key
                            """,
                            (source_scope, record["city_name_raw"]),
                        )

                    year_key = None
                    if record["vehicle_year"] is not None:
                        year_key = _upsert_key(
                            cursor,
                            """
                            INSERT INTO star.dim_vehicle_year (vehicle_year)
                            VALUES (%s)
                            ON CONFLICT (vehicle_year)
                            DO UPDATE SET vehicle_year = EXCLUDED.vehicle_year
                            RETURNING vehicle_year_key
                            """,
                            (record["vehicle_year"],),
                        )

                    dimension_keys: dict[str, int | None] = {
                        "fuel_key": None,
                        "transmission_key": None,
                        "seller_type_key": None,
                    }
                    for key_column, table, value_column, natural_column, pk_column in (
                        ("fuel_key", "dim_fuel", "fuel_type_raw", "fuel_type_raw", "fuel_key"),
                        ("transmission_key", "dim_transmission", "transmission_type_raw", "transmission_type_raw", "transmission_key"),
                        ("seller_type_key", "dim_seller_type", "seller_type_raw", "seller_type_raw", "seller_type_key"),
                    ):
                        value = record[value_column]
                        if value is not None:
                            dimension_keys[key_column] = _upsert_key(
                                cursor,
                                f"""
                                INSERT INTO star.{table}
                                    (source_dataset_name, {natural_column})
                                VALUES (%s, %s)
                                ON CONFLICT (source_dataset_name, {natural_column})
                                DO UPDATE SET {natural_column} = EXCLUDED.{natural_column}
                                RETURNING {pk_column}
                                """,
                                (source_scope, value),
                            )

                    fact_values = (
                        source_key, brand_key, model_key, location_key, year_key,
                        dimension_keys["fuel_key"],
                        dimension_keys["transmission_key"],
                        dimension_keys["seller_type_key"],
                        record["source_file_name"], record["source_record_ordinal"],
                        record["source_row_identifier_field"],
                        record["source_row_identifier_raw"],
                        *[record[column] for column in NUMERIC_COLUMNS if column != "vehicle_year"],
                    )
                    cursor.execute(
                        """
                        INSERT INTO star.fact_vehicle_marketplace (
                            source_dataset_key, brand_key, model_key, location_key,
                            vehicle_year_key, fuel_key, transmission_key, seller_type_key,
                            source_file_name, source_record_ordinal,
                            source_row_identifier_field, source_row_identifier_raw,
                            combined_cars_selling_price_raw,
                            combined_cars_present_price_raw, combined_cars2_price_raw,
                            combined_cars3_selling_price_raw, odometer_km,
                            combined_cars2_car_age_raw, combined_cars3_vehicle_age_raw,
                            combined_cars_owner_raw, combined_cars3_mileage_raw,
                            combined_cars3_engine_raw, combined_cars3_max_power_raw,
                            combined_cars3_seats_raw
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        )
                        ON CONFLICT (source_file_name, source_record_ordinal) DO NOTHING
                        """,
                        fact_values,
                    )
                    if cursor.rowcount:
                        inserted += 1
                    else:
                        skipped += 1
        return inserted, skipped
    finally:
        connection.close()


def _markdown_table(headers: tuple[str, ...], rows: list[tuple[Any, ...]]) -> str:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    lines.extend("| " + " | ".join(str(item) for item in row) + " |" for row in rows)
    return "\n".join(lines)


def _write_report(summary: dict[str, Any], load_result: tuple[int, int] | None) -> Path:
    total_missing = sum(summary["missing_values"].values())
    hash_rows = [
        (name, summary["input_hashes_before"][name], summary["input_hashes_after"][name],
         "unchanged" if summary["input_hashes_before"][name] == summary["input_hashes_after"][name] else "CHANGED")
        for name in INPUT_FILES
    ]
    file_rows = [
        (
            name, details["input_rows"],
            sum(count for label, count in summary["accepted_by_source"].items()
                if label.startswith(f"{name} | ")),
            sum(count for label, count in summary["rejected_by_source"].items()
                if label.startswith(f"{name} | ")),
            sum(count for label, count in summary["pending_by_source"].items()
                if label.startswith(f"{name} | ")),
        )
        for name, details in summary["files"].items()
    ]
    reason_rows = [
        (reason, count) for reason, count in summary["pending_reasons"].most_common()
    ] + [
        (reason, count) for reason, count in summary["rejected_reasons"].most_common()
    ]
    missing_rows = [
        (column, summary["missing_values"][column])
        for column in FACT_COLUMNS if summary["missing_values"][column]
    ]
    duplicate_rows = [
        (name, count, "preserved") for name, count
        in summary["payload_duplicates_preserved"].items()
    ]
    report_lines = [
        "# ETL Validation Report",
        "",
        "- **Mode:** " + ("Star-schema load" if load_result is not None else "dry-run (default)"),
        "- **Source files:** original CSVs in `backend/data/raw/` (read-only).",
        "- **Warehouse target:** " + (
            f"confirmed `star` schema; {load_result[0]} inserted, "
            f"{load_result[1]} existing fact rows left unchanged."
            if load_result is not None else "none; no database connection or inserts attempted."
        ),
        "",
        "## Row reconciliation",
        "",
        _markdown_table(
            ("Source file", "Input rows", "Accepted", "Rejected", "Pending"),
            file_rows,
        ),
        "",
        f"**Totals:** {summary['input_total']} input = {summary['accepted_total']} accepted + "
        f"{summary['rejected_total']} rejected + {summary['pending_total']} pending.",
        "",
        "Rows in unverified source groups, including the repeated headers and all "
        "shifted `UsedCars_` rows, remain pending. No potential duplicate was removed.",
        "",
        "## Pending and rejected reasons",
        "",
        _markdown_table(("Reason", "Rows"), reason_rows),
        "",
        "Mapped non-empty numeric parse failures, non-finite numeric values, and "
        "negative raw prices or odometer values are rejected with the source row "
        "and a specific reason. Missing optional source values remain NULL.",
        "",
        "## Null handling and lineage",
        "",
        f"Accepted output contains {total_missing} NULL canonical field values; blank "
        "source values remain NULL and are not imputed. "
        f"{summary['accepted_total']} accepted rows retain source filename, source group, "
        "and one-based source-record ordinal. The labeled `Id` is retained for "
        "`combined_cars2.csv`; `combined_cars3.csv` retains its original index-like "
        "value with a NULL field label because the embedded source header is blank. "
        "The synthetic inspection name `Source_Row_Index` is not written as a source label.",
        "",
        _markdown_table(("Nullable accepted field", "NULL rows"), missing_rows),
        "",
        "## Potential payload duplicates",
        "",
        _markdown_table(("Source file", "Count", "Treatment"), duplicate_rows),
        "",
        "Counts exclude source index/ID fields when comparing payloads; they indicate "
        "possible duplicates only and are reported, not used to filter records.",
        "",
        "## Original-file integrity",
        "",
        _markdown_table(("Source file", "SHA-256 before", "SHA-256 after", "Result"), hash_rows),
        "",
        "## Mapping notes",
        "",
        "- Vehicle `Year`/`year` is mapped only to the vehicle-year dimension; no transaction date is inferred.",
        "- Price values map only to their source-specific raw-price columns; no unit or currency conversion is applied.",
        "- Only observed `city` values from the verified `Dataset.csv` group map to location.",
        "- Vehicle age is retained in source-specific measures and is not converted to a year.",
        "- Output is load-ready natural-key staging for the approved Star Schema; surrogate dimension keys are resolved only during an explicitly confirmed load.",
        "",
    ]
    path = REPORT_DIR / "validation_report.md"
    path.write_text("\n".join(report_lines), encoding="utf-8")
    return path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Build verified Star-schema ETL outputs; dry-run is the default."
    )
    parser.add_argument(
        "--load", action="store_true",
        help="Insert into an already initialized Star schema after explicit confirmation.",
    )
    parser.add_argument(
        "--confirm-database",
        help="Exact PostgreSQL database name required with --load.",
    )
    parser.add_argument(
        "--confirm-schema", choices=("star",),
        help="Explicitly confirm the approved Star schema; required with --load.",
    )
    args = parser.parse_args(argv)
    if args.load and (not args.confirm_database or args.confirm_schema != "star"):
        parser.error("--load requires --confirm-database <exact-name> and --confirm-schema star.")
    if not args.load and (args.confirm_database or args.confirm_schema):
        parser.error("Database confirmation options are valid only with --load.")

    try:
        summary = _prepare_outputs()
        load_result = (
            _load_star(summary["accepted"], args.confirm_database)
            if args.load else None
        )
        report_path = _write_report(summary, load_result)
    except (OSError, ValueError, RuntimeError, psycopg2.Error) as error:
        print(f"ETL failed: {error}", file=sys.stderr)
        return 1

    print(
        f"ETL {'load' if args.load else 'dry-run'} complete: "
        f"{summary['input_total']} input, {summary['accepted_total']} accepted, "
        f"{summary['rejected_total']} rejected, {summary['pending_total']} pending."
    )
    print(f"Accepted records: {OUTPUT_DIR / 'accepted_vehicle_marketplace.csv'}")
    print(f"Rejected/pending records: {OUTPUT_DIR / 'rejected_pending_records.csv'}")
    print(f"Validation report: {report_path}")
    if load_result is not None:
        print(f"Database fact rows inserted: {load_result[0]}; existing rows skipped: {load_result[1]}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
