import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { createOrganization, getAllOrganizations } from "../services/Orgservice";


export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", icon: "🏫", category: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    const data = await getAllOrganizations();
    setOrgs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createOrganization(form);
      setForm({ name: "", icon: "🏫", category: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 style={{ fontSize: "22px" }}>Organizations</h1>
            <p className="sub" style={{ marginBottom: 0 }}>Register clubs and offices so students can sign up under them.</p>
          </div>
        </div>
        <div className="page" style={{ paddingTop: "20px" }}>
          <form
            onSubmit={handleSubmit}
            className="form-section"
            style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}
          >
            <div style={{ flex: "1", minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-2)" }}>
                ORG NAME
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Debate Club"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-2)" }}>
                ICON
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                style={{ width: "60px", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", textAlign: "center" }}
              />
            </div>
            <div style={{ flex: "1", minWidth: "160px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-2)" }}>
                CATEGORY (optional)
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Academic"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px" }}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "+ Register org"}
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <div className="loading-state">Loading…</div>
          ) : orgs.length === 0 ? (
            <div className="empty-state">No organizations registered yet — add the first one above.</div>
          ) : (
            <table style={{ marginTop: "16px" }}>
              <tbody>
                <tr><th>Icon</th><th>Name</th><th>Category</th></tr>
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td>{org.icon}</td>
                    <td>{org.name}</td>
                    <td>{org.category || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}