import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { getPacket, adminApprovePacket, adminRequestChanges } from "../services/Handoverservice";

export default function AdminReview() {
  const { packetId } = useParams();
  const navigate = useNavigate();
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await getPacket(packetId);
    setPacket(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [packetId]);

  async function handleApprove() {
    setBusy(true);
    try {
      await adminApprovePacket(packetId);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestChanges() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await adminRequestChanges(packetId, note.trim());
      setNote("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main"><div className="loading-state">Loading…</div></div>
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main"><div className="empty-state">Packet not found.</div></div>
      </div>
    );
  }

  const canDecide = packet.status === "pending_admin_review";

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontSize: "22px" }}>{packet.orgName}</h1>
            <p className="sub" style={{ marginBottom: 0 }}>Submitted by {packet.outgoingLeaderName}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/dashboard")}>← Back to overview</button>
        </div>
        <div className="page" style={{ paddingTop: "20px", maxWidth: "720px" }}>
          <div className="form-section">
            <div className="label">📍 Year in review</div>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>{packet.yearInReview || "—"}</p>
          </div>
          <div className="form-section">
            <div className="label">📋 Ongoing projects</div>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>{packet.ongoingProjects || "—"}</p>
          </div>
          <div className="form-section">
            <div className="label">📇 Key contacts</div>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>{packet.keyContacts || "—"}</p>
          </div>

          {packet.documents?.length > 0 && (
            <div className="form-section">
              <div className="label">📎 Documents</div>
              <ul className="doc-list">
                {packet.documents.map((doc) => (
                  <li key={doc.publicId}>
                    <a href={doc.url} target="_blank" rel="noreferrer">{doc.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canDecide ? (
            <>
              <div className="form-section">
                <div className="label">Feedback (required if requesting changes)</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What needs to change before this can go to the incoming leader?"
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={handleRequestChanges} disabled={busy || !note.trim()}>
                  Request changes
                </button>
                <button className="btn btn-primary" onClick={handleApprove} disabled={busy}>
                  {busy ? "Approving…" : "Approve"}
                </button>
              </div>
            </>
          ) : (
            <p className="badge success">Status: {packet.status.replace(/_/g, " ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}