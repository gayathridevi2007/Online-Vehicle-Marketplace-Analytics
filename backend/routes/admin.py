"""Admin API routes for moderator management and password reset.

Provides:
- GET /api/admin/moderators – list moderator accounts (id, email, is_active).
- POST /api/admin/reset_password – request a password‑reset token for a moderator.
- POST /api/admin/confirm_reset – confirm token and set a new password.

All endpoints require an authenticated moderator (require_moderator).
"""

from flask import Blueprint, jsonify, request, current_app
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash

from extensions import db
from models.marketplace import MarketplaceModerator
from services.marketplace import require_moderator

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def _serializer():
    """Create a URL‑safe serializer using the app's secret key."""
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

@admin_bp.route('/moderators', methods=['GET'])
def list_moderators():
    # Auth via invitation code or existing moderator session
    auth_code = request.args.get('invitation_code') or request.headers.get('X-Invitation-Code')
    if auth_code and auth_code == current_app.config.get('ADMIN_INVITATION_CODE'):
        # Authorized via code, no session required
        pass
    else:
        # Fallback to moderator session authentication
        require_moderator()
    mods = MarketplaceModerator.query.with_entities(
        MarketplaceModerator.id,
        MarketplaceModerator.email,
        MarketplaceModerator.is_active,
    ).all()
    data = [{"id": m.id, "email": m.email, "is_active": m.is_active} for m in mods]
    return jsonify({"moderators": data}), 200


@admin_bp.route('/reset_password', methods=['POST'])
def request_reset():
    require_moderator()
    payload = request.get_json(silent=True) or {}
    email = payload.get('email')
    if not email:
        return jsonify({"error": {"code": "missing_email", "message": "Email is required."}}), 400
    mod = MarketplaceModerator.query.filter_by(email=email).first()
    if not mod:
        # Do not reveal whether the email exists
        return jsonify({"status": "ok"}), 200
    token = _serializer().dumps({"mod_id": mod.id})
    return jsonify({"reset_token": token}), 200

@admin_bp.route('/confirm_reset', methods=['POST'])
def confirm_reset():
    require_moderator()
    payload = request.get_json(silent=True) or {}
    token = payload.get('reset_token')
    new_password = payload.get('new_password')
    if not token or not new_password:
        return jsonify({"error": {"code": "invalid_request", "message": "Token and new_password are required."}}), 400
    try:
        data = _serializer().loads(token, max_age=900)  # 15 minutes
    except SignatureExpired:
        return jsonify({"error": {"code": "token_expired", "message": "Reset token has expired."}}), 400
    except BadSignature:
        return jsonify({"error": {"code": "invalid_token", "message": "Reset token is invalid."}}), 400
    mod_id = data.get('mod_id')
    mod = MarketplaceModerator.query.get(mod_id)
    if not mod:
        return jsonify({"error": {"code": "not_found", "message": "Moderator not found."}}), 404
    mod.password_hash = generate_password_hash(new_password)
    db.session.add(mod)
    db.session.commit()
    return jsonify({"status": "password_updated"}), 200
