import { Routes, Route, useLocation } from "react-router-dom";
import TopNav from "./components/TopNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import AdminOrganizations from "./pages/Adminorganizations";
import AdminDeadlines from "./pages/Admindeadlines";
import AdminReports from "./pages/Adminreports";
import AdminReview from "./pages/Adminreview";
import HandoverPacket from "./pages/HandoverPacket";
import Notifications from "./pages/Notification";
import Leaderboard from "./pages/Leaderboard";
import Review from "./pages/Review";
import Profile from "./pages/Profile";




const HIDE_NAV_PREFIXES = ["/dashboard", "/login", "/signup"];
 
export default function App() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
 
  return (
    <>
      {!hideNav && <TopNav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
 
        {/* Admin section — gated by role, not just login */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/dashboard/organizations" element={<AdminRoute><AdminOrganizations /></AdminRoute>} />
        <Route path="/dashboard/deadlines" element={<AdminRoute><AdminDeadlines /></AdminRoute>} />
        <Route path="/dashboard/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/dashboard/review/:packetId" element={<AdminRoute><AdminReview /></AdminRoute>} />
 
        <Route
          path="/handover-packets"
          element={
            <ProtectedRoute>
              <HandoverPacket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:packetId"
          element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}