import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Home from "../pages/Home";

export default function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-state">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Home />;
}