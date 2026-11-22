import io
import re
import warnings
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from flask import current_app, session
from PIL import Image, ImageOps
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from extensions import db
from models.customer_account import CustomerAccount
from models.marketplace import (
    MarketplaceCustomerRole,
    MarketplaceModerator,
    VehicleListing,
    VehicleOwnershipDocument,
    VehicleListingPhoto,
)
from services.customer_accounts import get_current_account


MAX_PHOTO_COUNT = 8
MAX_PHOTO_BYTES = 5 * 1024 * 1024
MAX_TOTAL_PHOTO_BYTES = 24 * 1024 * 1024
MIN_PHOTO_COUNT = 2
MAX_OWNERSHIP_DOCUMENT_COUNT = 5
MAX_OWNERSHIP_DOCUMENT_BYTES = 5 * 1024 * 1024
MAX_TOTAL_OWNERSHIP_DOCUMENT_BYTES = 15 * 1024 * 1024
MAX_PHOTO_PIXELS = 30_000_000
ALLOWED_IMAGE_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}
ROLE_NAMES = {"BUYER", "SELLER"}


class MarketplaceError(Exception):
    def __init__(self, code, message, status=400):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


def require_customer():
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise MarketplaceError(
            "database_not_configured",
            "Marketplace listings require the configured PostgreSQL database.",
            503,
        )
    account = get_current_account()
    if account is None:
        raise MarketplaceError(
            "authentication_required",
            "Sign in to use the customer marketplace.",
            401,
        )
    return account


def current_moderator():
    moderator_id = session.get("marketplace_moderator_id")
    if moderator_id is None:
        return None
    try:
        moderator = db.session.get(MarketplaceModerator, moderator_id)
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Marketplace moderator lookup failed")
        raise MarketplaceError(
            "moderation_unavailable",
            "Marketplace moderation storage is unavailable.",
            503,
        ) from error
    if moderator is None or not moderator.is_active:
        session.pop("marketplace_moderator_id", None)
        return None
    return moderator


def require_moderator():
    if not current_app.secret_key:
        raise MarketplaceError(
            "auth_not_configured",
            "Set SECRET_KEY in backend/.env to enable moderation sign-in.",
            503,
        )
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise MarketplaceError(
            "database_not_configured",
            "Marketplace moderation requires PostgreSQL.",
            503,
        )
    moderator = current_moderator()
    if moderator is None:
        raise MarketplaceError(
            "moderator_authentication_required",
            "Authorized staff and moderator authentication required to access marketplace review. Please sign in with your staff account.",
            401,
        )
    return moderator


def ensure_role(account_id, role_name):
    if role_name not in ROLE_NAMES:
        raise ValueError("Unsupported customer marketplace role.")
    role = db.session.get(MarketplaceCustomerRole, (account_id, role_name))
    if role is None:
        role = MarketplaceCustomerRole(
            customer_account_id=account_id,
            role_name=role_name,
        )
        db.session.add(role)
    return role


def customer_roles(account_id):
    roles = db.session.query(MarketplaceCustomerRole.role_name).filter_by(
        customer_account_id=account_id
    ).order_by(MarketplaceCustomerRole.role_name).all()
    return [role.role_name for role in roles]


def commit_marketplace_write():
    try:
        db.session.commit()
    except IntegrityError as error:
        db.session.rollback()
        raise MarketplaceError(
            "marketplace_conflict",
            "The marketplace change conflicts with current listing data.",
            409,
        ) from error
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Marketplace database write failed")
        raise MarketplaceError(
            "marketplace_unavailable",
            "Marketplace storage is unavailable; retry after verifying PostgreSQL.",
            503,
        ) from error


def validate_listing_fields(values):
    text_fields = {
        "brand": (100, "Brand"),
        "model": (120, "Model"),
        "fuel_type": (40, "Fuel type"),
        "transmission": (40, "Transmission"),
        "description": (5000, "Description"),
        "location": (160, "Location"),
    }
    cleaned = {}
    for key, (maximum, label) in text_fields.items():
        value = values.get(key)
        if not isinstance(value, str):
            raise MarketplaceError("invalid_listing", f"{label} is required.")
        value = value.strip()
        if not value or len(value) > maximum:
            raise MarketplaceError(
                "invalid_listing",
                f"{label} must contain 1 to {maximum} characters.",
            )
        cleaned[key] = value

    try:
        year = int(values.get("manufacturing_year", ""))
    except (TypeError, ValueError) as error:
        raise MarketplaceError(
            "invalid_listing",
            "Manufacturing year must be a whole number.",
        ) from error
    if not 1886 <= year <= datetime.now().year:
        raise MarketplaceError(
            "invalid_listing",
            "Manufacturing year must be between 1886 and the current year.",
        )

    try:
        distance = int(values.get("kilometres_driven", ""))
    except (TypeError, ValueError) as error:
        raise MarketplaceError(
            "invalid_listing",
            "Kilometres driven must be a whole number.",
        ) from error
    if not 0 <= distance <= 9_000_000_000:
        raise MarketplaceError(
            "invalid_listing",
            "Kilometres driven must be a non-negative whole number.",
        )

    try:
        price = Decimal(str(values.get("asking_price", "")).strip())
        if not price.is_finite() or price < 0 or price > Decimal("999999999999.99"):
            raise InvalidOperation
        rounded_price = price.quantize(Decimal("0.01"))
        if rounded_price != price:
            raise InvalidOperation
        price = rounded_price
    except (InvalidOperation, ValueError) as error:
        raise MarketplaceError(
            "invalid_listing",
            "Asking price must be a non-negative amount with at most two decimal places.",
        ) from error

    currency = values.get("price_currency")
    if not isinstance(currency, str):
        raise MarketplaceError("invalid_listing", "Enter a three-letter currency code.")
    currency = currency.strip().upper()
    if not re.fullmatch(r"[A-Z]{3}", currency):
        raise MarketplaceError("invalid_listing", "Enter a three-letter currency code.")

    return {
        **cleaned,
        "manufacturing_year": year,
        "kilometres_driven": distance,
        "asking_price": price,
        "price_currency": currency,
    }


def sanitize_photo(upload):
    data = upload.read(MAX_PHOTO_BYTES + 1)
    if not data:
        raise MarketplaceError("invalid_photo", "Uploaded photos cannot be empty.")
    if len(data) > MAX_PHOTO_BYTES:
        raise MarketplaceError(
            "invalid_photo",
            "Each vehicle photo must be 5 MB or smaller.",
        )

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as source:
                image_format = source.format
                width, height = source.size
                if width * height > MAX_PHOTO_PIXELS:
                    raise MarketplaceError(
                        "invalid_photo",
                        "Vehicle photos must be 30 megapixels or smaller.",
                    )
                if image_format not in ALLOWED_IMAGE_FORMATS:
                    raise MarketplaceError(
                        "invalid_photo",
                        "Photos must be JPEG, PNG, or WebP images.",
                    )
                source.verify()
            with Image.open(io.BytesIO(data)) as source:
                source.load()
                cleaned = ImageOps.exif_transpose(source)
                if image_format == "JPEG":
                    cleaned = cleaned.convert("RGB")
                elif image_format == "PNG":
                    cleaned = cleaned.convert(
                        "RGBA" if "A" in cleaned.getbands() else "RGB"
                    )
                else:
                    cleaned = cleaned.convert(
                        "RGBA" if "A" in cleaned.getbands() else "RGB"
                    )
                output = io.BytesIO()
                save_options = {"optimize": True}
                if image_format in {"JPEG", "WEBP"}:
                    save_options["quality"] = 90
                cleaned.save(output, format=image_format, **save_options)
    except MarketplaceError:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        raise MarketplaceError(
            "invalid_photo",
            "This image is too large to process safely.",
        ) from error
    except (OSError, ValueError, SyntaxError) as error:
        raise MarketplaceError(
            "invalid_photo",
            "One or more uploads are not valid JPEG, PNG, or WebP photos.",
        ) from error

    sanitized = output.getvalue()
    if len(sanitized) > MAX_PHOTO_BYTES:
        raise MarketplaceError(
            "invalid_photo",
            "Processed vehicle photos must be 5 MB or smaller.",
        )
    return ALLOWED_IMAGE_FORMATS[image_format], sanitized


def read_uploaded_photos(uploads, required):
    uploads = [upload for upload in uploads if upload and upload.filename]
    if required and len(uploads) < MIN_PHOTO_COUNT:
        raise MarketplaceError(
            "photos_required",
            f"Upload at least {MIN_PHOTO_COUNT} actual vehicle photos.",
        )
    if uploads and len(uploads) < MIN_PHOTO_COUNT:
        raise MarketplaceError(
            "photos_required",
            f"Upload at least {MIN_PHOTO_COUNT} actual vehicle photos.",
        )
    if len(uploads) > MAX_PHOTO_COUNT:
        raise MarketplaceError(
            "too_many_photos",
            f"Upload no more than {MAX_PHOTO_COUNT} photos.",
        )

    photos = []
    total_bytes = 0
    for upload in uploads:
        content_type, image_data = sanitize_photo(upload)
        total_bytes += len(image_data)
        if total_bytes > MAX_TOTAL_PHOTO_BYTES:
            raise MarketplaceError(
                "photos_too_large",
                "The total processed photo size must be 24 MB or smaller.",
            )
        photos.append((content_type, image_data))
    return photos


def read_ownership_documents(uploads, required):
    uploads = [upload for upload in uploads if upload and upload.filename]
    if required and not uploads:
        raise MarketplaceError(
            "ownership_documents_required",
            "Upload at least one vehicle ownership document for manual review.",
        )
    if len(uploads) > MAX_OWNERSHIP_DOCUMENT_COUNT:
        raise MarketplaceError(
            "too_many_ownership_documents",
            f"Upload no more than {MAX_OWNERSHIP_DOCUMENT_COUNT} ownership documents.",
        )

    documents = []
    total_bytes = 0
    for upload in uploads:
        data = upload.read(MAX_OWNERSHIP_DOCUMENT_BYTES + 1)
        if not data:
            raise MarketplaceError(
                "invalid_ownership_document",
                "Ownership documents cannot be empty.",
            )
        if len(data) > MAX_OWNERSHIP_DOCUMENT_BYTES:
            raise MarketplaceError(
                "invalid_ownership_document",
                "Each ownership document must be 5 MB or smaller.",
            )
        if data.startswith(b"%PDF-") and b"%%EOF" in data[-1024:]:
            content_type, document_data = "application/pdf", data
        else:
            try:
                content_type, document_data = sanitize_photo(io.BytesIO(data))
            except MarketplaceError as error:
                raise MarketplaceError(
                    "invalid_ownership_document",
                    "Ownership documents must be valid PDF, JPEG, PNG, or WebP files.",
                ) from error
        total_bytes += len(document_data)
        if total_bytes > MAX_TOTAL_OWNERSHIP_DOCUMENT_BYTES:
            raise MarketplaceError(
                "ownership_documents_too_large",
                "Ownership documents must total 15 MB or less.",
            )
        documents.append((content_type, document_data))
    return documents


def add_listing_photos(listing_id, photos):
    db.session.add_all([
        VehicleListingPhoto(
            listing_id=listing_id,
            display_order=index,
            content_type=content_type,
            image_data=image_data,
        )
        for index, (content_type, image_data) in enumerate(photos)
    ])


def add_ownership_documents(listing_id, documents):
    db.session.add_all([
        VehicleOwnershipDocument(
            listing_id=listing_id,
            display_order=index,
            content_type=content_type,
            document_data=document_data,
        )
        for index, (content_type, document_data) in enumerate(documents)
    ])


def listing_photo_ids(listing_id):
    rows = db.session.query(
        VehicleListingPhoto.id
    ).filter_by(listing_id=listing_id).order_by(
        VehicleListingPhoto.display_order
    ).all()
    return [row.id for row in rows]


def ownership_document_ids(listing_id):
    rows = db.session.query(
        VehicleOwnershipDocument.id
    ).filter_by(listing_id=listing_id).order_by(
        VehicleOwnershipDocument.display_order
    ).all()
    return [row.id for row in rows]


def serialize_listing(
    listing,
    include_contact=False,
    include_moderation_note=False,
):
    result = {
        "id": listing.id,
        "brand": listing.brand,
        "model": listing.model,
        "manufacturing_year": listing.manufacturing_year,
        "fuel_type": listing.fuel_type,
        "transmission": listing.transmission,
        "kilometres_driven": listing.kilometres_driven,
        "asking_price": str(listing.asking_price),
        "price_currency": listing.price_currency.strip(),
        "description": listing.description,
        "location": listing.location,
        "status": listing.status,
        "seller_verification_status": listing.seller_verification_status,
        "is_flagged": getattr(listing, "is_flagged", False),
        "flag_reason": getattr(listing, "flag_reason", None),
        "suspension_reason": getattr(listing, "suspension_reason", None),
        "suspended_at": listing.suspended_at.isoformat() if getattr(listing, "suspended_at", None) else None,
        "photo_ids": listing_photo_ids(listing.id),
        "created_at": listing.created_at.isoformat(),
        "updated_at": listing.updated_at.isoformat(),
    }
    if include_moderation_note:
        result["moderation_note"] = listing.moderation_note
        result["ownership_document_ids"] = ownership_document_ids(listing.id)
        result["seller_verification_note"] = listing.seller_verification_note
    if include_contact:
        seller = db.session.get(CustomerAccount, listing.seller_account_id)
        result["seller"] = (
            {
                "id": seller.id,
                "name": seller.full_name,
                "phone": seller.phone_number,
                "email": seller.email,
                "account_status": seller.account_status,
                "seller_membership_status": getattr(seller, "seller_membership_status", "INACTIVE"),
                "seller_membership_expires_at": (
                    seller.seller_membership_expires_at.isoformat()
                    if getattr(seller, "seller_membership_expires_at", None)
                    else None
                ),
            }
            if seller
            else None
        )
    return result


def serialize_moderator(moderator):
    return {"id": moderator.id, "email": moderator.email}


def touch_listing(listing):
    listing.updated_at = datetime.now(timezone.utc)
