import base64
import unittest

from sqlalchemy import text
from werkzeug.security import check_password_hash

from app import create_app
from extensions import db
from models.customer_account import CustomerAccount


ORIGIN = "http://localhost:5173"
PROFILE_PNG = (
    "data:image/png;base64,"
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII="
)


class CustomerAuthTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",
            "SECRET_KEY": "test-only-customer-secret",
            "FRONTEND_ORIGIN": ORIGIN,
        })
        with self.app.app_context():
            db.session.execute(text("ATTACH DATABASE ':memory:' AS customer_portal"))
            db.session.execute(text("ATTACH DATABASE ':memory:' AS marketplace"))
            db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def post(self, path, payload):
        return self.client.post(
            path,
            json=payload,
            headers={"Origin": ORIGIN},
        )

    def registration(self, email="driver@example.test"):
        return {
            "full_name": "Avery Driver",
            "phone_number": "+14155550123",
            "email": email,
            "password": "secure-demo-password",
            "profile_image": PROFILE_PNG,
        }

    def test_registration_login_and_logout_persist_profile_without_password(self):
        response = self.post(
            "/api/customer/auth/register",
            self.registration(),
        )

        self.assertEqual(response.status_code, 201)
        account = response.get_json()["account"]
        self.assertEqual(account["email"], "driver@example.test")
        self.assertEqual(account["account_status"], "free")
        self.assertTrue(account["profile_image"].startswith("data:image/png;base64,"))
        self.assertEqual(self.client.get("/api/customer/auth/me").get_json()["account"], account)

        with self.app.app_context():
            stored = db.session.query(CustomerAccount).filter_by(
                email="driver@example.test"
            ).one()
            self.assertTrue(check_password_hash(stored.password_hash, "secure-demo-password"))
            self.assertNotEqual(stored.password_hash, "secure-demo-password")

        self.assertEqual(
            self.client.get("/api/vehicles/customer-catalogue").status_code,
            403,
        )
        self.assertEqual(
            self.post("/api/customer/auth/logout", {}).status_code,
            200,
        )
        self.assertIsNone(self.client.get("/api/customer/auth/me").get_json()["account"])

        bad_login = self.post("/api/customer/auth/login", {
            "email": "driver@example.test",
            "password": "wrong-password",
        })
        self.assertEqual(bad_login.status_code, 401)
        login = self.post("/api/customer/auth/login", {
            "email": "DRIVER@example.test",
            "password": "secure-demo-password",
        })
        self.assertEqual(login.status_code, 200)
        self.assertEqual(
            login.get_json()["account"]["full_name"],
            "Avery Driver",
        )

    def test_registration_rejects_bad_image_and_duplicate_email(self):
        invalid = self.registration()
        invalid["profile_image"] = "data:image/png;base64,ZmFrZQ=="
        response = self.post("/api/customer/auth/register", invalid)
        self.assertEqual(response.status_code, 400)

        self.assertEqual(
            self.post("/api/customer/auth/register", self.registration()).status_code,
            201,
        )
        duplicate = self.post("/api/customer/auth/register", self.registration())
        self.assertEqual(duplicate.status_code, 409)

    def test_demo_upgrade_changes_persisted_status_without_payment_data(self):
        registration = self.post(
            "/api/customer/auth/register",
            self.registration(),
        )
        self.assertEqual(registration.status_code, 201)

        response = self.post("/api/customer/auth/premium/confirm", {
            "plan": "yearly",
            "payment_method": "upi",
            "payment_handle": "demo@upi",
        })
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["account"]["account_status"], "premium")
        self.assertEqual(payload["account"]["premium_plan"], "yearly")
        self.assertFalse(payload["payment"]["real_payment"])
        self.assertEqual(payload["payment"]["amount_inr"], 999)
        self.assertNotIn("demo@upi", str(payload))
        invalid_year = self.client.get(
            "/api/vehicles/customer-catalogue?year=not-a-year"
        )
        unknown_filter = self.client.get(
            "/api/vehicles/customer-catalogue?sort=price"
        )
        self.assertEqual(invalid_year.status_code, 400)
        self.assertEqual(unknown_filter.status_code, 400)

        with self.app.app_context():
            stored = db.session.query(CustomerAccount).filter_by(
                email="driver@example.test"
            ).one()
            self.assertEqual(stored.account_status, "premium")
            self.assertEqual(stored.premium_plan, "yearly")
            self.assertNotIn("payment_handle", CustomerAccount.__table__.columns)

    def test_mutations_reject_unapproved_origins(self):
        response = self.client.post(
            "/api/customer/auth/logout",
            json={},
            headers={"Origin": "https://untrusted.example"},
        )

        self.assertEqual(response.status_code, 403)


if __name__ == "__main__":
    unittest.main()
