import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-sidebar">
      <div>
        <Link to="/dashboard" className="brand" style={{ textDecoration: "none" }}>
          <div className="mark">L</div>
          <span>LegacyLead</span>
        </Link>
        <div className="section-label">Oversight</div>
        <Link to="/dashboard" className={`navitem ${isActive("/dashboard") ? "active" : ""}`} style={{ textDecoration: "none" }}>
          <span className="ic">▦</span> Overview
        </Link>
        <Link to="/dashboard/organizations" className={`navitem ${isActive("/dashboard/organizations") ? "active" : ""}`} style={{ textDecoration: "none" }}>
          <span className="ic">🏛</span> Organizations
        </Link>
        <Link to="/dashboard/deadlines" className={`navitem ${isActive("/dashboard/deadlines") ? "active" : ""}`} style={{ textDecoration: "none" }}>
          <span className="ic">⏰</span> Deadlines
        </Link>
        <Link to="/dashboard/reports" className={`navitem ${isActive("/dashboard/reports") ? "active" : ""}`} style={{ textDecoration: "none" }}>
          <span className="ic">📊</span> Reports
        </Link>
      </div>
      <Link to="/" className="back" style={{ textDecoration: "none" }}>← Back to student view</Link>
    </div>
  );
}