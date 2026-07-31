import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function TopNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="topnav">
      <div className="left">
        <Link to="/" className="brand">
          <div className="mark">L</div>
          <span>LegacyLead</span>
        </Link>
        <div className="navlinks">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Directory
          </Link>
          <Link to="/handover-packets" className={isActive("/handover-packets") ? "active" : ""}>
            My Handovers
          </Link>
           <Link to="/notes" className={isActive("/notes") ? "active" : ""}>
            Notes
          </Link>
          <Link to="/notifications" className={isActive("/notifications") ? "active" : ""}>
            Notifications
          </Link>
         
        </div>
      </div>
      <div className="right">
        <Link to="/profile" className="avatar" title={user?.email || ""} style={{ textDecoration: "none" }}>
          {initials}
        </Link>
      </div>
    </div>
  );
}