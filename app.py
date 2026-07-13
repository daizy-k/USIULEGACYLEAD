import os

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from utils.auth import require_auth
from utils.pdf_generator import build_packet_pdf

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
FIREBASE_CREDENTIALS_PATH = os.environ.get(
    "FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json"
)

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = Flask(__name__)
CORS(app, origins=[FRONTEND_ORIGIN])


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/reports/packet/<club_id>/<packet_id>")
@require_auth
def generate_packet_report(club_id, packet_id):
    requester_uid = request.user["uid"]

    user_snapshot = db.collection("users").document(requester_uid).get()
    if not user_snapshot.exists:
        return jsonify({"error": "User profile not found"}), 404

    user_data = user_snapshot.to_dict()
    if user_data.get("club_id") != club_id:
        return jsonify({"error": "Forbidden"}), 403

    packet_ref = (
        db.collection("clubs")
        .document(club_id)
        .collection("packets")
        .document(packet_id)
    )
    packet_snapshot = packet_ref.get()
    if not packet_snapshot.exists:
        return jsonify({"error": "Packet not found"}), 404

    packet_data = packet_snapshot.to_dict()
    pdf_buffer = build_packet_pdf(packet_data)

    filename = f"{packet_data.get('role_title', 'handover-packet')}.pdf".replace(" ", "-")

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
