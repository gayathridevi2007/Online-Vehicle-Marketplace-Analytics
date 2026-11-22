import re
import secrets
from datetime import datetime, timezone, timedelta
from decimal import Decimal, InvalidOperation

from flask import Blueprint, current_app, jsonify, request, session
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models.customer_account import CustomerAccount
from models.marketplace import (
    BuyerFavourite,
    MarketplaceCustomerRole,
    MarketplaceModerator,
    MarketplaceTransaction,
    MembershipTransaction,
    ModerationAuditLog,
    VehicleBooking,
    VehicleListing,
    VehicleOwnershipDocument,
    VehicleListingPhoto,
)
from services.customer_accounts import get_current_account
from services.marketplace import (
    MarketplaceError,
    add_listing_photos,
    add_ownership_documents,
    commit_marketplace_write,
    current_moderator,
    customer_roles,
    ensure_role,
    listing_photo_ids,
    ownership_document_ids,
    read_ownership_documents,
    read_uploaded_photos,
    require_customer,
    require_moderator,
    serialize_listing,
    serialize_moderator,
    touch_listing,
    validate_listing_fields,
)


marketplace_bp = Blueprint(
    "marketplace",
    __name__,
    url_prefix="/api/marketplace",
)


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
            "Set SECRET_KEY in backend/.env to enable marketplace sessions.",
            503,
        )
    return None


def _optional_filters():
    allowed = {
        "q", "brand", "model", "year", "fuel_type", "transmission",
        "location", "price_currency", "min_price", "max_price", "page",
        "per_page",
    }
    unknown = sorted(set(request.args) - allowed)
    if unknown:
        raise MarketplaceError(
            "invalid_filter",
            f"Unsupported filter(s): {', '.join(unknown)}.",
        )

    filters = {}
    for key in ("q", "brand", "model", "fuel_type", "transmission", "location"):
        value = request.args.get(key)
        if value is not None:
            value = value.strip()
            if not value or len(value) > 160:
                raise MarketplaceError(
                    "invalid_filter",
                    f"{key} must contain 1 to 160 characters.",
                )
            filters[key] = value

    year = request.args.get("year")
    if year is not None:
        try:
            filters["year"] = int(year)
        except ValueError as error:
            raise MarketplaceError(
                "invalid_filter",
                "year must be a whole number.",
            ) from error
        if not 1886 <= filters["year"] <= datetime.now().year:
            raise MarketplaceError(
                "invalid_filter",
                "year must be between 1886 and the current year.",
            )

    currency = request.args.get("price_currency")
    if currency is not None:
        currency = currency.strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", currency):
            raise MarketplaceError(
                "invalid_filter",
                "price_currency must be a three-letter currency code.",
            )
        filters["price_currency"] = currency
    elif request.args.get("min_price") or request.args.get("max_price"):
        raise MarketplaceError(
            "invalid_filter",
            "Choose a currency when filtering by price.",
        )

    for key in ("min_price", "max_price"):
        value = request.args.get(key)
        if value is not None:
            try:
                amount = Decimal(value)
                if not amount.is_finite() or amount < 0:
                    raise InvalidOperation
                filters[key] = amount
            except (InvalidOperation, ValueError) as error:
                raise MarketplaceError(
                    "invalid_filter",
                    f"{key} must be a non-negative amount.",
                ) from error
    if (
        "min_price" in filters
        and "max_price" in filters
        and filters["min_price"] > filters["max_price"]
    ):
        raise MarketplaceError(
            "invalid_filter",
            "min_price must not exceed max_price.",
        )

    page = request.args.get("page", "1")
    per_page = request.args.get("per_page", "10")
    try:
        page = int(page)
        per_page = int(per_page)
    except ValueError as error:
        raise MarketplaceError(
            "invalid_filter",
            "page and per_page must be whole numbers.",
        ) from error
    if page < 1 or not 1 <= per_page <= 50:
        raise MarketplaceError(
            "invalid_filter",
            "page must be positive and per_page must be between 1 and 50.",
        )
    return filters, page, per_page


def _listing_query(filters):
    query = VehicleListing.query.filter_by(status="APPROVED_ACTIVE")
    if "q" in filters:
        value = f"%{filters['q']}%"
        query = query.filter(or_(
            VehicleListing.brand.ilike(value),
            VehicleListing.model.ilike(value),
            VehicleListing.description.ilike(value),
            VehicleListing.location.ilike(value),
        ))
    for key, column in (
        ("brand", VehicleListing.brand),
        ("model", VehicleListing.model),
        ("year", VehicleListing.manufacturing_year),
        ("fuel_type", VehicleListing.fuel_type),
        ("transmission", VehicleListing.transmission),
        ("location", VehicleListing.location),
        ("price_currency", VehicleListing.price_currency),
    ):
        if key in filters:
            query = query.filter(column == filters[key])
    if "min_price" in filters:
        query = query.filter(VehicleListing.asking_price >= filters["min_price"])
    if "max_price" in filters:
        query = query.filter(VehicleListing.asking_price <= filters["max_price"])
    return query


def _listing_or_404(listing_id):
    listing = db.session.get(VehicleListing, listing_id)
    if listing is None:
        raise MarketplaceError("listing_not_found", "Vehicle listing was not found.", 404)
    return listing


def _photo_response(photo):
    response = current_app.response_class(
        photo.image_data,
        mimetype=photo.content_type,
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "private, no-store"
    response.headers["Content-Disposition"] = "inline"
    return response


def _current_listing_with_seller(listing):
    response = serialize_listing(listing, include_moderation_note=True)
    seller = db.session.get(CustomerAccount, listing.seller_account_id)
    response["seller"] = (
        {"name": seller.full_name, "email": seller.email}
        if seller
        else None
    )
    return response


def _transaction_response(transaction):
    listing = db.session.get(VehicleListing, transaction.listing_id)
    buyer = db.session.get(CustomerAccount, transaction.buyer_account_id)
    seller = db.session.get(CustomerAccount, transaction.seller_account_id)
    return {
        "transaction_id": transaction.transaction_id,
        "listing_id": transaction.listing_id,
        "vehicle": (
            f"{listing.manufacturing_year} {listing.brand} {listing.model}"
            if listing
            else "Vehicle no longer available"
        ),
        "buyer": buyer.email if buyer else None,
        "seller": seller.email if seller else None,
        "amount": str(transaction.amount),
        "price_currency": transaction.price_currency.strip(),
        "timestamp": transaction.created_at.isoformat(),
        "status": transaction.status,
        "real_payment": False,
    }


@marketplace_bp.errorhandler(MarketplaceError)
def handle_marketplace_error(error):
    return _error(error.code, error.message, error.status)


@marketplace_bp.errorhandler(RequestEntityTooLarge)
def handle_upload_size_error(_error):
    return _error(
        "upload_too_large",
        "The listing upload exceeds the 66 MB request limit.",
        413,
    )


@marketplace_bp.errorhandler(SQLAlchemyError)
def handle_marketplace_database_error(error):
    db.session.rollback()
    current_app.logger.exception("Marketplace database request failed")
    return _error(
        "marketplace_unavailable",
        "Marketplace storage is unavailable; verify the resale marketplace schema.",
        503,
    )


@marketplace_bp.get("/roles")
def get_roles():
    account = require_customer()
    return jsonify({"roles": customer_roles(account.id)})


@marketplace_bp.post("/roles/buyer")
def activate_buyer_role():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    ensure_role(account.id, "BUYER")
    commit_marketplace_write()
    return jsonify({"roles": customer_roles(account.id)})


@marketplace_bp.get("/listings")
def get_active_listings():
    account = require_customer()
    filters, page, per_page = _optional_filters()
    ensure_role(account.id, "BUYER")
    query = _listing_query(filters)
    total = query.count()
    listings = query.order_by(
        VehicleListing.created_at.desc(),
        VehicleListing.id.desc(),
    ).offset((page - 1) * per_page).limit(per_page).all()
    commit_marketplace_write()
    return jsonify({
        "listings": [serialize_listing(listing) for listing in listings],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_listings": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
        "filters": {
            "brands": [
                row[0] for row in db.session.query(
                    VehicleListing.brand
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.brand
                ).all()
            ],
            "years": [
                row[0] for row in db.session.query(
                    VehicleListing.manufacturing_year
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.manufacturing_year.desc()
                ).all()
            ],
            "fuel_types": [
                row[0] for row in db.session.query(
                    VehicleListing.fuel_type
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.fuel_type
                ).all()
            ],
            "transmissions": [
                row[0] for row in db.session.query(
                    VehicleListing.transmission
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.transmission
                ).all()
            ],
            "locations": [
                row[0] for row in db.session.query(
                    VehicleListing.location
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.location
                ).all()
            ],
            "currencies": [
                row[0].strip() for row in db.session.query(
                    VehicleListing.price_currency
                ).filter_by(status="APPROVED_ACTIVE").distinct().order_by(
                    VehicleListing.price_currency
                ).all()
            ],
        },
    })


@marketplace_bp.get("/listings/<int:listing_id>")
def get_listing_details(listing_id):
    account = require_customer()
    listing = VehicleListing.query.filter_by(
        id=listing_id,
        status="APPROVED_ACTIVE",
    ).first()
    if listing is None:
        raise MarketplaceError("listing_not_found", "Active vehicle listing was not found.", 404)
    ensure_role(account.id, "BUYER")
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_contact=True)})


@marketplace_bp.get("/listings/<int:listing_id>/photos/<int:photo_id>")
def get_listing_photo(listing_id, photo_id):
    account = get_current_account()
    moderator = current_moderator()
    if account is None and moderator is None:
        raise MarketplaceError(
            "authentication_required",
            "Sign in to view marketplace photos.",
            401,
        )
    listing = db.session.get(VehicleListing, listing_id)
    if listing is None:
        raise MarketplaceError("photo_not_found", "Vehicle photo was not found.", 404)
    owns_listing = account is not None and listing.seller_account_id == account.id
    if listing.status != "APPROVED_ACTIVE" and not owns_listing and moderator is None:
        raise MarketplaceError("photo_not_found", "Vehicle photo was not found.", 404)
    if listing.status == "APPROVED_ACTIVE" and account is not None:
        ensure_role(account.id, "BUYER")
    photo = VehicleListingPhoto.query.filter_by(
        id=photo_id,
        listing_id=listing_id,
    ).first()
    if photo is None:
        raise MarketplaceError("photo_not_found", "Vehicle photo was not found.", 404)
    return _photo_response(photo)


@marketplace_bp.get(
    "/moderation/listings/<int:listing_id>/documents/<int:document_id>"
)
def get_ownership_document(listing_id, document_id):
    require_moderator()
    document = VehicleOwnershipDocument.query.filter_by(
        id=document_id,
        listing_id=listing_id,
    ).first()
    if document is None:
        raise MarketplaceError(
            "ownership_document_not_found",
            "Ownership document was not found.",
            404,
        )
    response = current_app.response_class(
        document.document_data,
        mimetype=document.content_type,
    )
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "private, no-store"
    extension = ".pdf" if document.content_type == "application/pdf" else ".image"
    response.headers["Content-Disposition"] = (
        f"attachment; filename=vehicle-ownership-document{extension}"
    )
    return response


@marketplace_bp.post("/listings")
def create_listing():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    listing_fields = validate_listing_fields(request.form)
    photos = read_uploaded_photos(request.files.getlist("photos"), required=True)
    documents = read_ownership_documents(
        request.files.getlist("ownership_documents"),
        required=True,
    )
    auto_publish_requested = (
        request.form.get("auto_publish", "false").lower() == "true"
        or getattr(account, "seller_membership_status", "") == "ACTIVE"
    )
    if auto_publish_requested and len(photos) >= 2 and len(documents) >= 1:
        initial_status = "APPROVED_ACTIVE"
        initial_verification = "VERIFIED"
        verified_at = datetime.now(timezone.utc)
        verification_note = "Automated verification passed with validated documents and photographs."
    else:
        initial_status = "PENDING_APPROVAL"
        initial_verification = "PENDING"
        verified_at = None
        verification_note = None

    listing = VehicleListing(
        seller_account_id=account.id,
        **listing_fields,
        status=initial_status,
        seller_verification_status=initial_verification,
        seller_verified_at=verified_at,
        seller_verification_note=verification_note,
    )
    db.session.add(listing)
    db.session.flush()
    add_listing_photos(listing.id, photos)
    add_ownership_documents(listing.id, documents)
    ensure_role(account.id, "SELLER")
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing)}), 201


@marketplace_bp.get("/my-listings")
def get_my_listings():
    account = require_customer()
    listings = VehicleListing.query.filter_by(
        seller_account_id=account.id
    ).order_by(
        VehicleListing.updated_at.desc(),
        VehicleListing.id.desc(),
    ).all()
    return jsonify({
        "listings": [
            serialize_listing(listing, include_moderation_note=True)
            for listing in listings
        ],
        "roles": customer_roles(account.id),
    })


@marketplace_bp.put("/my-listings/<int:listing_id>")
def update_my_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    listing = VehicleListing.query.filter_by(
        id=listing_id,
        seller_account_id=account.id,
    ).first()
    if listing is None:
        raise MarketplaceError("listing_not_found", "Your vehicle listing was not found.", 404)
    if listing.status == "SIMULATED_PURCHASE":
        raise MarketplaceError(
            "listing_sold",
            "A listing with a simulated purchase cannot be edited.",
            409,
        )
    listing_fields = validate_listing_fields(request.form)
    photos = read_uploaded_photos(request.files.getlist("photos"), required=False)
    documents = read_ownership_documents(
        request.files.getlist("ownership_documents"),
        required=False,
    )
    if not documents and not ownership_document_ids(listing.id):
        raise MarketplaceError(
            "ownership_documents_required",
            "Upload at least one vehicle ownership document for manual review.",
        )
    for key, value in listing_fields.items():
        setattr(listing, key, value)
    listing.status = "PENDING_APPROVAL"
    listing.seller_verification_status = "PENDING"
    listing.seller_verified_by = None
    listing.seller_verified_at = None
    listing.seller_verification_note = None
    listing.reviewed_by = None
    listing.reviewed_at = None
    listing.moderation_note = None
    touch_listing(listing)
    if photos:
        VehicleListingPhoto.query.filter_by(listing_id=listing.id).delete()
        add_listing_photos(listing.id, photos)
    if documents:
        VehicleOwnershipDocument.query.filter_by(listing_id=listing.id).delete()
        add_ownership_documents(listing.id, documents)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing)})


@marketplace_bp.post("/my-listings/<int:listing_id>/withdraw")
def withdraw_my_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    listing = VehicleListing.query.filter_by(
        id=listing_id,
        seller_account_id=account.id,
    ).first()
    if listing is None:
        raise MarketplaceError("listing_not_found", "Your vehicle listing was not found.", 404)
    if listing.status == "SIMULATED_PURCHASE":
        raise MarketplaceError(
            "listing_sold",
            "A listing with a simulated purchase cannot be withdrawn.",
            409,
        )
    if listing.status == "WITHDRAWN":
        raise MarketplaceError(
            "listing_already_withdrawn",
            "This listing is already withdrawn.",
            409,
        )
    listing.status = "WITHDRAWN"
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing)})


@marketplace_bp.get("/moderation/session")
def moderation_session():
    moderator = current_moderator()
    return jsonify({
        "moderator": serialize_moderator(moderator) if moderator else None
    })


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@marketplace_bp.post("/moderation/register")
def moderator_register():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit administrator registration as JSON.", 400)
    email = payload.get("email")
    password = payload.get("password")
    invitation_code = payload.get("invitation_code")
    if not isinstance(email, str) or not isinstance(password, str) or not isinstance(invitation_code, str):
        return _error("invalid_request", "Email, password, and staff invitation passcode are required.", 400)

    email = email.strip().lower()
    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        return _error("invalid_email", "Enter a valid administrator email address.", 400)
    if not (14 <= len(password) <= 128):
        return _error("invalid_password", "Administrator password must be 14 to 128 characters.", 400)

    configured_code = current_app.config.get("ADMIN_INVITATION_CODE", "VMA-ADMIN-2026-STAFF")
    active_moderator = current_moderator()
    if invitation_code.strip() != configured_code and active_moderator is None:
        return _error(
            "invalid_invitation_code",
            "Invalid administrator authorization passcode. Contact project owner for staff onboarding.",
            403,
        )

    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise MarketplaceError(
            "database_not_configured",
            "Marketplace moderation requires PostgreSQL.",
            503,
        )

    existing = MarketplaceModerator.query.filter_by(email=email).first()
    if existing:
        if existing.is_active:
            return _error("account_exists", "An administrator account already exists with this email.", 409)
        existing.is_active = True
        existing.password_hash = generate_password_hash(password, method="scrypt")
        moderator = existing
    else:
        moderator = MarketplaceModerator(
            email=email,
            password_hash=generate_password_hash(password, method="scrypt"),
            is_active=True,
        )
        db.session.add(moderator)

    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise

    session.clear()
    session["marketplace_moderator_id"] = moderator.id
    session.permanent = True
    return jsonify({
        "moderator": serialize_moderator(moderator),
        "message": "Administrator account provisioned and signed in successfully.",
    }), 201


@marketplace_bp.post("/moderation/login")
def moderator_login():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit moderator credentials as JSON.", 400)
    email = payload.get("email")
    password = payload.get("password")
    if not isinstance(email, str) or not isinstance(password, str):
        return _error("invalid_credentials", "Email or password is incorrect.", 401)
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise MarketplaceError(
            "database_not_configured",
            "Marketplace moderation requires PostgreSQL.",
            503,
        )
    moderator = MarketplaceModerator.query.filter_by(
        email=email.strip().lower()
    ).first()
    if (
        not moderator
        or not moderator.is_active
        or not check_password_hash(moderator.password_hash, password)
    ):
        return _error("invalid_credentials", "Email or password is incorrect.", 401)
    session.clear()
    session["marketplace_moderator_id"] = moderator.id
    session.permanent = True
    return jsonify({"moderator": serialize_moderator(moderator)})


@marketplace_bp.post("/moderation/logout")
def moderator_logout():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    session.pop("marketplace_moderator_id", None)
    return jsonify({"moderator": None})


@marketplace_bp.get("/moderation/listings/pending")
def pending_listings():
    require_moderator()
    listings = VehicleListing.query.filter_by(
        status="PENDING_APPROVAL"
    ).order_by(
        VehicleListing.created_at.asc(),
        VehicleListing.id.asc(),
    ).limit(100).all()
    items = []
    for listing in listings:
        item = _current_listing_with_seller(listing)
        items.append(item)
    return jsonify({"listings": items})


def _review_listing(listing_id, status):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    if listing.status != "PENDING_APPROVAL":
        raise MarketplaceError(
            "listing_not_pending",
            "Only pending listings can be reviewed.",
            409,
        )
    if not ownership_document_ids(listing.id):
        raise MarketplaceError(
            "ownership_documents_required",
            "Seller verification requires at least one ownership document.",
            409,
        )
    if status == "APPROVED_ACTIVE" and listing.seller_verification_status != "VERIFIED":
        raise MarketplaceError(
            "seller_not_verified",
            "Manually verify the seller's ownership documents before approving this listing.",
            409,
        )
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit review details as JSON.", 400)
    note = payload.get("note", "")
    if not isinstance(note, str) or len(note.strip()) > 1000:
        raise MarketplaceError(
            "invalid_review_note",
            "The review note must be 1000 characters or fewer.",
        )
    listing.status = status
    listing.moderation_note = note.strip() or None
    listing.reviewed_by = moderator.id
    listing.reviewed_at = datetime.now(timezone.utc)
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_moderation_note=True)})


@marketplace_bp.post("/moderation/listings/<int:listing_id>/approve")
def approve_listing(listing_id):
    return _review_listing(listing_id, "APPROVED_ACTIVE")


@marketplace_bp.post("/moderation/listings/<int:listing_id>/reject")
def reject_listing(listing_id):
    return _review_listing(listing_id, "REJECTED")


@marketplace_bp.post("/moderation/listings/<int:listing_id>/verify-seller")
def verify_listing_seller(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    if listing.status != "PENDING_APPROVAL":
        raise MarketplaceError(
            "listing_not_pending",
            "Only pending listings can have seller documents verified.",
            409,
        )
    if not ownership_document_ids(listing.id):
        raise MarketplaceError(
            "ownership_documents_required",
            "Seller verification requires at least one ownership document.",
            409,
        )
    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return _error("invalid_request", "Submit review details as JSON.", 400)
    note = payload.get("note", "")
    if not isinstance(note, str) or len(note.strip()) > 1000:
        raise MarketplaceError(
            "invalid_review_note",
            "The verification note must be 1000 characters or fewer.",
        )
    listing.seller_verification_status = "VERIFIED"
    listing.seller_verified_by = moderator.id
    listing.seller_verified_at = datetime.now(timezone.utc)
    listing.seller_verification_note = note.strip() or None
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({
        "listing": serialize_listing(listing, include_moderation_note=True)
    })


@marketplace_bp.post("/listings/<int:listing_id>/purchase")
def simulate_listing_purchase(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    ensure_role(account.id, "BUYER")
    listing = VehicleListing.query.filter_by(
        id=listing_id,
        status="APPROVED_ACTIVE",
    ).with_for_update().first()
    if listing is None:
        raise MarketplaceError(
            "listing_not_available",
            "This approved listing is no longer available to purchase.",
            404,
        )
    if listing.seller_account_id == account.id:
        raise MarketplaceError(
            "seller_cannot_purchase_own_listing",
            "Sellers cannot purchase their own listing.",
            403,
        )
    transaction = MarketplaceTransaction(
        transaction_id=secrets.token_urlsafe(24),
        listing_id=listing.id,
        buyer_account_id=account.id,
        seller_account_id=listing.seller_account_id,
        amount=listing.asking_price,
        price_currency=listing.price_currency,
        status="SIMULATED_SUCCESS",
    )
    listing.status = "SIMULATED_PURCHASE"
    touch_listing(listing)
    db.session.add(transaction)
    commit_marketplace_write()
    return jsonify({
        "payment": {
            "label": "SIMULATED PURCHASE PAYMENT",
            "status": transaction.status,
            "real_payment": False,
            "message": (
                "Purchase simulation complete. No money was charged or transferred, "
                "and this does not confirm a sale."
            ),
        },
        "transaction": _transaction_response(transaction),
    }), 201


@marketplace_bp.get("/moderation/transactions")
def moderation_transactions():
    require_moderator()
    transactions = MarketplaceTransaction.query.order_by(
        MarketplaceTransaction.created_at.desc(),
        MarketplaceTransaction.id.desc(),
    ).limit(100).all()
    bookings = VehicleBooking.query.order_by(
        VehicleBooking.created_at.desc(),
        VehicleBooking.id.desc(),
    ).limit(100).all()
    booking_items = []
    for b in bookings:
        listing = db.session.get(VehicleListing, b.listing_id)
        buyer = db.session.get(CustomerAccount, b.buyer_account_id)
        seller = db.session.get(CustomerAccount, b.seller_account_id)
        booking_items.append({
            "transaction_id": b.booking_reference,
            "vehicle": f"{listing.manufacturing_year} {listing.brand} {listing.model}" if listing else "Vehicle",
            "buyer": f"{buyer.full_name} ({buyer.email})" if buyer else "Buyer",
            "seller": f"{seller.full_name} ({seller.email})" if seller else "Seller",
            "amount": str(b.deposit_amount),
            "total_price": str(b.total_price),
            "remaining_balance": str(b.remaining_balance),
            "price_currency": b.currency,
            "status": f"{b.payment_status} (50% Deposit)",
            "timestamp": b.created_at.isoformat(),
            "real_payment": False,
        })
    tx_items = [_transaction_response(transaction) for transaction in transactions]
    combined = booking_items + tx_items
    combined.sort(key=lambda x: x["timestamp"], reverse=True)
    return jsonify({"transactions": combined})


@marketplace_bp.get("/my-purchases")
def my_purchases():
    account = require_customer()
    ensure_role(account.id, "BUYER")
    transactions = MarketplaceTransaction.query.filter_by(
        buyer_account_id=account.id
    ).order_by(
        MarketplaceTransaction.created_at.desc(),
        MarketplaceTransaction.id.desc(),
    ).limit(100).all()
    commit_marketplace_write()
    return jsonify({
        "purchases": [
            _transaction_response(transaction)
            for transaction in transactions
        ]
    })


# --- Moderation Upgrade Endpoints for /marketplace-review ---

@marketplace_bp.get("/moderation/listings")
def get_moderation_listings():
    moderator = require_moderator()
    tab = request.args.get("tab", "all").strip().lower()

    query = VehicleListing.query
    if tab == "pending":
        query = query.filter_by(status="PENDING_APPROVAL")
    elif tab == "active":
        query = query.filter_by(status="APPROVED_ACTIVE")
    elif tab == "suspended":
        query = query.filter_by(status="SUSPENDED")
    elif tab == "flagged":
        query = query.filter(or_(VehicleListing.is_flagged == True, VehicleListing.status == "FLAGGED"))

    listings = query.order_by(
        VehicleListing.created_at.desc(),
        VehicleListing.id.desc(),
    ).limit(200).all()

    counts = {
        "pending": VehicleListing.query.filter_by(status="PENDING_APPROVAL").count(),
        "active": VehicleListing.query.filter_by(status="APPROVED_ACTIVE").count(),
        "suspended": VehicleListing.query.filter_by(status="SUSPENDED").count(),
        "flagged": VehicleListing.query.filter(or_(VehicleListing.is_flagged == True, VehicleListing.status == "FLAGGED")).count(),
        "all": VehicleListing.query.count(),
    }

    return jsonify({
        "listings": [
            serialize_listing(l, include_contact=True, include_moderation_note=True)
            for l in listings
        ],
        "counts": counts,
        "moderator": serialize_moderator(moderator),
    })


@marketplace_bp.post("/moderation/listings/<int:listing_id>/flag")
def flag_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    payload = request.get_json(silent=True) or {}
    reason = payload.get("reason", "").strip() or "Listing flagged for audit inspection."
    listing.is_flagged = True
    listing.flag_reason = reason
    audit = ModerationAuditLog(
        listing_id=listing.id,
        moderator_id=moderator.id,
        action="FLAG",
        reason=reason,
    )
    db.session.add(audit)
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_contact=True, include_moderation_note=True)})


@marketplace_bp.post("/moderation/listings/<int:listing_id>/suspend")
def suspend_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    payload = request.get_json(silent=True) or {}
    reason = payload.get("reason", "").strip()
    if not reason or len(reason) < 3:
        raise MarketplaceError(
            "invalid_suspension_reason",
            "A reason for suspension is required (minimum 3 characters).",
            400,
        )
    listing.status = "SUSPENDED"
    listing.suspension_reason = reason
    listing.suspended_at = datetime.now(timezone.utc)
    listing.suspended_by = moderator.id
    audit = ModerationAuditLog(
        listing_id=listing.id,
        moderator_id=moderator.id,
        action="SUSPEND",
        reason=reason,
    )
    db.session.add(audit)
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_contact=True, include_moderation_note=True)})


@marketplace_bp.post("/moderation/listings/<int:listing_id>/reinstate")
def reinstate_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    payload = request.get_json(silent=True) or {}
    note = payload.get("note", "").strip() or "Listing reinstated by moderator."
    listing.status = "APPROVED_ACTIVE"
    listing.suspension_reason = None
    listing.suspended_at = None
    listing.suspended_by = None
    listing.is_flagged = False
    listing.flag_reason = None
    audit = ModerationAuditLog(
        listing_id=listing.id,
        moderator_id=moderator.id,
        action="REINSTATE",
        reason=note,
    )
    db.session.add(audit)
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_contact=True, include_moderation_note=True)})


@marketplace_bp.post("/moderation/listings/<int:listing_id>/soft-remove")
def soft_remove_listing(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    moderator = require_moderator()
    listing = _listing_or_404(listing_id)
    payload = request.get_json(silent=True) or {}
    reason = payload.get("reason", "").strip() or "Listing soft-removed from public marketplace."
    listing.status = "SOFT_REMOVED"
    listing.moderation_note = reason
    audit = ModerationAuditLog(
        listing_id=listing.id,
        moderator_id=moderator.id,
        action="SOFT_REMOVE",
        reason=reason,
    )
    db.session.add(audit)
    touch_listing(listing)
    commit_marketplace_write()
    return jsonify({"listing": serialize_listing(listing, include_contact=True, include_moderation_note=True)})


@marketplace_bp.get("/moderation/audit-logs")
def get_audit_logs():
    require_moderator()
    logs = ModerationAuditLog.query.order_by(ModerationAuditLog.created_at.desc()).limit(100).all()
    results = []
    for log in logs:
        mod = db.session.get(MarketplaceModerator, log.moderator_id) if log.moderator_id else None
        listing = db.session.get(VehicleListing, log.listing_id)
        results.append({
            "id": log.id,
            "listing_id": log.listing_id,
            "vehicle": f"{listing.manufacturing_year} {listing.brand} {listing.model}" if listing else f"Listing #{log.listing_id}",
            "moderator_email": mod.email if mod else "Staff System",
            "action": log.action,
            "reason": log.reason,
            "created_at": log.created_at.isoformat(),
        })
    return jsonify({"audit_logs": results})


# --- QR Demo Payment & Vehicle Bookings (50% Deposit) ---

@marketplace_bp.post("/bookings")
def create_booking():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    ensure_role(account.id, "BUYER")
    payload = request.get_json(silent=True) or {}
    listing_id = payload.get("listing_id")
    notes = payload.get("notes", "")

    if not listing_id:
        return _error("invalid_request", "listing_id is required.", 400)

    listing = VehicleListing.query.filter_by(id=listing_id).with_for_update().one_or_none()
    if listing is None:
        return _error("listing_not_found", "Vehicle listing was not found.", 404)
    if listing.status != "APPROVED_ACTIVE":
        return _error(
            "listing_unavailable",
            f"This vehicle listing is not available for booking (Status: {listing.status}).",
            409,
        )
    if listing.seller_account_id == account.id:
        return _error("cannot_book_own_vehicle", "Sellers cannot book their own vehicle.", 403)

    existing_booking = VehicleBooking.query.filter_by(
        listing_id=listing.id,
        booking_status="CONFIRMED",
    ).first()
    if existing_booking:
        return _error(
            "already_booked",
            f"This vehicle has already been reserved with booking reference {existing_booking.booking_reference}.",
            409,
        )

    total_price = listing.asking_price
    deposit_amount = (total_price * Decimal("0.50")).quantize(Decimal("0.01"))
    remaining_balance = total_price - deposit_amount
    booking_ref = f"BK-VMA-2026-{secrets.token_hex(4).upper()}"
    demo_ref = f"UPI-DEMO-{secrets.token_hex(6).upper()}"

    booking = VehicleBooking(
        booking_reference=booking_ref,
        listing_id=listing.id,
        buyer_account_id=account.id,
        seller_account_id=listing.seller_account_id,
        total_price=total_price,
        deposit_amount=deposit_amount,
        remaining_balance=remaining_balance,
        currency=listing.price_currency.strip() or "INR",
        payment_status="CONFIRMED_DEMO",
        booking_status="CONFIRMED",
        demo_payment_reference=demo_ref,
        notes=notes.strip() if isinstance(notes, str) else None,
    )
    db.session.add(booking)
    listing.status = "SIMULATED_PURCHASE"
    touch_listing(listing)

    tx = MarketplaceTransaction(
        transaction_id=secrets.token_urlsafe(24),
        listing_id=listing.id,
        buyer_account_id=account.id,
        seller_account_id=listing.seller_account_id,
        amount=deposit_amount,
        price_currency=listing.price_currency,
        status="SIMULATED_SUCCESS",
    )
    db.session.add(tx)
    commit_marketplace_write()

    return jsonify({
        "booking": {
            "id": booking.id,
            "booking_reference": booking.booking_reference,
            "vehicle": f"{listing.manufacturing_year} {listing.brand} {listing.model}",
            "total_price": str(booking.total_price),
            "deposit_amount": str(booking.deposit_amount),
            "remaining_balance": str(booking.remaining_balance),
            "currency": booking.currency,
            "payment_status": booking.payment_status,
            "booking_status": booking.booking_status,
            "demo_payment_reference": booking.demo_payment_reference,
            "notice": "DEMO PAYMENT — NO REAL MONEY TRANSFERRED",
            "created_at": booking.created_at.isoformat(),
        }
    }), 201


@marketplace_bp.get("/bookings/my-bookings")
def get_my_bookings():
    account = require_customer()
    bookings = VehicleBooking.query.filter_by(
        buyer_account_id=account.id
    ).order_by(VehicleBooking.created_at.desc()).all()
    results = []
    for b in bookings:
        listing = db.session.get(VehicleListing, b.listing_id)
        seller = db.session.get(CustomerAccount, b.seller_account_id)
        results.append({
            "id": b.id,
            "booking_reference": b.booking_reference,
            "listing_id": b.listing_id,
            "vehicle": f"{listing.manufacturing_year} {listing.brand} {listing.model}" if listing else "Vehicle",
            "brand": listing.brand if listing else "",
            "model": listing.model if listing else "",
            "year": listing.manufacturing_year if listing else "",
            "location": listing.location if listing else "",
            "photo_ids": listing_photo_ids(listing.id) if listing else [],
            "total_price": str(b.total_price),
            "deposit_amount": str(b.deposit_amount),
            "remaining_balance": str(b.remaining_balance),
            "currency": b.currency,
            "payment_status": b.payment_status,
            "booking_status": b.booking_status,
            "demo_payment_reference": b.demo_payment_reference,
            "seller_name": seller.full_name if seller else "Verified Seller",
            "seller_phone": seller.phone_number if seller else "",
            "seller_email": seller.email if seller else "",
            "created_at": b.created_at.isoformat(),
            "notice": "DEMO PAYMENT — NO REAL MONEY TRANSFERRED",
        })
    return jsonify({"bookings": results})


@marketplace_bp.get("/bookings/seller-bookings")

def get_seller_bookings():
    account = require_customer()
    bookings = VehicleBooking.query.filter_by(
        seller_account_id=account.id
    ).order_by(VehicleBooking.created_at.desc()).all()

    results = []

    for b in bookings:
        listing = db.session.get(VehicleListing, b.listing_id)
        buyer = db.session.get(CustomerAccount, b.buyer_account_id)

        results.append({
            "id": b.id,
            "booking_reference": b.booking_reference,
            "listing_id": b.listing_id,
            "vehicle": (
                f"{listing.manufacturing_year} {listing.brand} {listing.model}"
                if listing else "Vehicle"
            ),
            "photo_ids": listing_photo_ids(listing.id) if listing else [],
            "total_price": str(b.total_price),
            "deposit_amount": str(b.deposit_amount),
            "remaining_balance": str(b.remaining_balance),
            "currency": b.currency,
            "payment_status": b.payment_status,
            "booking_status": b.booking_status,
            "demo_payment_reference": b.demo_payment_reference,
            "buyer_name": buyer.full_name if buyer else "Buyer",
            "buyer_email": buyer.email if buyer else "",
            "buyer_phone": buyer.phone_number if buyer else "",
            "created_at": b.created_at.isoformat(),
            "notice": "DEMO PAYMENT — NO REAL MONEY TRANSFERRED",
        })

    return jsonify({"bookings": results})



# --- Memberships (Buyer Free/Basic/Premium & Seller Yearly) ---

@marketplace_bp.get("/memberships/status")
def get_membership_status():
    account = require_customer()
    return jsonify({
        "account_id": account.id,
        "email": account.email,
        "buyer_tier": getattr(account, "buyer_tier", "FREE"),
        "buyer_tier_expires_at": account.buyer_tier_expires_at.isoformat() if getattr(account, "buyer_tier_expires_at", None) else None,
        "seller_membership_status": getattr(account, "seller_membership_status", "INACTIVE"),
        "seller_membership_expires_at": account.seller_membership_expires_at.isoformat() if getattr(account, "seller_membership_expires_at", None) else None,
        "pricing": {
            "buyer_basic": current_app.config.get("BUYER_BASIC_ANNUAL_PRICE", 99),
            "buyer_premium": current_app.config.get("BUYER_PREMIUM_ANNUAL_PRICE", 999),
            "seller_yearly": current_app.config.get("SELLER_MEMBERSHIP_ANNUAL_PRICE", 1499),
        },
        "benefits": {
            "buyer_free": [
                "Browse 10 vehicle listings",
                "Standard vehicle specifications",
                "Compare up to 2 vehicles",
            ],
            "buyer_basic": [
                "Everything in Free",
                "Full technical details & seller info",
                "Compare up to 4 vehicles",
                "Unlimited favourites",
                "Vehicle booking access with 50% deposit",
            ],
            "buyer_premium": [
                "Everything in Basic",
                "Unlimited vehicle comparisons",
                "Priority vehicle booking",
                "Inspection certificate downloads",
                "VIP concierge support",
            ],
            "seller_yearly": [
                "List up to 10 vehicles",
                "Automated instant publishing upon validation",
                "Photo gallery & ownership document verification",
                "Seller dashboard & booking management",
                "Direct buyer connect",
            ],
        },
    })


@marketplace_bp.post("/memberships/purchase")
def purchase_membership():
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    payload = request.get_json(silent=True) or {}
    m_type = payload.get("membership_type")
    if m_type not in ("BUYER_BASIC", "BUYER_PREMIUM", "SELLER_YEARLY"):
        return _error("invalid_membership_type", "Supported memberships: BUYER_BASIC, BUYER_PREMIUM, SELLER_YEARLY.", 400)

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=365)
    demo_ref = f"UPI-DEMO-{secrets.token_hex(6).upper()}"
    tx_ref = f"TX-MBR-{secrets.token_hex(6).upper()}"

    if m_type == "BUYER_BASIC":
        amount = Decimal(current_app.config.get("BUYER_BASIC_ANNUAL_PRICE", 99))
        account.buyer_tier = "BASIC"
        account.buyer_tier_expires_at = expires
        ensure_role(account.id, "BUYER")
    elif m_type == "BUYER_PREMIUM":
        amount = Decimal(current_app.config.get("BUYER_PREMIUM_ANNUAL_PRICE", 999))
        account.buyer_tier = "PREMIUM"
        account.buyer_tier_expires_at = expires
        account.account_status = "premium"
        account.premium_plan = "yearly"
        account.premium_expires_at = expires
        ensure_role(account.id, "BUYER")
    elif m_type == "SELLER_YEARLY":
        amount = Decimal(current_app.config.get("SELLER_MEMBERSHIP_ANNUAL_PRICE", 1499))
        account.seller_membership_status = "ACTIVE"
        account.seller_membership_expires_at = expires
        ensure_role(account.id, "SELLER")

    tx = MembershipTransaction(
        transaction_reference=tx_ref,
        customer_account_id=account.id,
        membership_type=m_type,
        amount=amount,
        currency="INR",
        status="CONFIRMED_DEMO",
        payment_method="UPI_QR_DEMO",
        demo_upi_reference=demo_ref,
    )
    db.session.add(tx)
    commit_marketplace_write()

    return jsonify({
        "transaction": {
            "transaction_reference": tx.transaction_reference,
            "membership_type": tx.membership_type,
            "amount": str(tx.amount),
            "currency": tx.currency,
            "status": tx.status,
            "demo_upi_reference": tx.demo_upi_reference,
            "notice": "DEMO PAYMENT — NO REAL MONEY TRANSFERRED",
            "created_at": tx.created_at.isoformat(),
        },
        "account": {
            "buyer_tier": account.buyer_tier,
            "buyer_tier_expires_at": account.buyer_tier_expires_at.isoformat() if account.buyer_tier_expires_at else None,
            "seller_membership_status": account.seller_membership_status,
            "seller_membership_expires_at": account.seller_membership_expires_at.isoformat() if account.seller_membership_expires_at else None,
        },
    })


# --- Buyer Favourites ---

@marketplace_bp.get("/favourites")
def get_favourites():
    account = require_customer()
    favs = BuyerFavourite.query.filter_by(
        customer_account_id=account.id
    ).order_by(BuyerFavourite.created_at.desc()).all()
    listing_ids = [f.listing_id for f in favs]
    listings = VehicleListing.query.filter(VehicleListing.id.in_(listing_ids)).all() if listing_ids else []
    return jsonify({
        "favourite_ids": listing_ids,
        "listings": [serialize_listing(l) for l in listings],
    })


@marketplace_bp.post("/favourites/<int:listing_id>")
def add_favourite(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    listing = _listing_or_404(listing_id)
    existing = BuyerFavourite.query.filter_by(
        customer_account_id=account.id,
        listing_id=listing.id,
    ).first()
    if not existing:
        db.session.add(BuyerFavourite(customer_account_id=account.id, listing_id=listing.id))
        commit_marketplace_write()
    return jsonify({"status": "added", "listing_id": listing.id})


@marketplace_bp.delete("/favourites/<int:listing_id>")
def remove_favourite(listing_id):
    origin_error = _origin_error()
    if origin_error:
        return origin_error
    account = require_customer()
    BuyerFavourite.query.filter_by(
        customer_account_id=account.id,
        listing_id=listing_id,
    ).delete()
    commit_marketplace_write()
    return jsonify({"status": "removed", "listing_id": listing_id})
