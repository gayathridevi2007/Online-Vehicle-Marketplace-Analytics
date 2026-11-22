from flask import Flask, jsonify
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

    return app
