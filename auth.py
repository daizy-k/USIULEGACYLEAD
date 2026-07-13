from functools import wraps

from flask import jsonify, request
from firebase_admin import auth as firebase_auth

ALLOWED_EMAIL_DOMAIN = "usiu.ac.ke"


def verify_request_token():
    """Extracts and verifies the Firebase ID token from the Authorization header.

    Returns the decoded token dict, or None if verification fails.
    """
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None

    id_token = header.split("Bearer ", 1)[1].strip()

    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception:
        return None

    email = decoded.get("email", "")
    if not email.endswith(f"@{ALLOWED_EMAIL_DOMAIN}"):
        return None

    return decoded


def require_auth(view_func):
    """Decorator that blocks the request unless a valid USIU-scoped token is present."""

    @wraps(view_func)
    def wrapped(*args, **kwargs):
        decoded_token = verify_request_token()
        if decoded_token is None:
            return jsonify({"error": "Unauthorized"}), 401

        request.user = decoded_token
        return view_func(*args, **kwargs)

    return wrapped
