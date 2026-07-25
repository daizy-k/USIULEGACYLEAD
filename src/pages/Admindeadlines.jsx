import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { getAllOrganizations, updateOrganizationDeadline } from "../services/orgService";

function DeadlineRow({ org, onSave, saving }) {
  const [value, setValue] = useState(org.deadline || "");
  return (
    <tr>
      <td>{org.icon} {org.name}</td>
      <td>
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "6px" }}
        />
      </td>
      <td>
        <button className="btn btn-secondary" onClick={() => onSave(org.id, value)} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}

export default function AdminDeadlines() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  async function load() {
    const data = await getAllOrganizations();
    setOrgs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave(orgId, deadline) {
    setSavingId(orgId);
    try {
      await updateOrganizationDeadline(orgId, deadline);
      await load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontSize: "22px" }}>Deadlines</h1>
            <p className="sub" style={{ marginBottom: 0 }}>Set the handover submission deadline for each org.</p>
          </div>
        </div>
        <div className="page" style={{ paddingTop: "20px" }}>
          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : orgs.length === 0 ? (
            <div className="empty-state">No organizations registered yet — add one under Organizations first.</div>
          ) : (
            <table>
              <tbody>
                <tr><th>Organization</th><th>Deadline</th><th></th></tr>
                {orgs.map((org) => (
                  <DeadlineRow key={org.id} org={org} onSave={handleSave} saving={savingId === org.id} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}