import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile } from "../services/UserService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(user.uid);

      if (profile?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/handover-packets");
      }
    } catch (err) {
      console.error("Login failed:", err.code || err.message);
      setError("Incorrect email or password.");
      setSubmitting(false);
    }
  }
  

  return (
    <div className="login-wrap">
      <div className="login-card">
        <span className="tag mono">USIU-AFRICA STUDENTS ONLY</span>
        <h1>Pass the torch,<br />not the guesswork.</h1>
        <p className="sub">Sign in to hand over or receive a leadership role.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>USIU EMAIL</label>
            <input
              type="email"
              placeholder="brian.otieno@usiu.ac.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text" style={{ marginBottom: "12px" }}>{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-2)" }}>
          New here? <Link to="/signup" style={{ color: "var(--navy)", fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}