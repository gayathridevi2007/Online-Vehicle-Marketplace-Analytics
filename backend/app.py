from pathlib import Path

from flask import Flask, abort, jsonify, send_from_directory
from flask_cors import CORS

from config.settings import Config
from extensions import db
from routes.customer_auth import customer_auth_bp
from routes.health import health_bp
from routes.marketplace import marketplace_bp
from routes.vehicles import vehicles_bp
from services.customer_accounts import CustomerAuthError


def create_app(config_overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if config_overrides:
        app.config.update(config_overrides)
    if app.config.get("MAX_CONTENT_LENGTH") is None:
        app.config["MAX_CONTENT_LENGTH"] = 66 * 1024 * 1024
    allowed_origins = list({
        app.config["FRONTEND_ORIGIN"],
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    })
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )
    app.register_blueprint(customer_auth_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(marketplace_bp)
    app.register_blueprint(vehicles_bp)
    from routes.admin import admin_bp
    app.register_blueprint(admin_bp)

    @app.errorhandler(CustomerAuthError)
    def handle_customer_auth_error(error):
        return jsonify({
            "error": {
                "code": error.code,
                "message": error.message,
            }
        }), error.status

    if app.config["SQLALCHEMY_DATABASE_URI"]:
        db.init_app(app)

    _register_frontend(app)

    return app


FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"


def _register_frontend(app):
    """Serve the built React app (production) from the same origin as the API."""
    if not (FRONTEND_DIST / "index.html").is_file():
        return

    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/") or path == "api":
            abort(404)
        candidate = FRONTEND_DIST / path
        if path and candidate.is_file():
            return send_from_directory(FRONTEND_DIST, path)
        # Client-side routes (e.g. /sell-car) fall back to the React entry point.
        return send_from_directory(FRONTEND_DIST, "index.html")
