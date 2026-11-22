from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from services.customer_accounts import account_has_active_premium, get_current_account


vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")

PRICE_MEASURES = (
    ("combined_cars_selling_price_raw", "combined_cars_selling_price_raw"),
    ("combined_cars_present_price_raw", "combined_cars_present_price_raw"),
    ("combined_cars2_price_raw", "combined_cars2_price_raw"),
    ("combined_cars3_selling_price_raw", "combined_cars3_selling_price_raw"),
)
CUSTOMER_CATALOGUE_LIMIT = 18

FILTERS = {
    "brand": ("b.brand_name_raw", "brand"),
    "model": ("m.model_name_raw", "model"),
    "source_name": ("s.source_name_value", "source_name"),
    "fuel_type": ("fu.fuel_type_raw", "fuel_type"),
    "transmission": ("tr.transmission_type_raw", "transmission"),
    "seller_type": ("st.seller_type_raw", "seller_type"),
    "city": ("l.city_name_raw", "city"),
    "source_file_name": ("s.container_csv_name", "source_file_name"),
}

STATE_CITY_MAP = {
    "tamil nadu": ["Chennai"],
    "karnataka": ["Bangalore"],
    "maharashtra": ["Mumbai", "Pune", "Thane", "Navi Mumbai"],
    "telangana": ["Hyderabad"],
    "delhi": ["Delhi"],
    "delhi ncr": ["Delhi", "Noida", "Ghaziabad", "Faridabad"],
    "uttar pradesh": ["Noida", "Ghaziabad", "Lucknow", "Agra"],
    "haryana": ["Faridabad", "Panchkula"],
    "uttarakhand": ["Dehradun"],
}

FROM_CLAUSE = """
    FROM star.fact_vehicle_marketplace AS f
    JOIN star.dim_source_dataset AS s
      ON s.source_dataset_key = f.source_dataset_key
    LEFT JOIN star.dim_brand AS b ON b.brand_key = f.brand_key
    LEFT JOIN star.dim_model AS m ON m.model_key = f.model_key
    LEFT JOIN star.dim_location AS l ON l.location_key = f.location_key
    LEFT JOIN star.dim_vehicle_year AS y ON y.vehicle_year_key = f.vehicle_year_key
    LEFT JOIN star.dim_fuel AS fu ON fu.fuel_key = f.fuel_key
    LEFT JOIN star.dim_transmission AS tr ON tr.transmission_key = f.transmission_key
    LEFT JOIN star.dim_seller_type AS st ON st.seller_type_key = f.seller_type_key
"""


class DatabaseUnavailable(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code
        self.message = message


@vehicles_bp.errorhandler(DatabaseUnavailable)
def handle_database_unavailable(_error):
    return jsonify({
        "error": {
            "code": _error.code,
            "message": _error.message,
        }
    }), 503


def _query_rows(statement, parameters=None):
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise DatabaseUnavailable(
            "database_not_configured",
            "DATABASE_URL is not configured; analytics require the PostgreSQL Star schema.",
        )
    try:
        result = db.session.execute(text(statement), parameters or {})
        return [dict(row) for row in result.mappings()]
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Star-schema API query failed")
        raise DatabaseUnavailable(
            "database_unavailable",
            "The PostgreSQL Star schema is unavailable; retry after verifying database connectivity.",
        ) from error


def _invalid_parameter(message):
    return jsonify({
        "error": {
            "code": "invalid_parameter",
            "message": message,
        }
    }), 400


def _positive_integer(name, default, maximum=None):
    raw_value = request.args.get(name)
    if raw_value is None:
        return default, None
    try:
        value = int(raw_value)
    except ValueError:
        return None, _invalid_parameter(f"{name} must be an integer.")
    if value < 1:
        return None, _invalid_parameter(f"{name} must be at least 1.")
    if maximum is not None and value > maximum:
        return None, _invalid_parameter(f"{name} must not exceed {maximum}.")
    return value, None


def _year_filter(name):
    raw_value = request.args.get(name)
    if raw_value is None:
        return None, None
    try:
        value = int(raw_value)
    except ValueError:
        return None, _invalid_parameter(f"{name} must be an integer vehicle year.")
    if not -32768 <= value <= 32767:
        return None, _invalid_parameter(f"{name} must fit the warehouse SMALLINT range.")
    return value, None


@vehicles_bp.get("/summary")
def vehicle_summary():
    summary = _query_rows(
        """
        SELECT COUNT(*) AS total_records,
               COUNT(f.brand_key) AS records_with_brand,
               COUNT(f.model_key) AS records_with_model,
               COUNT(f.odometer_km) AS records_with_odometer_km,
               MIN(f.odometer_km) AS min_odometer_km,
               MAX(f.odometer_km) AS max_odometer_km,
               AVG(f.odometer_km) AS avg_odometer_km,
               MIN(y.vehicle_year) AS min_vehicle_year,
               MAX(y.vehicle_year) AS max_vehicle_year
        """ + FROM_CLAUSE
    )[0]
    source_counts = _query_rows(
        """
        SELECT s.container_csv_name AS source_file_name,
               s.source_name_value AS source_name,
               COUNT(f.vehicle_marketplace_key) AS record_count
        FROM star.dim_source_dataset AS s
        JOIN star.fact_vehicle_marketplace AS f
          ON f.source_dataset_key = s.source_dataset_key
        GROUP BY s.container_csv_name, s.source_name_value
        ORDER BY s.container_csv_name, s.source_name_value
        """
    )
    return jsonify({"summary": summary, "source_counts": source_counts})


@vehicles_bp.get("/brands")
def vehicle_brands():
    brands = _query_rows(
        """
        SELECT b.source_dataset_name AS source_name,
               b.brand_name_raw AS brand,
               COUNT(f.vehicle_marketplace_key) AS record_count
        FROM star.dim_brand AS b
        JOIN star.fact_vehicle_marketplace AS f ON f.brand_key = b.brand_key
        GROUP BY b.source_dataset_name, b.brand_name_raw
        ORDER BY b.source_dataset_name, b.brand_name_raw
        """
    )
    return jsonify({
        "brands": brands,
        "total_branded_records": sum(row["record_count"] for row in brands),
    })


@vehicles_bp.get("/fuel-types")
def vehicle_fuel_types():
    fuel_types = _query_rows(
        """
        SELECT fu.source_dataset_name AS source_name,
               fu.fuel_type_raw AS fuel_type,
               COUNT(f.vehicle_marketplace_key) AS record_count
        FROM star.dim_fuel AS fu
        JOIN star.fact_vehicle_marketplace AS f ON f.fuel_key = fu.fuel_key
        GROUP BY fu.source_dataset_name, fu.fuel_type_raw
        ORDER BY fu.source_dataset_name, fu.fuel_type_raw
        """
    )
    return jsonify({"fuel_types": fuel_types})


@vehicles_bp.get("/price-analysis")
def vehicle_price_analysis():
    measures = ",\n".join(
        f"('{name}', f.{column})" for name, column in PRICE_MEASURES
    )
    rows = _query_rows(
        f"""
        SELECT s.container_csv_name AS source_file_name,
               s.source_name_value AS source_name,
               measure.measure_name AS measure,
               COUNT(measure.amount) AS record_count,
               MIN(measure.amount) AS min_value,
               MAX(measure.amount) AS max_value,
               AVG(measure.amount) AS avg_value
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_source_dataset AS s
          ON s.source_dataset_key = f.source_dataset_key
        CROSS JOIN LATERAL (
            VALUES {measures}
        ) AS measure(measure_name, amount)
        WHERE measure.amount IS NOT NULL
        GROUP BY s.container_csv_name, s.source_name_value, measure.measure_name
        ORDER BY s.container_csv_name, s.source_name_value, measure.measure_name
        """
    )
    return jsonify({
        "price_measures": [
            {**row, "currency": None, "unit": None} for row in rows
        ],
        "note": "Price measures are source-specific and are not combined or converted.",
    })


@vehicles_bp.get("/records")
def vehicle_records():
    allowed_filters = set(FILTERS) | {
        "page", "per_page", "year", "year_from", "year_to",
        "state", "location", "min_price", "max_price"
    }
    unknown_filters = sorted(set(request.args.keys()) - allowed_filters)
    if unknown_filters:
        return _invalid_parameter(
            f"Unsupported filter(s): {', '.join(unknown_filters)}."
        )

    page, error = _positive_integer("page", 1)
    if error:
        return error
    per_page, error = _positive_integer("per_page", 25, 100)
    if error:
        return error
    year_from, error = _year_filter("year_from")
    if error:
        return error
    year_to, error = _year_filter("year_to")
    if error:
        return error
    if year_from is not None and year_to is not None and year_from > year_to:
        return _invalid_parameter("year_from must be less than or equal to year_to.")

    year_val, error = _year_filter("year")
    if error:
        return error

    predicates = []
    parameters = {}
    for argument, (column, parameter) in FILTERS.items():
        value = request.args.get(argument)
        if value is not None:
            value = value.strip()
            if not value:
                return _invalid_parameter(f"{argument} must not be empty.")
            if len(value) > 200:
                return _invalid_parameter(f"{argument} must be at most 200 characters.")
            predicates.append(f"{column} = :{parameter}")
            parameters[parameter] = value
    if year_val is not None:
        predicates.append("y.vehicle_year = :year_val")
        parameters["year_val"] = year_val
    if year_from is not None:
        predicates.append("y.vehicle_year >= :year_from")
        parameters["year_from"] = year_from
    if year_to is not None:
        predicates.append("y.vehicle_year <= :year_to")
        parameters["year_to"] = year_to

    state_input = request.args.get("state") or request.args.get("location")
    if state_input:
        state_clean = state_input.strip().lower()
        if state_clean in STATE_CITY_MAP:
            cities = STATE_CITY_MAP[state_clean]
            predicates.append("l.city_name_raw IN (" + ", ".join(f":st_city_{i}" for i in range(len(cities))) + ")")
            for i, c in enumerate(cities):
                parameters[f"st_city_{i}"] = c
        else:
            predicates.append("(l.city_name_raw ILIKE :loc_input)")
            parameters["loc_input"] = f"%{state_input.strip()}%"

    raw_min_price = request.args.get("min_price")
    if raw_min_price is not None and raw_min_price.strip():
        try:
            min_p = float(raw_min_price.strip())
            predicates.append(
                "COALESCE(f.combined_cars_selling_price_raw, f.combined_cars2_price_raw, f.combined_cars3_selling_price_raw) >= :min_price"
            )
            parameters["min_price"] = min_p
        except ValueError:
            return _invalid_parameter("min_price must be a valid number.")

    raw_max_price = request.args.get("max_price")
    if raw_max_price is not None and raw_max_price.strip():
        try:
            max_p = float(raw_max_price.strip())
            predicates.append(
                "COALESCE(f.combined_cars_selling_price_raw, f.combined_cars2_price_raw, f.combined_cars3_selling_price_raw) <= :max_price"
            )
            parameters["max_price"] = max_p
        except ValueError:
            return _invalid_parameter("max_price must be a valid number.")

    where_clause = " WHERE " + " AND ".join(predicates) if predicates else ""
    count_rows = _query_rows(
        "SELECT COUNT(*) AS total_records " + FROM_CLAUSE + where_clause,
        parameters,
    )
    parameters.update({"limit": per_page, "offset": (page - 1) * per_page})
    records = _query_rows(
        """
        SELECT f.vehicle_marketplace_key,
               s.container_csv_name AS source_file_name,
               s.source_name_value AS source_name,
               f.source_record_ordinal,
               f.source_row_identifier_field,
               f.source_row_identifier_raw,
               b.brand_name_raw AS brand,
               m.model_name_raw AS model,
               m.full_model_name_raw AS full_model_name,
               l.city_name_raw AS city,
               y.vehicle_year,
               fu.fuel_type_raw AS fuel_type,
               tr.transmission_type_raw AS transmission,
               st.seller_type_raw AS seller_type,
               f.odometer_km,
               f.combined_cars_selling_price_raw,
               f.combined_cars_present_price_raw,
               f.combined_cars2_price_raw,
               f.combined_cars3_selling_price_raw,
               f.combined_cars2_car_age_raw,
               f.combined_cars3_vehicle_age_raw,
               f.combined_cars_owner_raw,
               f.combined_cars3_mileage_raw,
               f.combined_cars3_engine_raw,
               f.combined_cars3_max_power_raw,
               f.combined_cars3_seats_raw
        """ + FROM_CLAUSE + where_clause + """
        ORDER BY f.source_file_name, f.source_record_ordinal
        LIMIT :limit OFFSET :offset
        """,
        parameters,
    )
    total_records = count_rows[0]["total_records"]
    return jsonify({
        "records": records,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_records": total_records,
            "total_pages": (total_records + per_page - 1) // per_page,
        },
        "filters": {
            **{key: value for key, value in parameters.items()
               if key not in {"limit", "offset"}},
        },
    })


@vehicles_bp.get("/filter-options")
def filter_options():
    selected_brand = request.args.get("brand")
    brand_rows = _query_rows(
        """
        SELECT DISTINCT b.brand_name_raw AS brand
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_brand AS b ON b.brand_key = f.brand_key
        WHERE b.brand_name_raw IS NOT NULL
        ORDER BY b.brand_name_raw
        """
    )
    if selected_brand:
        model_rows = _query_rows(
            """
            SELECT DISTINCT m.model_name_raw AS model
            FROM star.fact_vehicle_marketplace AS f
            JOIN star.dim_brand AS b ON b.brand_key = f.brand_key
            JOIN star.dim_model AS m ON m.model_key = f.model_key
            WHERE b.brand_name_raw = :brand AND m.model_name_raw IS NOT NULL
            ORDER BY m.model_name_raw
            """,
            {"brand": selected_brand},
        )
    else:
        model_rows = _query_rows(
            """
            SELECT m.model_name_raw AS model, COUNT(*) as cnt
            FROM star.fact_vehicle_marketplace AS f
            JOIN star.dim_model AS m ON m.model_key = f.model_key
            WHERE m.model_name_raw IS NOT NULL
            GROUP BY m.model_name_raw
            ORDER BY cnt DESC
            LIMIT 50
            """
        )
    year_rows = _query_rows(
        """
        SELECT DISTINCT y.vehicle_year AS year
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_vehicle_year AS y ON y.vehicle_year_key = f.vehicle_year_key
        ORDER BY y.vehicle_year DESC
        """
    )
    fuel_rows = _query_rows(
        """
        SELECT DISTINCT fu.fuel_type_raw AS fuel_type
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_fuel AS fu ON fu.fuel_key = f.fuel_key
        ORDER BY fu.fuel_type_raw
        """
    )
    transmission_rows = _query_rows(
        """
        SELECT DISTINCT tr.transmission_type_raw AS transmission
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_transmission AS tr ON tr.transmission_key = f.transmission_key
        ORDER BY tr.transmission_type_raw
        """
    )
    city_rows = _query_rows(
        """
        SELECT DISTINCT l.city_name_raw AS city
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_location AS l ON l.location_key = f.location_key
        ORDER BY l.city_name_raw
        """
    )
    return jsonify({
        "brands": [r["brand"] for r in brand_rows],
        "models": [r["model"] for r in model_rows],
        "years": [r["year"] for r in year_rows],
        "fuel_types": [r["fuel_type"] for r in fuel_rows],
        "transmissions": [r["transmission"] for r in transmission_rows],
        "cities": [r["city"] for r in city_rows],
        "states": [
            {"state": "Tamil Nadu", "cities": ["Chennai"]},
            {"state": "Maharashtra", "cities": ["Mumbai", "Pune", "Thane", "Navi Mumbai"]},
            {"state": "Karnataka", "cities": ["Bangalore"]},
            {"state": "Telangana", "cities": ["Hyderabad"]},
            {"state": "Delhi NCR", "cities": ["Delhi", "Noida", "Ghaziabad", "Faridabad"]},
            {"state": "Uttar Pradesh", "cities": ["Lucknow", "Agra", "Noida", "Ghaziabad"]},
            {"state": "Haryana", "cities": ["Faridabad", "Panchkula"]},
            {"state": "Uttarakhand", "cities": ["Dehradun"]},
        ],
    })


@vehicles_bp.get("/customer-catalogue")
def customer_catalogue():
    account = get_current_account()
    if account is None:
        return jsonify({
            "error": {
                "code": "authentication_required",
                "message": "Sign in to browse the customer vehicle catalogue.",
            }
        }), 401
    if not account_has_active_premium(account):
        return jsonify({
            "error": {
                "code": "premium_required",
                "message": "Premium is required to browse and discover vehicles.",
            }
        }), 403

    unknown_filters = sorted(set(request.args.keys()) - {"brand", "year"})
    if unknown_filters:
        return _invalid_parameter(
            f"Unsupported filter(s): {', '.join(unknown_filters)}."
        )

    brand = request.args.get("brand")
    if brand is not None:
        brand = brand.strip()
        if not brand:
            return _invalid_parameter("brand must not be empty.")
        if len(brand) > 200:
            return _invalid_parameter("brand must be at most 200 characters.")

    year, error = _year_filter("year")
    if error:
        return error

    predicates = []
    parameters = {}
    if brand is not None:
        predicates.append("b.brand_name_raw = :brand")
        parameters["brand"] = brand
    if year is not None:
        predicates.append("y.vehicle_year = :year")
        parameters["year"] = year
    where_clause = " WHERE " + " AND ".join(predicates) if predicates else ""

    brands = _query_rows(
        """
        SELECT DISTINCT b.brand_name_raw AS brand
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_brand AS b ON b.brand_key = f.brand_key
        ORDER BY b.brand_name_raw
        """
    )
    years = _query_rows(
        """
        SELECT DISTINCT y.vehicle_year AS year
        FROM star.fact_vehicle_marketplace AS f
        JOIN star.dim_vehicle_year AS y ON y.vehicle_year_key = f.vehicle_year_key
        ORDER BY y.vehicle_year DESC
        """
    )
    total_records = _query_rows(
        "SELECT COUNT(*) AS total_records " + FROM_CLAUSE + where_clause,
        parameters,
    )[0]["total_records"]
    records = _query_rows(
        """
        SELECT f.vehicle_marketplace_key,
               f.source_file_name,
               s.source_name_value AS source_name,
               f.source_record_ordinal,
               f.source_row_identifier_field,
               f.source_row_identifier_raw,
               b.brand_name_raw AS brand,
               m.model_name_raw AS model,
               m.full_model_name_raw AS full_model_name,
               l.city_name_raw AS city,
               y.vehicle_year,
               fu.fuel_type_raw AS fuel_type,
               tr.transmission_type_raw AS transmission,
               st.seller_type_raw AS seller_type,
               f.odometer_km,
               f.combined_cars_selling_price_raw,
               f.combined_cars_present_price_raw,
               f.combined_cars2_price_raw,
               f.combined_cars3_selling_price_raw,
               f.combined_cars2_car_age_raw,
               f.combined_cars3_vehicle_age_raw,
               f.combined_cars_owner_raw,
               f.combined_cars3_mileage_raw,
               f.combined_cars3_engine_raw,
               f.combined_cars3_max_power_raw,
               f.combined_cars3_seats_raw
        """ + FROM_CLAUSE + where_clause + """
        ORDER BY (b.brand_name_raw IS NULL),
                 (m.model_name_raw IS NULL),
                 (y.vehicle_year IS NULL),
                 f.source_file_name,
                 f.source_record_ordinal
        LIMIT :limit
        """,
        {**parameters, "limit": CUSTOMER_CATALOGUE_LIMIT},
    )
    return jsonify({
        "records": records,
        "total_records": total_records,
        "returned_records": len(records),
        "limit": CUSTOMER_CATALOGUE_LIMIT,
        "filters": {
            "brand": brand,
            "year": year,
            "available_brands": [row["brand"] for row in brands],
            "available_years": [row["year"] for row in years],
        },
        "note": (
            "Accepted Star Schema records only. Source prices remain raw; "
            "currency, units, and active listing status are not verified."
        ),
    })
