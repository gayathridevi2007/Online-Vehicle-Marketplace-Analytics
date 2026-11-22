import base64
import io
import unittest

from PIL import Image
from werkzeug.security import generate_password_hash

from app import create_app
from extensions import db
from models.marketplace import (
    MarketplaceModerator,
    MarketplaceTransaction,
    VehicleListing,
    VehicleOwnershipDocument,
)


ORIGIN = "http://localhost:5173"
MODERATOR_EMAIL = "reviewer@example.test"
MODERATOR_PASSWORD = "temporary-review-password"


def image_bytes(color):
    buffer = io.BytesIO()
    Image.new("RGB", (48, 36), color).save(buffer, format="PNG")
    return buffer.getvalue()


class MarketplaceTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "SECRET_KEY": "test-only-marketplace-secret",
            "FRONTEND_ORIGIN": ORIGIN,
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
            "full_name": "Seller Driver",
            "phone_number": "+14155550123",
            "email": email,
            "password": "secure-demo-password",
            "profile_image": f"data:image/png;base64,{photo}",
        }
        response = (
            self.post_json("/api/customer/auth/register", payload)
            if client is None
            else client.post(
                "/api/customer/auth/register",
                json=payload,
                headers={"Origin": ORIGIN},
            )
        )
        self.assertEqual(response.status_code, 201)
        return response.get_json()["account"]

    def listing_form(self, color=(200, 30, 40)):
        return {
            "brand": "Example Motors",
            "model": "Roadster",
            "manufacturing_year": "2022",
            "fuel_type": "Electric",
            "transmission": "Automatic",
            "kilometres_driven": "12000",
            "asking_price": "12500.00",
            "price_currency": "USD",
            "description": "Maintained vehicle with verified service records.",
            "location": "Test town",
            "photos": [
                (io.BytesIO(image_bytes(color)), "front.png"),
                (io.BytesIO(image_bytes((20, 180, 90))), "side.png"),
            ],
            "ownership_documents": [
                (io.BytesIO(b"%PDF-1.4\nOwnership evidence for manual review.\n%%EOF"), "ownership.pdf"),
            ],
        }

    def create_moderator(self):
        with self.app.app_context():
            db.session.add(MarketplaceModerator(
                email=MODERATOR_EMAIL,
                password_hash=generate_password_hash(
                    MODERATOR_PASSWORD,
                    method="scrypt",
                ),
            ))
            db.session.commit()

    def test_listing_submission_approval_buyer_access_and_role_sharing(self):
        self.register_customer()
        created = self.client.post(
            "/api/marketplace/listings",
            data=self.listing_form(),
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(created.status_code, 201)
        listing = created.get_json()["listing"]
        listing_id = listing["id"]
        self.assertEqual(listing["status"], "PENDING_APPROVAL")
        self.assertEqual(listing["seller_verification_status"], "PENDING")
        self.assertEqual(len(listing["photo_ids"]), 2)
        with self.app.app_context():
            self.assertEqual(VehicleOwnershipDocument.query.count(), 1)

        pending_for_seller = self.client.get("/api/marketplace/my-listings")
        self.assertEqual(
            pending_for_seller.get_json()["listings"][0]["status"],
            "PENDING_APPROVAL",
        )
        self.assertEqual(
            self.client.get("/api/marketplace/listings").get_json()["listings"],
            [],
        )
        self.assertEqual(
            self.client.get(
                f"/api/marketplace/listings/{listing_id}"
            ).status_code,
            404,
        )
        self.assertEqual(
            self.client.get(
                f"/api/marketplace/moderation/listings/{listing_id}/documents/1"
            ).status_code,
            401,
        )
        self.assertEqual(
            self.post_json(
                f"/api/marketplace/moderation/listings/{listing_id}/approve",
                {},
            ).status_code,
            401,
        )
        self.assertEqual(
            self.client.get(
                f"/api/marketplace/listings/{listing_id}/photos/{listing['photo_ids'][0]}"
            ).status_code,
            200,
        )

        self.create_moderator()
        login = self.post_json("/api/marketplace/moderation/login", {
            "email": MODERATOR_EMAIL,
            "password": MODERATOR_PASSWORD,
        })
        self.assertEqual(login.status_code, 200)
        pending = self.client.get("/api/marketplace/moderation/listings/pending")
        self.assertEqual(len(pending.get_json()["listings"]), 1)
        pending_listing = pending.get_json()["listings"][0]
        self.assertEqual(pending_listing["seller_verification_status"], "PENDING")
        self.assertEqual(len(pending_listing["ownership_document_ids"]), 1)
        self.assertEqual(
            pending_listing["seller"]["email"],
            "seller@example.test",
        )
        document = self.client.get(
            f"/api/marketplace/moderation/listings/{listing_id}/documents/"
            f"{pending_listing['ownership_document_ids'][0]}"
        )
        self.assertEqual(document.status_code, 200)
        self.assertEqual(document.mimetype, "application/pdf")
        self.assertIn("attachment", document.headers["Content-Disposition"])
        self.assertEqual(
            self.post_json(
                f"/api/marketplace/moderation/listings/{listing_id}/approve",
                {},
            ).status_code,
            409,
        )
        verified = self.post_json(
            f"/api/marketplace/moderation/listings/{listing_id}/verify-seller",
            {"note": "Ownership document reviewed manually."},
        )
        self.assertEqual(
            verified.get_json()["listing"]["seller_verification_status"],
            "VERIFIED",
        )
        approved = self.post_json(
            f"/api/marketplace/moderation/listings/{listing_id}/approve",
            {"note": "Photos and listing details reviewed."},
        )
        self.assertEqual(approved.status_code, 200)
        self.assertEqual(
            approved.get_json()["listing"]["status"],
            "APPROVED_ACTIVE",
        )

        self.client.post(
            "/api/marketplace/moderation/logout",
            json={},
            headers={"Origin": ORIGIN},
        )
        self.post_json("/api/customer/auth/login", {
            "email": "seller@example.test",
            "password": "secure-demo-password",
        })
        visible = self.client.get("/api/marketplace/listings").get_json()
        self.assertEqual(len(visible["listings"]), 1)
        details = self.client.get(
            f"/api/marketplace/listings/{listing_id}"
        ).get_json()["listing"]
        self.assertEqual(details["seller"]["email"], "seller@example.test")
        self.assertEqual(details["seller"]["phone"], "+14155550123")
        self.assertEqual(len(details["photo_ids"]), 2)
        self.assertEqual(
            self.client.get("/api/marketplace/roles").get_json()["roles"],
            ["BUYER", "SELLER"],
        )
        own_purchase = self.client.post(
            f"/api/marketplace/listings/{listing_id}/purchase",
            json={},
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(own_purchase.status_code, 403)

        photo_response = self.client.get(
            f"/api/marketplace/listings/{listing_id}/photos/{listing['photo_ids'][0]}"
        )
        self.assertEqual(photo_response.status_code, 200)
        self.assertEqual(photo_response.mimetype, "image/png")
        self.assertEqual(photo_response.headers["X-Content-Type-Options"], "nosniff")

        buyer_client = self.app.test_client()
        self.register_customer("buyer@example.test", client=buyer_client)
        foreign_update = buyer_client.put(
            f"/api/marketplace/my-listings/{listing_id}",
            data=self.listing_form(),
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(foreign_update.status_code, 404)
        purchase = buyer_client.post(
            f"/api/marketplace/listings/{listing_id}/purchase",
            json={},
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(purchase.status_code, 201)
        transaction = purchase.get_json()["transaction"]
        self.assertFalse(transaction["real_payment"])
        self.assertEqual(transaction["buyer"], "buyer@example.test")
        self.assertEqual(transaction["seller"], "seller@example.test")
        self.assertEqual(transaction["amount"], "12500.00")
        self.assertEqual(transaction["price_currency"], "USD")
        self.assertEqual(transaction["status"], "SIMULATED_SUCCESS")
        self.assertIn("does not confirm a sale", purchase.get_json()["payment"]["message"])
        self.assertEqual(
            purchase.get_json()["payment"]["real_payment"],
            False,
        )
        purchase_history = buyer_client.get("/api/marketplace/my-purchases")
        self.assertEqual(purchase_history.status_code, 200)
        self.assertEqual(
            purchase_history.get_json()["purchases"][0]["transaction_id"],
            transaction["transaction_id"],
        )
        self.assertEqual(
            buyer_client.get("/api/marketplace/listings").get_json()["listings"],
            [],
        )
        seller_listing = self.client.get(
            "/api/marketplace/my-listings"
        ).get_json()["listings"][0]
        self.assertEqual(seller_listing["status"], "SIMULATED_PURCHASE")
        self.client.post(
            "/api/marketplace/moderation/login",
            json={"email": MODERATOR_EMAIL, "password": MODERATOR_PASSWORD},
            headers={"Origin": ORIGIN},
        )
        notifications = self.client.get("/api/marketplace/moderation/transactions")
        self.assertEqual(len(notifications.get_json()["transactions"]), 1)
        self.assertEqual(
            notifications.get_json()["transactions"][0]["transaction_id"],
            transaction["transaction_id"],
        )
        with self.app.app_context():
            self.assertEqual(MarketplaceTransaction.query.count(), 1)

    def test_marketplace_requires_login_and_rejects_non_image_upload(self):
        self.assertEqual(
            self.client.get("/api/marketplace/listings").status_code,
            401,
        )
        self.assertEqual(
            self.client.get("/api/marketplace/my-purchases").status_code,
            401,
        )
        self.assertEqual(
            self.client.post(
                "/api/marketplace/listings/1/purchase",
                json={},
                headers={"Origin": ORIGIN},
            ).status_code,
            401,
        )
        self.register_customer()
        invalid_form = self.listing_form()
        invalid_form["photos"] = [
            (io.BytesIO(b"not an image"), "car.png"),
            (io.BytesIO(image_bytes((20, 30, 40))), "second.png"),
        ]
        response = self.client.post(
            "/api/marketplace/listings",
            data=invalid_form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"]["code"],
            "invalid_photo",
        )
        with self.app.app_context():
            self.assertEqual(VehicleListing.query.count(), 0)

    def test_photo_and_ownership_document_size_limits(self):
        self.register_customer()
        too_large = b"x" * (5 * 1024 * 1024 + 1)
        form = self.listing_form()
        form["photos"] = [
            (io.BytesIO(too_large), "large.png"),
            (io.BytesIO(image_bytes((10, 20, 30))), "second.png"),
        ]
        response = self.client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "invalid_photo")

        form = self.listing_form()
        form["ownership_documents"] = [
            (io.BytesIO(too_large), "large.pdf")
        ]
        response = self.client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"]["code"],
            "invalid_ownership_document",
        )
        with self.app.app_context():
            self.assertEqual(VehicleListing.query.count(), 0)

    def test_seller_must_upload_multiple_photos_and_ownership_document(self):
        self.register_customer()
        form = self.listing_form()
        form["photos"] = [
            (io.BytesIO(image_bytes((10, 20, 30))), "only-one.png")
        ]
        response = self.client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"]["code"], "photos_required")

        form = self.listing_form()
        form["ownership_documents"] = [
            (io.BytesIO(b"not a supported document"), "ownership.pdf")
        ]
        response = self.client.post(
            "/api/marketplace/listings",
            data=form,
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"]["code"],
            "invalid_ownership_document",
        )
        with self.app.app_context():
            self.assertEqual(VehicleListing.query.count(), 0)

    def test_price_filters_require_currency_and_seller_can_withdraw(self):
        self.register_customer()
        created = self.client.post(
            "/api/marketplace/listings",
            data=self.listing_form(),
            content_type="multipart/form-data",
            headers={"Origin": ORIGIN},
        )
        listing_id = created.get_json()["listing"]["id"]
        bad_filter = self.client.get(
            "/api/marketplace/listings?min_price=1000"
        )
        self.assertEqual(bad_filter.status_code, 400)

        withdrawn = self.client.post(
            f"/api/marketplace/my-listings/{listing_id}/withdraw",
            json={},
            headers={"Origin": ORIGIN},
        )
        self.assertEqual(withdrawn.status_code, 200)
        self.assertEqual(
            withdrawn.get_json()["listing"]["status"],
            "WITHDRAWN",
        )
        self.assertEqual(
            self.client.get("/api/marketplace/listings").get_json()["listings"],
            [],
        )


if __name__ == "__main__":
    unittest.main()
