import unittest

from app import create_app


class VehicleApiTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI=None,
        )
        self.client = self.app.test_client()

    def test_health_is_available_without_database(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"status": "ok"})

    def test_analytics_endpoints_report_missing_database(self):
        paths = (
            "/api/vehicles/summary",
            "/api/vehicles/brands",
            "/api/vehicles/fuel-types",
            "/api/vehicles/price-analysis",
            "/api/vehicles/records",
        )
        for path in paths:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 503)
                self.assertEqual(
                    response.get_json()["error"]["code"],
                    "database_not_configured",
                )
                self.assertIn("DATABASE_URL", response.get_json()["error"]["message"])

    def test_customer_catalogue_requires_authentication(self):
        response = self.client.get("/api/vehicles/customer-catalogue")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.get_json()["error"]["code"],
            "authentication_required",
        )

    def test_records_reject_invalid_pagination_and_year_ranges(self):
        invalid_queries = (
            "page=0",
            "per_page=101",
            "year_from=2025&year_to=2020",
            "year_from=not-a-year",
        )
        for query in invalid_queries:
            with self.subTest(query=query):
                response = self.client.get(f"/api/vehicles/records?{query}")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(
                    response.get_json()["error"]["code"],
                    "invalid_parameter",
                )

    def test_records_reject_unknown_filters(self):
        response = self.client.get("/api/vehicles/records?raw_sql=1")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"]["code"],
            "invalid_parameter",
        )

if __name__ == "__main__":
    unittest.main()
