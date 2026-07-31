import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPacket, addComment, acceptPacket } from "../services/HandoverService";

export default function Review() {
  const { packetId } = useParams();
  const { user } = useAuth();
  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [accepting, setAccepting] = useState(false);

  async function load() {
    const data = await getPacket(packetId);
    setPacket(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [packetId]);

  async function handlePostComment() {
    if (!commentText.trim() || !user) return;
    setPosting(true);
    try {
      await addComment(packetId, {
        authorId: user.uid,
        authorName: user.displayName || user.email,
        text: commentText.trim(),
      });
      setCommentText("");
      await load();
    } finally {
      setPosting(false);
    }
  }

  async function handleAccept() {
    const hasOpenComments = (packet?.comments?.length || 0) > 0;
    if (hasOpenComments) {
      const confirmed = window.confirm(
        "There are comments on this packet — accept anyway and leave them unresolved?"
      );
      if (!confirmed) return;
    }
    setAccepting(true);
    try {
      await acceptPacket(packetId);
      await load();
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="content">
        <div className="loading-state">Loading packet…</div>
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="content">
        <div className="empty-state">Packet not found.</div>
      </div>
    );
  }

  return (
    <div className="content">
        <div className="page" style={{ paddingBottom: 0 }}>
          <span className="mono" style={{ color: "var(--text-2)", fontSize: "12px" }}>
            {(packet.orgName || "ORG").toUpperCase()} / REVIEW PACKET
          </span>
          <h1 style={{ marginTop: "6px" }}>Review handover packet</h1>
          <p className="sub">
            Submitted by {packet.outgoingLeaderName} ·{" "}
            <span className={`badge ${packet.status === "complete" ? "success" : "warning"}`}>
              {packet.status === "complete" ? "Accepted" : "Pending review"}
            </span>
          </p>
        </div>
        <div className="review-layout">
          <div>
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

            <h3 style={{ fontSize: "14px", margin: "20px 0 10px" }}>Comments</h3>
            {(packet.comments || []).length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--text-2)" }}>No comments yet.</p>
            )}
            {(packet.comments || []).map((c, i) => (
              <div className="comment" key={i}>
                <div className="who">{c.authorName}</div>
                {c.text}
              </div>
            ))}
            <div className="comment-input">
              <input
                type="text"
                placeholder="Ask a follow-up question…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
              />
              <button className="btn btn-secondary" onClick={handlePostComment} disabled={posting}>
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          <div>
            <div className="accept-box">
              <h3 style={{ fontSize: "15px", marginBottom: "8px" }}>Accept this handover</h3>
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>
                Confirming means you've reviewed the packet and are ready to take on the role.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={handleAccept}
                disabled={accepting || packet.status === "complete"}
              >
                {packet.status === "complete" ? "Accepted ✓" : accepting ? "Accepting…" : "Accept handover"}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}