import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getNotifications, markAsRead, markAllAsRead } from "../services/NotificationService";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const TYPE_LABELS = {
  deadline_reminder: "⏰",
  packet_approved: "✅",
  changes_requested: "🛎️",
  packet_submitted: "📤",
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await getNotifications(user.uid);
    setNotifications(data);
    setLoading(false);
  }
   
 useEffect(() => {
   // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
  if (user) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);


  async function handleMarkRead(notificationId) {
    await markAsRead(user.uid, notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    await markAllAsRead(user.uid, notifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="content">
      <div className="page" style={{ maxWidth: "640px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Notifications</h1>
            <p className="sub">Handover deadline reminders and updates.</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">Nothing here yet — you're all caught up.</div>
        ) : (
          notifications.map((n) => (
            <div
              className="form-section"
              key={n.id}
              style={{
                borderColor: n.read ? "var(--border)" : "var(--gold)",
                background: n.read ? "var(--card)" : "var(--warning-bg)",
                cursor: n.read ? "default" : "pointer",
              }}
              onClick={() => !n.read && handleMarkRead(n.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontSize: "14px" }}>
                  <span style={{ marginRight: "8px" }}>{TYPE_LABELS[n.type] || "🔔"}</span>
                  {n.message}
                </p>
                <span className="mono" style={{ fontSize: "11px", color: "var(--text-2)", whiteSpace: "nowrap", marginLeft: "12px" }}>
                  {formatDate(n.createdAt)}
                </span>
              </div>
              {n.relatedPacketId && (
                <Link
                  to={`/review/${n.relatedPacketId}`}
                  style={{ fontSize: "12px", color: "var(--navy)", fontWeight: 600 }}
                >
                  View packet →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}