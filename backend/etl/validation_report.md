# ETL Validation Report

- **Mode:** Star-schema load
- **Source files:** original CSVs in `backend/data/raw/` (read-only).
- **Warehouse target:** confirmed `star` schema; 17437 inserted, 0 existing fact rows left unchanged.

## Row reconciliation

| Source file | Input rows | Accepted | Rejected | Pending |
| --- | --- | --- | --- | --- |
| combined_cars.csv | 14828 | 301 | 0 | 14527 |
| combined_cars2.csv | 5183 | 1725 | 0 | 3458 |
| combined_cars3.csv | 15411 | 15411 | 0 | 0 |

**Totals:** 35422 input = 17437 accepted + 0 rejected + 17985 pending.

Rows in unverified source groups, including the repeated headers and all shifted `UsedCars_` rows, remain pending. No potential duplicate was removed.

## Pending and rejected reasons

| Reason | Rows |
| --- | --- |
| Source group is sparse or misaligned with the flattened header; mapping remains pending. | 14527 |
| UsedCars subgroup has shifted/narrowed layout; mapping remains pending. | 3450 |
| Repeated embedded header row; subgroup layout remains pending. | 8 |

Mapped non-empty numeric parse failures, non-finite numeric values, and negative raw prices or odometer values are rejected with the source row and a specific reason. Missing optional source values remain NULL.

## Null handling and lineage

Accepted output contains 146176 NULL canonical field values; blank source values remain NULL and are not imputed. 17437 accepted rows retain source filename, source group, and one-based source-record ordinal. The labeled `Id` is retained for `combined_cars2.csv`; `combined_cars3.csv` retains its original index-like value with a NULL field label because the embedded source header is blank. The synthetic inspection name `Source_Row_Index` is not written as a source label.

| Nullable accepted field | NULL rows |
| --- | --- |
| source_row_identifier_field | 15712 |
| source_row_identifier_raw | 301 |
| brand_name_raw | 301 |
| full_model_name_raw | 301 |
| city_name_raw | 15712 |
| vehicle_year | 15411 |
| transmission_type_raw | 1725 |
| seller_type_raw | 1725 |
| combined_cars_selling_price_raw | 17136 |
| combined_cars_present_price_raw | 17136 |
| combined_cars2_price_raw | 15712 |
| combined_cars3_selling_price_raw | 2026 |
| combined_cars2_car_age_raw | 15712 |
| combined_cars3_vehicle_age_raw | 2026 |
| combined_cars_owner_raw | 17136 |
| combined_cars3_mileage_raw | 2026 |
| combined_cars3_engine_raw | 2026 |
| combined_cars3_max_power_raw | 2026 |
| combined_cars3_seats_raw | 2026 |

## Potential payload duplicates

| Source file | Count | Treatment |
| --- | --- | --- |
| combined_cars.csv | 2 | preserved |
| combined_cars2.csv | 425 | preserved |
| combined_cars3.csv | 167 | preserved |

Counts exclude source index/ID fields when comparing payloads; they indicate possible duplicates only and are reported, not used to filter records.

## Original-file integrity

| Source file | SHA-256 before | SHA-256 after | Result |
| --- | --- | --- | --- |
| combined_cars.csv | 500c85f71ae3883924752ac355073d5e912eccbd55400e9821072df89026cd20 | 500c85f71ae3883924752ac355073d5e912eccbd55400e9821072df89026cd20 | unchanged |
| combined_cars2.csv | 2a95c75303a69f70ac6e4d6bf3a4e933d951dbf6fc4b52ae583682c7c716adfa | 2a95c75303a69f70ac6e4d6bf3a4e933d951dbf6fc4b52ae583682c7c716adfa | unchanged |
| combined_cars3.csv | 05a636cf048f38c8da317b840290d64c75fa0d32b01a77dacc19d7dfdd3937c0 | 05a636cf048f38c8da317b840290d64c75fa0d32b01a77dacc19d7dfdd3937c0 | unchanged |

## Mapping notes

- Vehicle `Year`/`year` is mapped only to the vehicle-year dimension; no transaction date is inferred.
- Price values map only to their source-specific raw-price columns; no unit or currency conversion is applied.
- Only observed `city` values from the verified `Dataset.csv` group map to location.
- Vehicle age is retained in source-specific measures and is not converted to a year.
- Output is load-ready natural-key staging for the approved Star Schema; surrogate dimension keys are resolved only during an explicitly confirmed load.
