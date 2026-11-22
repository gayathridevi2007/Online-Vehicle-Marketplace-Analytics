import base64
import io
import unittest
from decimal import Decimal
from PIL import Image

from app import create_app
from extensions import db
from models.customer_account import CustomerAccount
from models.marketplace import (
    MarketplaceModerator,
    VehicleListing,
    VehicleBooking,
    MembershipTransaction,
    ModerationAuditLog,
)

ORIGIN = "http://localhost:5173"
MODERATOR_EMAIL = "reviewer@example.test"
MODERATOR_PASSWORD = "temporary-review-password"


def image_bytes(color):
    buffer = io.BytesIO()
    Image.new("RGB", (48, 36), color).save(buffer, format="PNG")
    return buffer.getvalue()


class UpgradedFeaturesTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "SECRET_KEY": "test-only-marketplace-secret",
            "FRONTEND_ORIGIN": ORIGIN,
            "SELLER_MEMBERSHIP_ANNUAL_PRICE": 1499,
            "BUYER_BASIC_ANNUAL_PRICE": 99,
            "BUYER_PREMIUM_ANNUAL_PRICE": 999,
        })
        with self.app.app_context():
            db.engine.update_execution_options(
                schema_translate_map={
                    "customer_portal": None,
                    "marketplace": None,
                }
            )
            db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def post_json(self, path, payload):
        return self.client.post(
            path,
            json=payload,
            headers={"Origin": ORIGIN},
        )

    def register_customer(self, email="seller@example.test", client=None):
        photo = base64.b64encode(image_bytes((30, 120, 200))).decode("ascii")
        payload = {
            "full_name": "Test Driver",
            "phone_number": "+919876543210",
            "email": email,
            "password": "secure-demo-password",
            "profile_image": f"data:image/png;base64,{photo}",
        }
        target = self.client if client is None else client
        res = target.post("/api/customer/auth/register", json=payload, headers={"Origin": ORIGIN})
        self.assertEqual(res.status_code, 201)
        return res.get_json()["account"]

    def create_moderator(self):
        from werkzeug.security import generate_password_hash
        with self.app.app_context():
            mod = MarketplaceModerator(
                email=MODERATOR_EMAIL,
                password_hash=generate_password_hash(MODERATOR_PASSWORD),
                is_active=True
            )
            db.session.add(mod)
            db.session.commit()

    def listing_form(self):
        return {
            "brand": "Maruti Suzuki",
            "model": "Swift",
            "manufacturing_year": "2021",
            "fuel_type": "Petrol",
            "transmission": "Manual",
            "kilometres_driven": "25000",
            "asking_price": "600000.00",
            "price_currency": "INR",
            "location": "Bangalore",
            "description": "Spotless vehicle with complete service history.",
            "photos": [
                (io.BytesIO(image_bytes((10, 20, 30))), "front.png"),
                (io.BytesIO(image_bytes((40, 50, 60))), "side.png"),
            ],
            "ownership_documents": [
                (io.BytesIO(b"%PDF-1.4\nOwnership evidence for manual review.\n%%EOF"), "ownership.pdf"),
            ],
        }

    def test_auto_publishing_when_eligible(self):
        self.register_customer("seller_auto@test.com")
        form = self.listing_form()
        form["auto_publish"] = "true"
        res = self.client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(res.status_code, 201)
        listing = res.get_json()["listing"]
        self.assertEqual(listing["status"], "APPROVED_ACTIVE")
        self.assertEqual(listing["seller_verification_status"], "VERIFIED")

    def test_membership_purchase_and_benefits(self):
        self.register_customer("buyer_tier@test.com")
        status_res = self.client.get("/api/marketplace/memberships/status")
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.get_json()["buyer_tier"], "FREE")

        buy_res = self.post_json("/api/marketplace/memberships/purchase", {"membership_type": "BUYER_BASIC"})
        self.assertEqual(buy_res.status_code, 200)
        self.assertEqual(buy_res.get_json()["account"]["buyer_tier"], "BASIC")

        buy_prem = self.post_json("/api/marketplace/memberships/purchase", {"membership_type": "BUYER_PREMIUM"})
        self.assertEqual(buy_prem.status_code, 200)
        self.assertEqual(buy_prem.get_json()["account"]["buyer_tier"], "PREMIUM")

        seller_mem = self.post_json("/api/marketplace/memberships/purchase", {"membership_type": "SELLER_YEARLY"})
        self.assertEqual(seller_mem.status_code, 200)
        self.assertEqual(seller_mem.get_json()["account"]["seller_membership_status"], "ACTIVE")

    def test_vehicle_booking_50_percent_deposit(self):
        seller_client = self.app.test_client()
        self.register_customer("seller_bk@test.com", client=seller_client)
        form = self.listing_form()
        form["auto_publish"] = "true"
        create_res = seller_client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(create_res.status_code, 201)
        listing_id = create_res.get_json()["listing"]["id"]

        buyer_client = self.app.test_client()
        self.register_customer("buyer_bk@test.com", client=buyer_client)

        book_res = buyer_client.post(
            "/api/marketplace/bookings",
            json={"listing_id": listing_id},
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(book_res.status_code, 201)
        booking = book_res.get_json()["booking"]
        self.assertEqual(Decimal(booking["total_price"]), Decimal("600000.00"))
        self.assertEqual(Decimal(booking["deposit_amount"]), Decimal("300000.00"))
        self.assertEqual(Decimal(booking["remaining_balance"]), Decimal("300000.00"))
        self.assertEqual(booking["payment_status"], "CONFIRMED_DEMO")
        self.assertIn("DEMO PAYMENT", booking["notice"])

        # Prevent duplicate booking
        dup_res = buyer_client.post(
            "/api/marketplace/bookings",
            json={"listing_id": listing_id},
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(dup_res.status_code, 409)

    def test_moderation_flag_suspend_reinstate(self):
        seller_client = self.app.test_client()
        self.register_customer("seller_mod@test.com", client=seller_client)
        form = self.listing_form()
        form["auto_publish"] = "true"
        create_res = seller_client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        listing_id = create_res.get_json()["listing"]["id"]

        self.create_moderator()
        mod_client = self.app.test_client()
        mod_client.post("/api/marketplace/moderation/login", json={
            "email": MODERATOR_EMAIL,
            "password": MODERATOR_PASSWORD
        }, headers={"Origin": ORIGIN})

        # Flag listing
        flag_res = mod_client.post(
            f"/api/marketplace/moderation/listings/{listing_id}/flag",
            json={"reason": "Suspicious price reported by community."},
            headers={"Origin": ORIGIN}
        )
        self.assertEqual(flag_res.status_code, 200)
        self.assertTrue(flag_res.get_json()["listing"]["is_flagged"])

        # Suspend listing without reason must fail
        bad_sus = mod_client.post(
            f"/api/marketplace/moderation/listings/{listing_id}/suspend",
            json={"reason": ""},
            headers={"Origin": ORIGIN}
        )
        self.assertEqual(bad_sus.status_code, 400)

        # Suspend listing with valid reason
        sus_res = mod_client.post(
            f"/api/marketplace/moderation/listings/{listing_id}/suspend",
            json={"reason": "Odometer discrepancy detected on document verification."},
            headers={"Origin": ORIGIN}
        )
        self.assertEqual(sus_res.status_code, 200)
        self.assertEqual(sus_res.get_json()["listing"]["status"], "SUSPENDED")

        # Reinstate listing
        rein_res = mod_client.post(
            f"/api/marketplace/moderation/listings/{listing_id}/reinstate",
            json={"note": "Seller provided updated service log resolving discrepancy."},
            headers={"Origin": ORIGIN}
        )
        self.assertEqual(rein_res.status_code, 200)
        self.assertEqual(rein_res.get_json()["listing"]["status"], "APPROVED_ACTIVE")

        # Verify audit logs
        audit_res = mod_client.get("/api/marketplace/moderation/audit-logs")
        self.assertEqual(audit_res.status_code, 200)
        actions = [a["action"] for a in audit_res.get_json()["audit_logs"]]
        self.assertIn("FLAG", actions)
        self.assertIn("SUSPEND", actions)
        self.assertIn("REINSTATE", actions)


if __name__ == "__main__":
    unittest.main()
