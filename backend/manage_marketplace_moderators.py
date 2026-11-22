import argparse
import getpass
import re
import sys

from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash

from app import create_app
from extensions import db
from models.marketplace import MarketplaceModerator


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def create_moderator(email, password=None):
    email = email.strip().lower()
    if len(email) > 254 or not EMAIL_PATTERN.fullmatch(email):
        raise ValueError("Enter a valid moderator email address.")
    if not db.session.get_bind():
        raise RuntimeError("PostgreSQL is not configured.")

    if not password:
        password = getpass.getpass("New moderator password (minimum 14 characters): ")
        confirmation = getpass.getpass("Confirm moderator password: ")
        if password != confirmation:
            raise ValueError("The password entries do not match.")
    if not 14 <= len(password) <= 128:
        raise ValueError("Moderator passwords must be 14 to 128 characters.")

    existing = MarketplaceModerator.query.filter_by(email=email).first()
    if existing:
        existing.password_hash = generate_password_hash(password, method="scrypt")
        existing.is_active = True
        try:
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise
        print(f"Marketplace moderator updated for {email}.")
        return

    moderator = MarketplaceModerator(
        email=email,
        password_hash=generate_password_hash(password, method="scrypt"),
    )
    db.session.add(moderator)
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        raise
    print(f"Marketplace moderator created for {email}.")


def list_moderators():
    if not db.session.get_bind():
        raise RuntimeError("PostgreSQL is not configured.")
    moderators = MarketplaceModerator.query.order_by(MarketplaceModerator.created_at).all()
    if not moderators:
        print("No marketplace moderators provisioned.")
        return
    print(f"{'ID':<4} {'Email':<35} {'Active':<8} {'Created At'}")
    print("-" * 65)
    for mod in moderators:
        print(f"{mod.id:<4} {mod.email:<35} {str(mod.is_active):<8} {mod.created_at}")


def main():
    parser = argparse.ArgumentParser(
        description="Provision a separate marketplace listing moderator."
    )
    parser.add_argument("action", choices=("create", "list"))
    parser.add_argument("--email", help="Moderator email; prompted if omitted.")
    parser.add_argument("--password", help="Moderator password; prompted if omitted.")
    args = parser.parse_args()

    app = create_app()
    with app.app_context():
        if not app.config.get("SQLALCHEMY_DATABASE_URI"):
            parser.error("Set DATABASE_URL in backend/.env before provisioning.")
        if args.action == "list":
            list_moderators()
        elif args.action == "create":
            email = args.email or input("Moderator email: ")
            try:
                create_moderator(email, password=args.password)
            except (ValueError, RuntimeError) as error:
                print(str(error), file=sys.stderr)
                return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
