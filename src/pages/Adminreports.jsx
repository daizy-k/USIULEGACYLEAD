import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { getAllPackets } from "../services/Handoverservice";

export default function AdminReports() {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPackets().then((data) => {
      setPackets(data);
      setLoading(false);
    });
  }, []);

  const counts = packets.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  function handleExport() {
    const rows = [
      ["Organization", "Outgoing leader", "Incoming leader", "Status", "Last updated"],
      ...packets.map((p) => [
        p.orgName,
        p.outgoingLeaderName,
        p.incomingLeaderName || "",
        p.status,
        p.updatedAt?.toDate ? p.updatedAt.toDate().toLocaleDateString() : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "legacylead-handover-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontSize: "22px" }}>Reports</h1>
            <p className="sub" style={{ marginBottom: 0 }}>Handover completion at a glance.</p>
          </div>
          <button className="btn btn-dark" onClick={handleExport} disabled={loading || packets.length === 0}>
            Export CSV
          </button>
        </div>
        <div className="page" style={{ paddingTop: "20px" }}>
          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : (
            <div className="grid">
              <div className="card"><h3>{packets.length}</h3><p className="role">Total handovers</p></div>
              <div className="card"><h3>{counts.complete || 0}</h3><p className="role">Complete</p></div>
              <div className="card"><h3>{(counts.pending_admin_review || 0) + (counts.pending_incoming_review || 0)}</h3><p className="role">In review</p></div>
              <div className="card"><h3>{counts.draft || 0}</h3><p className="role">Not started</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}