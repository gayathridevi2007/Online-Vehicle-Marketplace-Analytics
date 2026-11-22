from datetime import datetime, timezone

from extensions import db


class MarketplaceCustomerRole(db.Model):
    __tablename__ = "customer_role"
    __table_args__ = (
        db.CheckConstraint(
            "role_name IN ('BUYER', 'SELLER')",
            name="customer_role_name_check",
        ),
        {"schema": "marketplace"},
    )

    customer_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="CASCADE"),
        primary_key=True,
    )
    role_name = db.Column(db.String(16), primary_key=True)
    assigned_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class MarketplaceModerator(db.Model):
    __tablename__ = "moderator_account"
    __table_args__ = {"schema": "marketplace"}

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class VehicleListing(db.Model):
    __tablename__ = "vehicle_listing"
    __table_args__ = (
        db.CheckConstraint(
            "manufacturing_year BETWEEN 1886 AND 2100",
            name="vehicle_listing_year_check",
        ),
        db.CheckConstraint(
            "kilometres_driven >= 0",
            name="vehicle_listing_distance_check",
        ),
        db.CheckConstraint(
            "asking_price >= 0",
            name="vehicle_listing_price_check",
        ),
        db.CheckConstraint(
            "status IN ('PENDING_APPROVAL', 'APPROVED_ACTIVE', "
            "'REJECTED', 'WITHDRAWN', 'SIMULATED_PURCHASE', "
            "'SUSPENDED', 'FLAGGED', 'SOFT_REMOVED')",
            name="vehicle_listing_status_check",
        ),
        db.CheckConstraint(
            "seller_verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')",
            name="vehicle_listing_seller_verification_check",
        ),
        db.Index(
            "idx_vehicle_listing_public",
            "status",
            "created_at",
        ),
        db.Index(
            "idx_vehicle_listing_seller",
            "seller_account_id",
            "created_at",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    seller_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="CASCADE"),
        nullable=False,
    )
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(120), nullable=False)
    manufacturing_year = db.Column(db.SmallInteger, nullable=False)
    fuel_type = db.Column(db.String(40), nullable=False)
    transmission = db.Column(db.String(40), nullable=False)
    kilometres_driven = db.Column(db.BigInteger, nullable=False)
    asking_price = db.Column(db.Numeric(14, 2), nullable=False)
    price_currency = db.Column(db.String(3), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(160), nullable=False)
    status = db.Column(
        db.String(32),
        nullable=False,
        default="PENDING_APPROVAL",
    )
    seller_verification_status = db.Column(
        db.String(16),
        nullable=False,
        default="PENDING",
    )
    seller_verified_by = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.moderator_account.id", ondelete="SET NULL"),
    )
    seller_verified_at = db.Column(db.DateTime(timezone=True))
    seller_verification_note = db.Column(db.String(1000))
    moderation_note = db.Column(db.String(1000))
    is_flagged = db.Column(db.Boolean, nullable=False, default=False)
    flag_reason = db.Column(db.String(1000))
    suspension_reason = db.Column(db.String(1000))
    suspended_at = db.Column(db.DateTime(timezone=True))
    suspended_by = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.moderator_account.id", ondelete="SET NULL"),
    )
    reviewed_by = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.moderator_account.id", ondelete="SET NULL"),
    )
    reviewed_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class VehicleListingPhoto(db.Model):
    __tablename__ = "vehicle_listing_photo"
    __table_args__ = (
        db.UniqueConstraint(
            "listing_id",
            "display_order",
            name="vehicle_listing_photo_order_unique",
        ),
        db.CheckConstraint(
            "display_order >= 0",
            name="vehicle_listing_photo_order_check",
        ),
        db.CheckConstraint(
            "content_type IN ('image/jpeg', 'image/png', 'image/webp')",
            name="vehicle_listing_photo_content_type_check",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="CASCADE"),
        nullable=False,
    )
    display_order = db.Column(db.SmallInteger, nullable=False)
    content_type = db.Column(db.String(32), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class VehicleOwnershipDocument(db.Model):
    __tablename__ = "vehicle_ownership_document"
    __table_args__ = (
        db.UniqueConstraint(
            "listing_id",
            "display_order",
            name="vehicle_ownership_document_order_unique",
        ),
        db.CheckConstraint(
            "display_order >= 0",
            name="vehicle_ownership_document_order_check",
        ),
        db.CheckConstraint(
            "content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')",
            name="vehicle_ownership_document_content_type_check",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="CASCADE"),
        nullable=False,
    )
    display_order = db.Column(db.SmallInteger, nullable=False)
    content_type = db.Column(db.String(32), nullable=False)
    document_data = db.Column(db.LargeBinary, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class MarketplaceTransaction(db.Model):
    __tablename__ = "simulated_transaction"
    __table_args__ = (
        db.UniqueConstraint("listing_id", name="simulated_transaction_listing_unique"),
        db.CheckConstraint(
            "status = 'SIMULATED_SUCCESS'",
            name="simulated_transaction_status_check",
        ),
        db.CheckConstraint(
            "amount >= 0",
            name="simulated_transaction_amount_check",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(64), nullable=False, unique=True)
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="RESTRICT"),
        nullable=False,
    )
    buyer_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="RESTRICT"),
        nullable=False,
    )
    seller_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="RESTRICT"),
        nullable=False,
    )
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    price_currency = db.Column(db.String(3), nullable=False)
    status = db.Column(db.String(32), nullable=False, default="SIMULATED_SUCCESS")
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class ModerationAuditLog(db.Model):
    __tablename__ = "moderation_audit_log"
    __table_args__ = {"schema": "marketplace"}

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="CASCADE"),
        nullable=False,
    )
    moderator_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.moderator_account.id", ondelete="SET NULL"),
    )
    action = db.Column(db.String(32), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class VehicleBooking(db.Model):
    __tablename__ = "vehicle_booking"
    __table_args__ = (
        db.CheckConstraint("total_price >= 0", name="vehicle_booking_total_price_check"),
        db.CheckConstraint("deposit_amount >= 0", name="vehicle_booking_deposit_amount_check"),
        db.CheckConstraint("remaining_balance >= 0", name="vehicle_booking_remaining_balance_check"),
        db.CheckConstraint(
            "payment_status IN ('PENDING_PAYMENT', 'CONFIRMED_DEMO', 'CANCELLED', 'COMPLETED')",
            name="vehicle_booking_payment_status_check",
        ),
        db.CheckConstraint(
            "booking_status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')",
            name="vehicle_booking_status_check",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    booking_reference = db.Column(db.String(64), nullable=False, unique=True)
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="RESTRICT"),
        nullable=False,
    )
    buyer_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="RESTRICT"),
        nullable=False,
    )
    seller_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="RESTRICT"),
        nullable=False,
    )
    total_price = db.Column(db.Numeric(14, 2), nullable=False)
    deposit_amount = db.Column(db.Numeric(14, 2), nullable=False)
    remaining_balance = db.Column(db.Numeric(14, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="INR")
    payment_status = db.Column(db.String(32), nullable=False, default="CONFIRMED_DEMO")
    booking_status = db.Column(db.String(32), nullable=False, default="CONFIRMED")
    demo_payment_reference = db.Column(db.String(64), nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class MembershipTransaction(db.Model):
    __tablename__ = "membership_transaction"
    __table_args__ = (
        db.CheckConstraint("amount >= 0", name="membership_transaction_amount_check"),
        db.CheckConstraint(
            "membership_type IN ('BUYER_BASIC', 'BUYER_PREMIUM', 'SELLER_YEARLY')",
            name="membership_transaction_type_check",
        ),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    transaction_reference = db.Column(db.String(64), nullable=False, unique=True)
    customer_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="CASCADE"),
        nullable=False,
    )
    membership_type = db.Column(db.String(32), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="INR")
    status = db.Column(db.String(32), nullable=False, default="CONFIRMED_DEMO")
    payment_method = db.Column(db.String(32), nullable=False, default="UPI_QR_DEMO")
    demo_upi_reference = db.Column(db.String(64), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class BuyerFavourite(db.Model):
    __tablename__ = "buyer_favourite"
    __table_args__ = (
        db.UniqueConstraint("customer_account_id", "listing_id", name="buyer_favourite_unique"),
        {"schema": "marketplace"},
    )

    id = db.Column(db.Integer, primary_key=True)
    customer_account_id = db.Column(
        db.Integer,
        db.ForeignKey("customer_portal.customer_account.id", ondelete="CASCADE"),
        nullable=False,
    )
    listing_id = db.Column(
        db.Integer,
        db.ForeignKey("marketplace.vehicle_listing.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
