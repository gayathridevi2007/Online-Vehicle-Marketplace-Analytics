"""Inspect source vehicle CSVs and generate ETL preparation reports."""

from __future__ import annotations

import argparse
import csv
import importlib.util
import itertools
import math
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from importlib.metadata import distribution
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_RAW_DIR = ROOT / "backend" / "data" / "raw"
DEFAULT_OUTPUT_DIR = ROOT / "backend" / "etl"
DATASET_NAMES = (
    "combined_cars.csv",
    "combined_cars2.csv",
    "combined_cars3.csv",
)
NUMERIC_NAME_HINTS = (
    "year",
    "price",
    "km",
    "distance",
    "age",
    "rank",
    "mileage",
    "engine",
    "power",
    "seat",
    "owner",
    "inv_",
    "std_",
    "best_buy",
)
IDENTIFIER_COLUMNS = {"id", "source_row_index"}
MISSING = None


def _import_pandas():
    """Prefer the installed Pandas package if a global module shadows it."""
    spec = importlib.util.find_spec("pandas")
    installed_init = Path(distribution("pandas").locate_file("pandas/__init__.py"))

    if spec is not None and spec.origin:
        try:
            current_origin = Path(spec.origin).resolve()
            installed_origin = installed_init.resolve()
        except OSError:
            current_origin = Path(spec.origin)
            installed_origin = installed_init

        if current_origin != installed_origin:
            package_root = str(installed_init.parent.parent)
            if package_root in sys.path:
                sys.path.remove(package_root)
            sys.path.insert(0, package_root)

    import pandas as pd

    return pd


pd = _import_pandas()


@dataclass
class Dataset:
    name: str
    path: Path
    frame: Any
    header_rows: int


def _header_rows(path: Path) -> tuple[int, list[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        rows = list(itertools.islice(csv.reader(source), 2))

    if not rows:
        raise ValueError(f"{path.name} is empty.")

    first = rows[0]
    has_embedded_header = (
        len(rows) > 1
        and len(first) > 1
        and first[0].strip().lower() == "source.name"
        and all(
            not value.strip() or value.strip().lower().startswith("column")
            for value in first[1:]
        )
    )
    if not has_embedded_header:
        return 1, first

    embedded_fields = rows[1]
    if len(embedded_fields) < 3 or not embedded_fields[0].strip():
        raise ValueError(f"{path.name} has an unexpected embedded header row.")

    field_names = [
        "Source.Name",
        "Source_Row_Index",
        *[value.strip() for value in embedded_fields[2:]],
    ]
    return 2, field_names


def load_dataset(path: Path) -> Dataset:
    header_rows, field_names = _header_rows(path)
    if header_rows == 1:
        frame = pd.read_csv(path, low_memory=False)
    else:
        frame = pd.read_csv(
            path,
            header=None,
            skiprows=header_rows,
            names=field_names,
            low_memory=False,
        )

    return Dataset(
        name=path.name,
        path=path,
        frame=frame,
        header_rows=header_rows,
    )


def _is_missing(value: Any) -> bool:
    try:
        return bool(pd.isna(value))
    except (TypeError, ValueError):
        return False


def _format_value(value: Any) -> str:
    if _is_missing(value):
        return "—"
    text = str(value).replace("\r", " ").replace("\n", " ")
    return text.replace("|", r"\|")


def _inline_code(value: Any) -> str:
    text = _format_value(value).replace("`", r"\`")
    return f"`{text}`"


def _markdown_table(headers: list[str], rows: list[list[Any]]) -> str:
    lines = [
        "| " + " | ".join(_format_value(item) for item in headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    lines.extend(
        "| " + " | ".join(_format_value(item) for item in row) + " |"
        for row in rows
    )
    return "\n".join(lines)


def _numeric_profile(frame: Any) -> dict[str, dict[str, Any]]:
    profiles: dict[str, dict[str, Any]] = {}
    for column in frame.columns:
        converted = pd.to_numeric(frame[column], errors="coerce")
        non_missing = int(frame[column].notna().sum())
        parsed = int(converted.notna().sum())
        ratio = parsed / non_missing if non_missing else 0.0
        native_numeric = pd.api.types.is_numeric_dtype(frame[column].dtype)
        numeric_name = any(hint in str(column).lower() for hint in NUMERIC_NAME_HINTS)
        if not native_numeric and not numeric_name and (non_missing == 0 or ratio < 0.95):
            continue
        if not native_numeric and parsed == 0:
            continue

        finite = converted[
            converted.map(
                lambda value: math.isfinite(value) if not _is_missing(value) else False
            )
        ]
        profiles[str(column)] = {
            "values": converted,
            "parsed": parsed,
            "unparsed": max(0, non_missing - parsed),
            "non_missing": non_missing,
            "ratio": ratio,
            "finite": finite,
            "infinite": int(converted.map(lambda value: not _is_missing(value) and not math.isfinite(value)).sum()),
        }
    return profiles


def _categorical_columns(dataset: Dataset, numeric: dict[str, dict[str, Any]]) -> list[str]:
    return [
        str(column)
        for column in dataset.frame.columns
        if str(column) not in numeric
        and (
            pd.api.types.is_string_dtype(dataset.frame[column].dtype)
            or pd.api.types.is_object_dtype(dataset.frame[column].dtype)
            or isinstance(dataset.frame[column].dtype, pd.CategoricalDtype)
        )
    ]


def _duplicate_counts(frame: Any) -> tuple[int, int]:
    exact = int(frame.duplicated().sum())
    columns = [
        str(column)
        for column in frame.columns
        if str(column).strip().lower() != "source_row_index"
        and str(column).strip().lower() != "id"
    ]
    payload = int(frame.duplicated(subset=columns).sum()) if columns else 0
    return exact, payload


def _problem_values(dataset: Dataset, numeric: dict[str, dict[str, Any]]) -> list[str]:
    frame = dataset.frame
    issues: list[str] = []
    current_year = datetime.now().year

    for column, profile in numeric.items():
        values = profile["values"]
        label = column.lower()
        unparsed = profile["unparsed"]
        if unparsed and any(hint in label for hint in NUMERIC_NAME_HINTS):
            examples = (
                frame.loc[values.isna() & frame[column].notna(), column]
                .astype(str)
                .drop_duplicates()
                .head(8)
                .tolist()
            )
            issues.append(
                f"`{column}` has {unparsed} non-empty value(s) that do not parse "
                f"as numbers (examples: {', '.join(_inline_code(v) for v in examples)})."
            )

        finite = profile["finite"]
        if profile["infinite"]:
            issues.append(
                f"`{column}` contains {profile['infinite']} infinite numeric value(s)."
            )
        if any(hint in label for hint in ("price", "km", "distance", "age", "mileage", "engine", "power", "seat", "owner")):
            negative_count = int((finite < 0).sum())
            if negative_count:
                issues.append(
                    f"`{column}` contains {negative_count} negative value(s); review against source semantics."
                )
        if "year" in label and not any(age in label for age in ("age",)):
            outside = finite[(finite < 1886) | (finite > current_year)]
            if len(outside):
                samples = sorted(outside.unique().tolist())[:8]
                issues.append(
                    f"`{column}` has {len(outside)} year value(s) outside 1886–{current_year} "
                    f"(examples: {', '.join(_inline_code(v) for v in samples)}); these are "
                    "vehicle-year checks, not transaction-date checks."
                )
        if label == "seats":
            zero_count = int((finite == 0).sum())
            if zero_count:
                issues.append(
                    f"`{column}` contains {zero_count} zero value(s); confirm whether they mean unknown or invalid."
                )

    for column in _categorical_columns(dataset, numeric):
        values = frame[column].dropna().astype(str)
        whitespace = values[values.ne(values.str.strip())]
        if not whitespace.empty:
            issues.append(
                f"`{column}` has {len(whitespace)} value(s) with leading or trailing whitespace."
            )

    header_names = {str(column).strip().casefold() for column in frame.columns}
    header_like_rows = []
    for row_number, row in enumerate(frame.itertuples(index=False, name=None), start=1):
        matches = [
            f"{column}={value}"
            for column, value in zip(frame.columns, row)
            if not _is_missing(value) and str(value).strip().casefold() in header_names
        ]
        if len(matches) >= 3:
            header_like_rows.append((row_number, row, matches))
    if header_like_rows:
        source_column = next(
            (column for column in frame.columns if str(column).casefold() == "source.name"),
            None,
        )
        examples = []
        for row_number, row, matches in header_like_rows[:8]:
            source_name = row[list(frame.columns).index(source_column)] if source_column else "unknown"
            examples.append(
                f"data row {row_number} (`{_format_value(source_name)}`; "
                f"{', '.join(_inline_code(match) for match in matches[:5])})"
            )
        issues.append(
            f"{len(header_like_rows)} row(s) contain at least three values matching "
            f"column names and may be repeated embedded headers (examples: "
            f"{'; '.join(examples)}). Review before treating them as vehicle records."
        )

    source_column = next(
        (column for column in frame.columns if str(column).casefold() == "source.name"),
        None,
    )
    if source_column is not None:
        populated_patterns = {}
        for source_name, group in frame.groupby(source_column, dropna=False, sort=True):
            populated_patterns[str(source_name)] = tuple(
                str(column)
                for column in frame.columns
                if str(column) != str(source_column) and group[column].notna().any()
            )
        distinct_patterns = set(populated_patterns.values())
        if len(distinct_patterns) > 1:
            examples = []
            seen = set()
            for source_name, columns in populated_patterns.items():
                if columns in seen:
                    continue
                seen.add(columns)
                examples.append(
                    f"`{source_name}`: {', '.join(f'`{column}`' for column in columns) or 'no other populated fields'}"
                )
                if len(examples) == 4:
                    break
            issues.append(
                f"Source.Name groups have {len(distinct_patterns)} different "
                f"populated-column patterns. A single shared row schema may be "
                f"misaligned (examples: {'; '.join(examples)})."
            )

    return issues


def _source_coverage(dataset: Dataset) -> list[list[Any]]:
    frame = dataset.frame
    source_column = next(
        (column for column in frame.columns if str(column).casefold() == "source.name"),
        None,
    )
    if source_column is None:
        return []

    rows = []
    for source_name, group in frame.groupby(source_column, dropna=False, sort=True):
        populated = [
            f"`{column}` ({int(group[column].notna().sum()):,})"
            for column in frame.columns
            if str(column) != str(source_column)
            and group[column].notna().any()
        ]
        rows.append(
            [
                _format_value(source_name),
                f"{len(group):,}",
                ", ".join(populated) or "No populated non-source fields",
            ]
        )
    return rows


def _dataset_section(dataset: Dataset) -> str:
    frame = dataset.frame
    numeric = _numeric_profile(frame)
    categoricals = _categorical_columns(dataset, numeric)
    exact_duplicates, payload_duplicates = _duplicate_counts(frame)
    lines = [
        f"## {dataset.name}",
        "",
        f"- **Data rows:** {len(frame):,}",
        f"- **Data columns:** {len(frame.columns):,}",
        f"- **CSV header/metadata rows skipped:** {dataset.header_rows - 1}",
        f"- **Pandas version:** {pd.__version__}",
        f"- **Exact full-row duplicates after parsing:** {exact_duplicates:,}",
        f"- **Potential same-payload duplicates** (excluding source row index and `Id`, "
        f"but retaining other fields): {payload_duplicates:,}",
        "",
        "### Exact column names and Pandas dtypes",
        "",
        _markdown_table(
            ["Column", "Pandas dtype", "Non-missing", "Missing"],
            [
                [
                    column,
                    frame[column].dtype,
                    int(frame[column].notna().sum()),
                    int(frame[column].isna().sum()),
                ]
                for column in frame.columns
            ],
        ),
        "",
        "### First 10 data records",
        "",
        _markdown_table(
            [str(column) for column in frame.columns],
            frame.head(10).where(frame.head(10).notna(), MISSING).values.tolist(),
        ),
        "",
        "### Numerical summaries",
        "",
    ]

    if numeric:
        summary_rows = []
        for column, profile in numeric.items():
            finite = profile["finite"]
            summary_rows.append(
                [
                    column,
                    f"{profile['parsed']:,}",
                    f"{profile['unparsed']:,}",
                    f"{profile['infinite']:,}",
                    finite.min() if not finite.empty else "—",
                    finite.max() if not finite.empty else "—",
                    finite.mean() if not finite.empty else "—",
                ]
            )
        lines.append(
            _markdown_table(
                ["Column", "Parsed numeric", "Unparsed", "Infinite", "Minimum", "Maximum", "Average"],
                summary_rows,
            )
        )
        lines.append("")
        lines.append(
            "Numeric parsing is also attempted for string-typed columns. Averages "
                "exclude missing, unparseable, and infinite values. Fields selected "
                "by numeric-like names can be mixed; inspect their parse-failure counts."
        )
    else:
        lines.append("No numerical columns were detected.")

    lines.extend(["", "### Categorical unique values", ""])
    if not categoricals:
        lines.append("No categorical columns were detected.")
    for column in categoricals:
        values = sorted(
            frame[column].dropna().astype(str).unique().tolist(),
            key=lambda value: value.casefold(),
        )
        lines.extend(
            [
                f"<details><summary><code>{_format_value(column)}</code>: "
                f"{len(values):,} unique non-missing value(s)</summary>",
                "",
            ]
        )
        if values:
            lines.extend(f"- {_inline_code(value)}" for value in values)
        else:
            lines.append("- No non-missing values.")
        lines.extend(["", "</details>", ""])

    lines.extend(["### Possible invalid or inconsistent values", ""])
    issues = _problem_values(dataset, numeric)
    if issues:
        lines.extend(f"- {issue}" for issue in issues)
    else:
        lines.append(
            "No issues were flagged by the generic checks in this script. "
            "This does not establish that all values are valid."
        )

    lines.extend(["", "### Source file groups and populated-column coverage", ""])
    coverage = _source_coverage(dataset)
    if coverage:
        lines.extend(
            [
                "The `Source.Name` values identify source-file groups within this "
                "combined CSV. Different populated-column patterns are evidence "
                "that one global header may not describe every source group.",
                "",
                _markdown_table(["Source.Name", "Rows", "Populated fields (non-missing counts)"], coverage),
                "",
            ]
        )
    else:
        lines.append("No `Source.Name` field is available for source-group comparison.")

    price_fields = ALIASES["price_measures (semantics/units unverified)"].get(
        dataset.name, []
    )
    source_column = next(
        (column for column in frame.columns if str(column).casefold() == "source.name"),
        None,
    )
    if price_fields and source_column is not None:
        price_rows = []
        for source_name, group in frame.groupby(source_column, dropna=False, sort=True):
            for column in price_fields:
                original = group[column]
                converted = pd.to_numeric(original, errors="coerce")
                finite = converted[
                    converted.map(
                        lambda value: math.isfinite(value)
                        if not _is_missing(value)
                        else False
                    )
                ]
                price_rows.append(
                    [
                        _format_value(source_name),
                        column,
                        f"{len(finite):,}",
                        f"{int(original.notna().sum() - converted.notna().sum()):,}",
                        finite.min() if not finite.empty else "—",
                        finite.max() if not finite.empty else "—",
                        finite.mean() if not finite.empty else "—",
                    ]
                )
        lines.extend(
            [
                "",
                "### Price-field values by Source.Name",
                "",
                "These are values parsed from each flattened column under the "
                "CSV's top-level header. For groups with different populated-field "
                "patterns, they may not represent the named price measure.",
                "",
                _markdown_table(
                    [
                        "Source.Name",
                        "Price field",
                        "Finite numeric values",
                        "Unparsed non-missing",
                        "Minimum",
                        "Maximum",
                        "Average",
                    ],
                    price_rows,
                ),
            ]
        )

    lines.extend(
        [
            "",
            "Duplicate counts above compare parsed field values; they are not "
            "confirmed duplicate vehicles. Sparse or misaligned source schemas "
            "can create repeated blank-heavy rows.",
        ]
    )

    for column in frame.columns:
        normalized = str(column).strip().lower()
        if normalized in IDENTIFIER_COLUMNS:
            repeated = int(frame[column].duplicated(keep=False).sum())
            distinct = int(frame[column].nunique(dropna=True))
            if repeated:
                lines.append(
                    f"- Identifier-like field `{column}` has {repeated:,} row(s) "
                    f"sharing repeated values ({distinct:,} distinct non-missing values); "
                    "check its scope and source-file combination before treating it as a key."
                )
    lines.append("")
    return "\n".join(lines)


ALIASES = {
    "vehicle_model_or_name": {
        "combined_cars.csv": ["Car_Name"],
        "combined_cars2.csv": ["full_model_name", "model_name"],
        "combined_cars3.csv": ["car_name", "model"],
    },
    "vehicle_brand": {
        "combined_cars.csv": [],
        "combined_cars2.csv": ["brand"],
        "combined_cars3.csv": ["brand"],
    },
    "vehicle_year_or_age": {
        "combined_cars.csv": ["Year"],
        "combined_cars2.csv": ["year", "car_age"],
        "combined_cars3.csv": ["vehicle_age"],
    },
    "price_measures (semantics/units unverified)": {
        "combined_cars.csv": ["Selling_Price", "Present_Price"],
        "combined_cars2.csv": ["price"],
        "combined_cars3.csv": ["selling_price"],
    },
    "distance_km": {
        "combined_cars.csv": ["Kms_Driven"],
        "combined_cars2.csv": ["distance_travelled(kms)"],
        "combined_cars3.csv": ["km_driven"],
    },
    "fuel_type": {
        "combined_cars.csv": ["Fuel_Type"],
        "combined_cars2.csv": ["fuel_type"],
        "combined_cars3.csv": ["fuel_type"],
    },
    "seller_type": {
        "combined_cars.csv": ["Seller_Type"],
        "combined_cars2.csv": [],
        "combined_cars3.csv": ["seller_type"],
    },
    "transmission": {
        "combined_cars.csv": ["Transmission"],
        "combined_cars2.csv": [],
        "combined_cars3.csv": ["transmission_type"],
    },
    "location": {
        "combined_cars.csv": [],
        "combined_cars2.csv": ["city"],
        "combined_cars3.csv": [],
    },
}


def _comparison_section(datasets: list[Dataset]) -> str:
    names = [dataset.name for dataset in datasets]
    column_sets = {dataset.name: set(map(str, dataset.frame.columns)) for dataset in datasets}
    common = set.intersection(*(column_sets[name] for name in names))
    lines = [
        "## Cross-dataset comparison",
        "",
        f"- **Exact common column names:** {', '.join(f'`{name}`' for name in sorted(common)) or 'None'}",
        "- **Similar concepts with different source column names:**",
        "",
        _markdown_table(
            ["Candidate concept", *names],
            [
                [
                    concept,
                    *[
                        ", ".join(f"`{column}`" for column in aliases[name]) or "—"
                        for name in names
                    ],
                ]
                for concept, aliases in ALIASES.items()
            ],
        ),
        "",
        "The alias rows are mapping candidates based on column labels, not proof "
        "that units or business meanings are equivalent.",
        "",
        "### Cross-source type and format differences",
        "",
    ]

    for concept, aliases in ALIASES.items():
        if not any(aliases.values()):
            continue
        rows = []
        for dataset in datasets:
            for column in aliases[dataset.name]:
                if column not in dataset.frame:
                    continue
                series = dataset.frame[column]
                parsed = pd.to_numeric(series, errors="coerce")
                nonmissing = int(series.notna().sum())
                ratio = parsed.notna().sum() / nonmissing if nonmissing else 0
                interpretation = (
                    f"numeric-compatible ({ratio:.1%} parseable)"
                    if ratio >= 0.95
                    else "text/categorical or mixed"
                )
                rows.append([dataset.name, column, str(series.dtype), interpretation])
        lines.append(f"**{concept}:**")
        lines.append("")
        lines.append(_markdown_table(["Dataset", "Column", "Pandas dtype", "Value profile"], rows))
        lines.append("")

    price_rows = []
    for dataset in datasets:
        numeric = _numeric_profile(dataset.frame)
        price_columns = ALIASES["price_measures (semantics/units unverified)"][dataset.name]
        for column in price_columns:
            profile = numeric.get(str(column))
            if profile is None:
                price_rows.append([dataset.name, column, "—", "—", "—", "not reliably numeric"])
                continue
            finite = profile["finite"]
            price_rows.append(
                [
                    dataset.name,
                    column,
                    finite.min() if not finite.empty else "—",
                    finite.max() if not finite.empty else "—",
                    finite.mean() if not finite.empty else "—",
                    f"{profile['unparsed']:,} unparsed; source layout, units, and currency unverified",
                ]
            )

    lines.extend(
        [
            "### Price scale, units, and transaction evidence",
            "",
            _markdown_table(
                ["Dataset", "Price column", "Observed minimum", "Observed maximum", "Observed average", "Interpretation"],
                price_rows,
            ),
            "",
            "The files expose the following price fields: `Selling_Price` and "
            "`Present_Price` in `combined_cars.csv`, `price` in "
            "`combined_cars2.csv`, and `selling_price` in `combined_cars3.csv`. "
            "Their names, observed ranges, and apparent scales differ; none of "
            "the inspected CSV headers declares a currency or unit. For the "
            "combined files with multiple populated-column patterns, even a "
            "numeric value under a price-named column may belong to a different "
            "source field. Preserve "
            "each raw price and its source-specific meaning. Do not convert or "
            "aggregate prices across sources until authoritative source "
            "documentation confirms units and semantics.",
            "",
            "No dataset provides an explicit transaction/listing date or a "
            "transaction status/identifier sufficient to prove a completed "
            "sale. `Selling_Price`/`selling_price` are reported field names, "
            "not by themselves evidence that a transaction was confirmed. "
            "Treat all three as vehicle records with unverified listing/sale "
            "status unless source documentation establishes otherwise. "
            "Vehicle `Year`, `car_age`, and `vehicle_age` are not transaction dates.",
            "",
            "### Location",
            "",
            "Only `combined_cars2.csv` contains a `city` field. It includes "
            "missing values. The other datasets contain no observed location "
            "column; no location should be imputed from vehicle or source names.",
            "",
        ]
    )
    return "\n".join(lines)


def _etl_strategy(datasets: list[Dataset]) -> str:
    present_columns = {
        dataset.name: set(map(str, dataset.frame.columns)) for dataset in datasets
    }
    mapping_rows = []
    for concept, aliases in ALIASES.items():
        mapping_rows.append(
            [
                concept,
                *[
                    ", ".join(aliases[name]) if aliases[name] else "Not present"
                    for name in (dataset.name for dataset in datasets)
                ],
            ]
        )

    shared = set.intersection(*(present_columns[dataset.name] for dataset in datasets))
    observed_cautions = []
    for dataset in datasets:
        frame = dataset.frame
        source_column = next(
            (column for column in frame.columns if str(column).casefold() == "source.name"),
            None,
        )
        source_groups = (
            int(frame[source_column].nunique(dropna=False)) if source_column is not None else 0
        )
        numeric = _numeric_profile(frame)
        parse_failures = {
            column: profile["unparsed"]
            for column, profile in numeric.items()
            if profile["unparsed"] > 0
        }
        header_names = {str(column).strip().casefold() for column in frame.columns}
        header_like_count = 0
        for row in frame.itertuples(index=False, name=None):
            matching_headers = sum(
                1
                for value in row
                if not _is_missing(value) and str(value).strip().casefold() in header_names
            )
            if matching_headers >= 3:
                header_like_count += 1
        observed_cautions.append(
            [
                dataset.name,
                f"{source_groups:,}",
                f"{header_like_count:,}",
                ", ".join(
                    f"{column}: {count:,}" for column, count in parse_failures.items()
                )
                or "None detected",
            ]
        )

    return "\n".join(
        [
            "# ETL Strategy (Preparation Only)",
            "",
            "This report recommends a safe future ETL approach from the inspected "
            "source columns. It does not create tables, load data, modify source "
            "CSVs, or perform ETL.",
            "",
            "## Source-specific mapping candidates",
            "",
            _markdown_table(
                ["Candidate canonical concept", *[dataset.name for dataset in datasets]],
                mapping_rows,
            ),
            "",
            f"Exact shared source field names: {', '.join(f'`{column}`' for column in sorted(shared)) or 'none'}. "
            "Even exact name matches should be checked for matching units and definitions.",
            "",
            "## Observed source-layout cautions",
            "",
            _markdown_table(
                ["File", "Source.Name groups", "Header-like data rows", "Numeric-name parse failures"],
                observed_cautions,
            ),
            "",
            "`combined_cars.csv` and `combined_cars2.csv` contain multiple "
            "`Source.Name` groups with differing populated-column patterns. "
            "In `combined_cars2.csv`, the source groups whose names start with "
            "`UsedCars_` have a repeated header-like row and a narrower, shifted "
            "layout relative to the global 24-column header. In `combined_cars.csv`, "
            "several source groups do not populate the columns declared by its "
            "single header. Do not interpret these flattened rows using a single "
            "schema; obtain or reconstruct each source file's own header and "
            "map by source before any loading. `combined_cars3.csv` has one "
            "source group and a consistent populated-column pattern.",
            "",
            "### Candidates for standardized fields",
            "",
            "- Preserve source-specific model/name fields; only create a conformed "
            "brand/model mapping after confirming each field's meaning and vocabulary.",
            "- Candidate shared descriptors are fuel type, model/name, and "
            "distance driven (the distance column names explicitly indicate km). "
            "Keep original values alongside any normalized values.",
            "- Treat `Year`, `year`, `car_age`, and `vehicle_age` as distinct "
            "concepts. Vehicle year and vehicle age are not interchangeable; do "
            "not derive a year from age without a documented reference date.",
            "- Use separate source-specific price measures until units, currency, "
            "and semantics are verified. Do not convert or combine them yet.",
            "- Seller type and transmission can be mapped where source columns "
            "exist, while retaining original labels. They are absent from "
            "`combined_cars2.csv`.",
            "- Location can be represented only for `combined_cars2.csv` rows "
            "with an observed `city`; retain null for other/missing locations.",
            "",
            "### Keep dataset-specific",
            "",
            "- `combined_cars.csv`: `Present_Price`, `Owner`, and its source-specific "
            "vehicle naming and price measures.",
            "- `combined_cars2.csv`: `Id`, source row index, `brand_rank`, "
            "`car_age`, the distance/newness flags, inverse/standardized scores, "
            "and `best_buy1`/`best_buy2`. Preserve these as source-derived fields "
            "unless their formulas and definitions are documented.",
            "- `combined_cars3.csv`: `mileage`, `engine`, `max_power`, `seats`, "
            "and its distinct vehicle-age and price fields.",
            "- Preserve each original `Source.Name`, original source column "
            "names, and a stable source-row identifier. For the embedded-header "
            "files, the unnamed first data column is exposed by this inspection "
            "script as `Source_Row_Index`; verify its source meaning before "
            "using it as a key.",
            "",
            "### Missing values",
            "",
            "- Keep missing values null in staging; report them per source and "
            "column. Do not fill missing city, dates, prices, or vehicle "
            "attributes with guessed values.",
            "- Distinguish source blanks from parse failures. Preserve the raw "
            "value and record a validation issue when a non-empty value fails "
            "a documented numeric parse.",
            "- Apply documented downstream defaults only where the domain "
            "meaning supports them; keep the original value and transformation "
            "audit trail.",
            "",
            "### Duplicate detection",
            "",
            "- Preserve every source row in staging with source file and row "
            "identity, even when rows appear repeated.",
            "- Report exact duplicate rows separately from candidate duplicate "
            "vehicle payloads. Exclude only ingestion row identifiers when "
            "building the latter comparison; keep source IDs available for "
            "traceability.",
            "- Do not automatically delete matching vehicle attributes: multiple "
            "records may be distinct listings or repeated source observations. "
            "Define a documented business key and deduplication policy after "
            "source semantics are known.",
            "",
            "### Preserve provenance and data types",
            "",
            "- Retain immutable raw files and source filename, physical CSV row "
            "number, original source identifier, original values, parsed values, "
            "and validation status in a future staging process.",
            "- Parse each source with its own header rules: the second and third "
            "files use a metadata/header preamble with actual field names in row "
            "two; do not treat that row as vehicle data.",
            "- Explicitly parse numeric-looking string columns per source, "
            "measure parse failures, and use source-specific schemas rather "
            "than positional column assumptions.",
            "",
            "### Reject or quarantine criteria",
            "",
            "- Reject/quarantine structurally malformed rows (wrong field count), "
            "rows with no usable source identity, or values that fail a "
            "required-field/type rule only after those rules are agreed.",
            "- Quarantine non-empty numeric parse failures in required measures, "
            "non-finite values, and domain-invalid negative prices/distances or "
            "impossible documented vehicle attributes for review; do not silently "
            "drop them.",
            "- Do not reject a row merely because an optional value is missing, "
            "because it matches another row, or because a statistical outlier "
            "rule flags it. Keep an auditable reason for every quarantine/rejection.",
            "- Do not impose a sale-date requirement: the sources do not contain "
            "transaction dates, and vehicle year is not a substitute.",
            "",
            "### Decisions needed before loading",
            "",
            "1. Obtain authoritative price currency/unit and price-measure "
            "definitions for each source.",
            "2. Confirm whether rows are listings, completed sales, or mixed "
            "records, and document the evidence.",
            "3. Define record identity, duplicate policy, required fields, and "
            "valid domains for each source.",
            "4. Document source-derived score formulas and age reference dates "
            "before interpreting or recomputing them.",
            "",
        ]
    )


def generate_reports(raw_dir: Path, output_dir: Path) -> tuple[Path, Path]:
    datasets: list[Dataset] = []
    for name in DATASET_NAMES:
        path = raw_dir / name
        if not path.is_file():
            raise FileNotFoundError(f"Required source CSV not found: {path}")
        datasets.append(load_dataset(path))

    output_dir.mkdir(parents=True, exist_ok=True)
    inspected_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    report_lines = [
        "# CSV Dataset Inspection Report",
        "",
        f"- **Generated:** {inspected_at}",
        f"- **Pandas:** {pd.__version__}",
        "- **Input files:** `backend/data/raw/` originals; read-only inspection.",
        "- **Parsing note:** embedded metadata/header rows are excluded from data-row counts.",
        "- **Synthetic label note:** the unnamed index-like field in the second and third CSVs is labeled `Source_Row_Index` for inspection; its source meaning and key suitability are unverified.",
        "",
        "## Summary",
        "",
        _markdown_table(
            ["Dataset", "Data rows", "Columns", "Skipped header rows", "Exact duplicates", "Possible payload duplicates"],
            [
                [
                    dataset.name,
                    f"{len(dataset.frame):,}",
                    len(dataset.frame.columns),
                    dataset.header_rows - 1,
                    f"{dataset.frame.duplicated().sum():,}",
                    f"{_duplicate_counts(dataset.frame)[1]:,}",
                ]
                for dataset in datasets
            ],
        ),
        "",
        "Duplicate counts compare parsed field values; they are not confirmed "
        "duplicate vehicles. Sparse or misaligned source schemas can produce "
        "repeated blank-heavy rows.",
        "",
        "## Dataset details",
        "",
    ]
    report_lines.extend(_dataset_section(dataset) for dataset in datasets)
    report_lines.extend(["", _comparison_section(datasets)])

    inspection_path = output_dir / "dataset_inspection_report.md"
    strategy_path = output_dir / "etl_strategy.md"
    inspection_path.write_text("\n".join(report_lines), encoding="utf-8")
    strategy_path.write_text(_etl_strategy(datasets), encoding="utf-8")
    return inspection_path, strategy_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspect the three original vehicle CSV files and generate Markdown reports."
    )
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    inspection_path, strategy_path = generate_reports(
        args.raw_dir.resolve(), args.output_dir.resolve()
    )
    print(f"Generated: {inspection_path}")
    print(f"Generated: {strategy_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
