# ETL Strategy (Preparation Only)

This report recommends a safe future ETL approach from the inspected source columns. It does not create tables, load data, modify source CSVs, or perform ETL.

## Source-specific mapping candidates

| Candidate canonical concept | combined_cars.csv | combined_cars2.csv | combined_cars3.csv |
| --- | --- | --- | --- |
| vehicle_model_or_name | Car_Name | full_model_name, model_name | car_name, model |
| vehicle_brand | Not present | brand | brand |
| vehicle_year_or_age | Year | year, car_age | vehicle_age |
| price_measures (semantics/units unverified) | Selling_Price, Present_Price | price | selling_price |
| distance_km | Kms_Driven | distance_travelled(kms) | km_driven |
| fuel_type | Fuel_Type | fuel_type | fuel_type |
| seller_type | Seller_Type | Not present | seller_type |
| transmission | Transmission | Not present | transmission_type |
| location | Not present | city | Not present |

Exact shared source field names: `Source.Name`. Even exact name matches should be checked for matching units and definitions.

## Observed source-layout cautions

| File | Source.Name groups | Header-like data rows | Numeric-name parse failures |
| --- | --- | --- | --- |
| combined_cars.csv | 4 | 0 | None detected |
| combined_cars2.csv | 9 | 8 | Id: 8, year: 3,458, price: 8, distance_travelled(kms): 3,458 |
| combined_cars3.csv | 1 | 0 | None detected |

`combined_cars.csv` and `combined_cars2.csv` contain multiple `Source.Name` groups with differing populated-column patterns. In `combined_cars2.csv`, the source groups whose names start with `UsedCars_` have a repeated header-like row and a narrower, shifted layout relative to the global 24-column header. In `combined_cars.csv`, several source groups do not populate the columns declared by its single header. Do not interpret these flattened rows using a single schema; obtain or reconstruct each source file's own header and map by source before any loading. `combined_cars3.csv` has one source group and a consistent populated-column pattern.

### Candidates for standardized fields

- Preserve source-specific model/name fields; only create a conformed brand/model mapping after confirming each field's meaning and vocabulary.
- Candidate shared descriptors are fuel type, model/name, and distance driven (the distance column names explicitly indicate km). Keep original values alongside any normalized values.
- Treat `Year`, `year`, `car_age`, and `vehicle_age` as distinct concepts. Vehicle year and vehicle age are not interchangeable; do not derive a year from age without a documented reference date.
- Use separate source-specific price measures until units, currency, and semantics are verified. Do not convert or combine them yet.
- Seller type and transmission can be mapped where source columns exist, while retaining original labels. They are absent from `combined_cars2.csv`.
- Location can be represented only for `combined_cars2.csv` rows with an observed `city`; retain null for other/missing locations.

### Keep dataset-specific

- `combined_cars.csv`: `Present_Price`, `Owner`, and its source-specific vehicle naming and price measures.
- `combined_cars2.csv`: `Id`, source row index, `brand_rank`, `car_age`, the distance/newness flags, inverse/standardized scores, and `best_buy1`/`best_buy2`. Preserve these as source-derived fields unless their formulas and definitions are documented.
- `combined_cars3.csv`: `mileage`, `engine`, `max_power`, `seats`, and its distinct vehicle-age and price fields.
- Preserve each original `Source.Name`, original source column names, and a stable source-row identifier. For the embedded-header files, the unnamed first data column is exposed by this inspection script as `Source_Row_Index`; verify its source meaning before using it as a key.

### Missing values

- Keep missing values null in staging; report them per source and column. Do not fill missing city, dates, prices, or vehicle attributes with guessed values.
- Distinguish source blanks from parse failures. Preserve the raw value and record a validation issue when a non-empty value fails a documented numeric parse.
- Apply documented downstream defaults only where the domain meaning supports them; keep the original value and transformation audit trail.

### Duplicate detection

- Preserve every source row in staging with source file and row identity, even when rows appear repeated.
- Report exact duplicate rows separately from candidate duplicate vehicle payloads. Exclude only ingestion row identifiers when building the latter comparison; keep source IDs available for traceability.
- Do not automatically delete matching vehicle attributes: multiple records may be distinct listings or repeated source observations. Define a documented business key and deduplication policy after source semantics are known.

### Preserve provenance and data types

- Retain immutable raw files and source filename, physical CSV row number, original source identifier, original values, parsed values, and validation status in a future staging process.
- Parse each source with its own header rules: the second and third files use a metadata/header preamble with actual field names in row two; do not treat that row as vehicle data.
- Explicitly parse numeric-looking string columns per source, measure parse failures, and use source-specific schemas rather than positional column assumptions.

### Reject or quarantine criteria

- Reject/quarantine structurally malformed rows (wrong field count), rows with no usable source identity, or values that fail a required-field/type rule only after those rules are agreed.
- Quarantine non-empty numeric parse failures in required measures, non-finite values, and domain-invalid negative prices/distances or impossible documented vehicle attributes for review; do not silently drop them.
- Do not reject a row merely because an optional value is missing, because it matches another row, or because a statistical outlier rule flags it. Keep an auditable reason for every quarantine/rejection.
- Do not impose a sale-date requirement: the sources do not contain transaction dates, and vehicle year is not a substitute.

### Decisions needed before loading

1. Obtain authoritative price currency/unit and price-measure definitions for each source.
2. Confirm whether rows are listings, completed sales, or mixed records, and document the evidence.
3. Define record identity, duplicate policy, required fields, and valid domains for each source.
4. Document source-derived score formulas and age reference dates before interpreting or recomputing them.
