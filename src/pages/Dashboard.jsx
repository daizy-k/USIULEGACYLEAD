import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/Adminsidebar";
import { getAllPackets } from "../services/Handoverservice";

const STATUS_MAP = {
  draft: { label: "Not started", className: "danger" },
  pending_admin_review: { label: "Awaiting your review", className: "warning" },
  changes_requested: { label: "Changes requested", className: "warning" },
  pending_incoming_review: { label: "Awaiting incoming leader", className: "warning" },
  complete: { label: "Complete", className: "success" },
};

export default function Dashboard() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllPackets();
        setPackets(data);
      } catch (err) {
        setError("Couldn't load packets: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontSize: "22px" }}>Handover oversight</h1>
            <p className="sub" style={{ marginBottom: 0 }}>All recognized organizations, tracked in one place.</p>
          </div>
        </div>
        <div className="page" style={{ paddingTop: "20px" }}>
          {loading && <div className="loading-state">Loading…</div>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && packets.length === 0 && (
            <div className="empty-state">No handover packets yet — they'll show up here once orgs start one.</div>
          )}
          {!loading && packets.length > 0 && (
            <table>
              <tbody>
                <tr>
                  <th>Organization</th><th>Outgoing leader</th><th>Status</th><th>Last updated</th>
                </tr>
                {packets.map((p) => {
                  const status = STATUS_MAP[p.status] || STATUS_MAP.draft;
                  return (
                    <tr key={p.id} style={{ cursor: "pointer" }}>
                      <td>
                        <Link to={`/dashboard/review/${p.id}`} style={{ color: "inherit", textDecoration: "none", display: "block" }}>
                          {p.orgName}
                        </Link>
                      </td>
                      <td>{p.outgoingLeaderName}</td>
                      <td><span className={`badge ${status.className}`}>{status.label}</span></td>
                      <td>{p.updatedAt?.toDate ? p.updatedAt.toDate().toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}