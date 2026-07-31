import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../context/useAuth";
import { getUserProfile } from "../services/UserService";


const ROLE_LABELS = {
  outgoing: "Outgoing leader",
  incoming: "Incoming leader",
  admin: "Admin",
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="content">
        <div className="loading-state">Loading profile…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="content">
        <div className="empty-state">No profile found for your account.</div>
      </div>
    );
  }

  const displayName = profile.name || user?.email;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = profile.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : null;

  return (
    <div className="content">
      <div className="page" style={{ maxWidth: "560px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
          <div
            className="avatar"
            style={{ width: "64px", height: "64px", fontSize: "22px", borderRadius: "50%", flexShrink: 0 }}
          >
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: "22px", marginBottom: "2px" }}>{displayName}</h1>
            <p className="sub" style={{ marginBottom: 0 }}>{profile.email}</p>
          </div>
        </div>

        <div className="form-section">
          <div className="label">🏛 Organization</div>
          <p style={{ fontSize: "14px" }}>{profile.orgName || "—"}</p>
        </div>

        <div className="form-section">
          <div className="label">🎓 Role</div>
          <span className="badge warning">{ROLE_LABELS[profile.role] || profile.role}</span>
        </div>

        {memberSince && (
          <div className="form-section">
            <div className="label">📅 Member since</div>
            <p style={{ fontSize: "14px" }}>{memberSince}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
          <Link to="/handover-packets" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Go to My Handovers →
          </Link>
          <Link to="/notes" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            My Notes
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary">
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}