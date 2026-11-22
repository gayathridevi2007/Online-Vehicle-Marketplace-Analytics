from datetime import datetime, timezone

from extensions import db


class CustomerAccount(db.Model):
    __tablename__ = "customer_account"
    __table_args__ = (
        db.CheckConstraint(
            "(account_status = 'free' AND premium_plan IS NULL "
            "AND premium_expires_at IS NULL) OR "
            "(account_status = 'premium' AND premium_plan IN ('monthly', 'yearly') "
            "AND premium_expires_at IS NOT NULL)",
            name="customer_account_subscription_check",
        ),
        {"schema": "customer_portal"},
    )

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone_number = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(254), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_image_mime = db.Column(db.String(32), nullable=False)
    profile_image_data = db.Column(db.LargeBinary, nullable=False)
    account_status = db.Column(db.String(16), nullable=False, default="free")
    premium_plan = db.Column(db.String(16))
    premium_expires_at = db.Column(db.DateTime(timezone=True))
    buyer_tier = db.Column(db.String(16), nullable=False, default="FREE")
    buyer_tier_expires_at = db.Column(db.DateTime(timezone=True))
    seller_membership_status = db.Column(db.String(16), nullable=False, default="INACTIVE")
    seller_membership_expires_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
