import base64
import binascii
import re
from datetime import datetime, timedelta, timezone

from flask import Blueprint, current_app, jsonify, request, session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.customer_account import CustomerAccount
from services.customer_accounts import (
    CustomerAuthError,
    account_has_active_premium,
    get_current_account,
    serialize_account,
)


customer_auth_bp = Blueprint(
    "customer_auth",
    __name__,
    url_prefix="/api/customer/auth",
)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"^[+0-9(). -]{7,32}$")
UPI_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{1,63}@[A-Za-z][A-Za-z0-9.-]{1,63}$")
PROFILE_IMAGE_LIMIT = 512 * 1024
PLANS = {
    "monthly": {"amount_inr": 199, "duration": timedelta(days=30)},
    "yearly": {"amount_inr": 999, "duration": timedelta(days=365)},
}


def _error(code, message, status):
    return jsonify({"error": {"code": code, "message": message}}), status


def _origin_error():
    origin = request.headers.get("Origin")
    allowed_origins = {
        current_app.config["FRONTEND_ORIGIN"],
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    }
    if origin and origin not in allowed_origins:
        return _error("origin_not_allowed", "Request origin is not allowed.", 403)
    if not current_app.secret_key:
        return _error(
            "auth_not_configured",
            "Set SECRET_KEY in backend/.env to enable customer authentication.",
            503,
        )
    return None


def _database_ready():
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise CustomerAuthError(
            "database_not_configured",
            "Customer accounts require the configured PostgreSQL database.",
        )


def _profile_image(value):
    if not isinstance(value, str) or "," not in value:
        raise ValueError("Upload and crop a profile image before registering.")
    header, encoded = value.split(",", 1)
    mime = header.removeprefix("data:").removesuffix(";base64")
    if mime not in {"image/jpeg", "image/png", "image/webp"}:
        raise ValueError("Profile images must be cropped as JPEG, PNG, or WebP.")
    try:
        image_data = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as error:
        raise ValueError("The profile image could not be decoded.") from error
    if not image_data or len(image_data) > PROFILE_IMAGE_LIMIT:
        raise ValueError("The cropped profile image must be smaller than 512 KB.")
    signatures = {
        "image/jpeg": image_data.startswith(b"\xff\xd8\xff"),
        "image/png": image_data.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/webp": image_data.startswith(b"RIFF") and image_data[8:12] == b"WEBP",
    }
    if not signatures[mime]:
        raise ValueError("The uploaded profile image data is invalid.")
    return mime, image_data


def _commit():
    try:
        db.session.commit()
    except IntegrityError as error:
        db.session.rollback()
        raise ValueError("An account already exists for that email address.") from error
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Customer account write failed")
        raise CustomerAuthError(
            "customer_account_unavailable",
            "Customer account storage is unavailable; retry after verifying PostgreSQL.",
        ) from error


def _validate_profile(payload):
    full_name = payload.get("full_name")
    phone = payload.get("phone_number")
    email = payload.get("email")
    password = payload.get("password")
    if not all(isinstance(value, str) for value in (full_name, phone, email, password)):
        raise ValueError("Full name, phone, email, and password are required.")
    full_name = full_name.strip()
    phone = phone.strip()
    email = email.strip().lower()
    if not full_name or len(full_name) > 120:
        raise ValueError("Full name must be between 1 and 120 characters.")
    if (not PHONE_PATTERN.fullmatch(phone)
            or not 7 <= sum(character.isdigit() for character in phone) <= 15):
        raise ValueError("Enter a valid phone number with 7 to 15 digits.")
    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        raise ValueError("Enter a valid email address.")
    if not 8 <= len(password) <= 128:
        raise ValueError("Password must be between 8 and 128 characters.")
    image_mime, image_data = _profile_image(payload.get("profile_image"))
    return full_name, phone, email, password, image_mime, image_data


@customer_auth_bp.get("/me")
def customer_me():
    account = get_current_account()
    return jsonify({"account": serialize_account(account) if account else None})


@customer_auth_bp.post("/register")
def customer_register():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    _database_ready()
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit registration details as JSON.", 400)
    try:
        profile = _validate_profile(payload)
    except ValueError as error:
        return _error("invalid_registration", str(error), 400)

    full_name, phone, email, password, image_mime, image_data = profile
    try:
        if db.session.query(CustomerAccount.id).filter_by(email=email).first():
            return _error(
                "email_already_registered",
                "An account already exists for that email address.",
                409,
            )
        account = CustomerAccount(
            full_name=full_name,
            phone_number=phone,
            email=email,
            password_hash=generate_password_hash(password, method="scrypt"),
            profile_image_mime=image_mime,
            profile_image_data=image_data,
        )
        db.session.add(account)
        _commit()
        session.clear()
        session["customer_account_id"] = account.id
        session.permanent = True
        return jsonify({"account": serialize_account(account)}), 201
    except ValueError as error:
        return _error("email_already_registered", str(error), 409)
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Customer registration lookup failed")
        raise CustomerAuthError(
            "customer_account_unavailable",
            "Customer account storage is unavailable; retry after verifying PostgreSQL.",
        ) from error


@customer_auth_bp.post("/login")
def customer_login():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    _database_ready()
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit login details as JSON.", 400)
    email = payload.get("email")
    password = payload.get("password")
    if not isinstance(email, str) or not isinstance(password, str):
        return _error("invalid_credentials", "Email or password is incorrect.", 401)
    try:
        account = db.session.query(CustomerAccount).filter_by(
            email=email.strip().lower()
        ).first()
        if not account or not check_password_hash(account.password_hash, password):
            return _error("invalid_credentials", "Email or password is incorrect.", 401)
        if account.account_status == "premium" and not account_has_active_premium(account):
            account.account_status = "free"
            account.premium_plan = None
            account.premium_expires_at = None
            _commit()
        session.clear()
        session["customer_account_id"] = account.id
        session.permanent = True
        return jsonify({"account": serialize_account(account)})
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Customer login lookup failed")
        raise CustomerAuthError(
            "customer_account_unavailable",
            "Customer account storage is unavailable; retry after verifying PostgreSQL.",
        ) from error


@customer_auth_bp.post("/logout")
def customer_logout():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    session.clear()
    return jsonify({"account": None})


@customer_auth_bp.post("/premium/confirm")
def confirm_demo_premium():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = get_current_account()
    if not account:
        return _error("authentication_required", "Sign in to upgrade.", 401)
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit the demo payment as JSON.", 400)
    plan = payload.get("plan")
    method = payload.get("payment_method")
    payment_handle = payload.get("payment_handle")
    if plan not in PLANS:
        return _error("invalid_plan", "Choose a supported demo subscription plan.", 400)
    if method != "upi":
        return _error("invalid_payment_method", "Only simulated UPI is supported.", 400)
    if not isinstance(payment_handle, str):
        return _error("invalid_payment_handle", "Enter a UPI ID or phone number.", 400)
    payment_handle = payment_handle.strip()
    is_phone = bool(PHONE_PATTERN.fullmatch(payment_handle)) and (
        7 <= sum(character.isdigit() for character in payment_handle) <= 15
    )
    if len(payment_handle) > 128 or not (
        UPI_PATTERN.fullmatch(payment_handle) or is_phone
    ):
        return _error("invalid_payment_handle", "Enter a valid UPI ID or phone number.", 400)

    now = datetime.now(timezone.utc)
    start = now
    if account_has_active_premium(account):
        start = account.premium_expires_at
        if start.tzinfo is None:
            start = start.replace(tzinfo=timezone.utc)
    account.account_status = "premium"
    account.premium_plan = plan
    account.premium_expires_at = start + PLANS[plan]["duration"]
    _commit()
    return jsonify({
        "account": serialize_account(account),
        "payment": {
            "status": "simulated_success",
            "real_payment": False,
            "amount_inr": PLANS[plan]["amount_inr"],
            "message": "Demo upgrade complete. No money was charged or transferred.",
        },
    })
