import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import make_url

backend_env = Path(__file__).resolve().parent.parent / ".env"
if backend_env.is_file():
    load_dotenv(backend_env)
else:
    load_dotenv()

database_url = os.getenv("DATABASE_URL") or None
if database_url:
    parsed_database_url = make_url(database_url)
    if parsed_database_url.drivername == "postgresql":
        database_url = parsed_database_url.set(
            drivername="postgresql+psycopg2",
        ).render_as_string(hide_password=False)


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY") or None
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    ADMIN_INVITATION_CODE = os.getenv("ADMIN_INVITATION_CODE", "VMA-ADMIN-2026-STAFF")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    SELLER_MEMBERSHIP_ANNUAL_PRICE = int(os.getenv("SELLER_MEMBERSHIP_ANNUAL_PRICE", "1499"))
    BUYER_BASIC_ANNUAL_PRICE = int(os.getenv("BUYER_BASIC_ANNUAL_PRICE", "99"))
    BUYER_PREMIUM_ANNUAL_PRICE = int(os.getenv("BUYER_PREMIUM_ANNUAL_PRICE", "999"))
    PERMANENT_SESSION_LIFETIME = timedelta(days=30)
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
