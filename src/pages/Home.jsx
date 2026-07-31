import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOrganizations } from "../services/OrgService";

export default function Home() {
  const [search, setSearch] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrganizations().then((data) => {
      setOrgs(data);
      setLoading(false);
    });
  }, []);

  const filtered = orgs.filter((org) => org.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="content">
      <div className="page">
        <h1>Organization directory</h1>
        <p className="sub">Every recognized club and office, and where its handover stands.</p>
        <div className="search-row">
          <input
            type="text"
            placeholder="Search clubs or offices"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : orgs.length === 0 ? (
          <div className="empty-state">No organizations registered yet — check back soon.</div>
        ) : (
          <div className="grid">
            {filtered.map((org) => (
              <Link to="/handover-packets" key={org.id} className="card">
                <div className="icon">{org.icon}</div>
                <h3>{org.name}</h3>
                <p className="role">{org.category || ""}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}