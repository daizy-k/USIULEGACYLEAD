import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/Userservice.js";


export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!user) {
        setChecking(false);
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (!cancelled) {
        setIsAdmin(profile?.role === "admin");
        setChecking(false);
      }
    }
    check();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (checking) return <div className="loading-state">Checking access…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}