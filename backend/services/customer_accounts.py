import base64
from datetime import datetime, timezone

from flask import current_app, session
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models.customer_account import CustomerAccount


class CustomerAuthError(Exception):
    def __init__(self, code, message, status=503):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


def account_has_active_premium(account, now=None):
    if account.account_status != "premium" or not account.premium_expires_at:
        return False
    expires_at = account.premium_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > (now or datetime.now(timezone.utc))


def serialize_account(account):
    premium = account_has_active_premium(account)
    profile_image = None
    if account.profile_image_data:
        encoded = base64.b64encode(account.profile_image_data).decode("ascii")
        profile_image = f"data:{account.profile_image_mime};base64,{encoded}"
    return {
        "id": account.id,
        "full_name": account.full_name,
        "phone_number": account.phone_number,
        "email": account.email,
        "profile_image": profile_image,
        "account_status": "premium" if premium else "free",
        "premium_plan": account.premium_plan if premium else None,
        "premium_expires_at": (
            account.premium_expires_at.isoformat()
            if premium and account.premium_expires_at
            else None
        ),
        "buyer_tier": getattr(account, "buyer_tier", "FREE"),
        "buyer_tier_expires_at": (
            account.buyer_tier_expires_at.isoformat()
            if getattr(account, "buyer_tier_expires_at", None)
            else None
        ),
        "seller_membership_status": getattr(account, "seller_membership_status", "INACTIVE"),
        "seller_membership_expires_at": (
            account.seller_membership_expires_at.isoformat()
            if getattr(account, "seller_membership_expires_at", None)
            else None
        ),
    }


def get_current_account():
    account_id = session.get("customer_account_id")
    if account_id is None:
        return None
    if not current_app.config.get("SQLALCHEMY_DATABASE_URI"):
        raise CustomerAuthError(
            "database_not_configured",
            "Customer account storage requires the configured PostgreSQL database.",
        )
    try:
        account = db.session.get(CustomerAccount, account_id)
        if account is None:
            session.clear()
            return None
        if account.account_status == "premium" and not account_has_active_premium(account):
            account.account_status = "free"
            account.premium_plan = None
            account.premium_expires_at = None
            db.session.commit()
        return account
    except SQLAlchemyError as error:
        db.session.rollback()
        current_app.logger.exception("Customer account lookup failed")
        raise CustomerAuthError(
            "customer_account_unavailable",
            "Customer account storage is unavailable; verify the customer portal schema.",
        ) from error
