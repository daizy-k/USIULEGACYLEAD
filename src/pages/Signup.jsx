import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { createUserProfile } from "../services/UserService";
import { getAllOrganizations } from "../services/OrgService";

function getPasswordStrength(password) {
  if (!password) return { label: "", score: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", score };
  if (score <= 3) return { label: "Medium", score };
  return { label: "Strong", score };
}

export default function Signup() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgId: "",
    role: "outgoing",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAllOrganizations().then((data) => {
      setOrgs(data);
      if (data.length > 0) {
        setForm((prev) => ({ ...prev, orgId: data[0].id }));
      }
      setLoadingOrgs(false);
    });
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const passwordStrength = getPasswordStrength(form.password);
  const strengthColor =
    passwordStrength.label === "Weak"
      ? "var(--danger)"
      : passwordStrength.label === "Medium"
      ? "var(--warning)"
      : "var(--success)";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.email.endsWith("@usiu.ac.ke")) {
      setError("Please use your USIU email address (@usiu.ac.ke).");
      return;
    }
    if (!form.orgId) {
      setError("Please select an organization.");
      return;
    }
    if (passwordStrength.score <= 1) {
      setError("Please choose a stronger password — at least 8 characters, mixing letters, numbers, and symbols.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(credential.user, { displayName: form.name });

      const org = orgs.find((o) => o.id === form.orgId);
      await createUserProfile(credential.user.uid, {
        name: form.name,
        email: form.email,
        orgId: org.id,
        orgName: org.name,
        role: form.role,
      });

      navigate("/handover-packets");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <span className="tag mono">USIU-AFRICA STUDENTS ONLY</span>
        <h1>Join LegacyLead</h1>
        <p className="sub">Set up your account and tell us your role.</p>

        {loadingOrgs ? (
          <p className="sub">Loading organizations…</p>
        ) : orgs.length === 0 ? (
          <p className="error-text">No organizations are registered yet — ask your admin to add one before signing up.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>FULL NAME</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>

            <div className="field">
              <label>USIU EMAIL</label>
              <input
                type="email"
                placeholder="brian.otieno@usiu.ac.ke"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>PASSWORD</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                minLength={6}
                required
              />
              {form.password && (
                <p className="mono" style={{ fontSize: "11px", marginTop: "4px", color: strengthColor }}>
                  Strength: {passwordStrength.label}
                </p>
              )}
            </div>

            <div className="field">
              <label>CONFIRM PASSWORD</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                minLength={6}
                required
              />
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="error-text">Passwords don't match</p>
              )}
            </div>

            <div className="field">
              <label>ORGANIZATION</label>
              <select
                value={form.orgId}
                onChange={(e) => update("orgId", e.target.value)}
                style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--sand)", color: "var(--ink)", fontFamily: "Inter", fontSize: "14px" }}
              >
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>{org.icon} {org.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>YOUR ROLE IN THIS HANDOVER</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--sand)", color: "var(--ink)", fontFamily: "Inter", fontSize: "14px" }}
              >
                <option value="outgoing">Outgoing leader (I'm handing over)</option>
                <option value="incoming">Incoming leader (I'm receiving)</option>
              </select>
            </div>

            {error && <p className="error-text" style={{ marginBottom: "12px" }}>{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating account…" : "Sign up"}
            </button>
          </form>
        )}
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-2)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--navy)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}