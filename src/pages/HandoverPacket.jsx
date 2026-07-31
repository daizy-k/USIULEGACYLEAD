import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/UserService";
import {
  getPacket,
  getOrCreateDraftPacket,
  getOrClaimPacketForOrg,
  saveDraft,
  submitPacket,
  addDocumentsToPacket,
  getMissingFields,
} from "../services/HandoverService";
import { uploadDocuments } from "../services/Cloudinary";

const STEPS = ["Overview", "Projects", "Contacts", "Documents"];

const STATUS_MESSAGES = {
  pending_admin_review: "Submitted — waiting on admin review",
  pending_incoming_review: "Approved — waiting on your incoming leader to review",
  complete: "Complete — accepted by your incoming leader",
};

export default function HandoverPacket() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [packetId, setPacketId] = useState(null);
  const [packet, setPacket] = useState(null);
  const [fields, setFields] = useState({ yearInReview: "", ongoingProjects: "", keyContacts: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (!user) return;
      try {
        const userProfile = await getUserProfile(user.uid);
        if (cancelled) return;

        if (!userProfile) {
          setError("No profile found for your account — try signing up again.");
          setLoading(false);
          return;
        }
        setProfile(userProfile);

        if (userProfile.role === "incoming") {
          const claimedPacketId = await getOrClaimPacketForOrg(
            userProfile.orgId,
            user.uid,
            userProfile.name
          );
          if (!claimedPacketId) {
            setError("No handover has been approved for your org yet — check back once your outgoing leader submits and admin approves it.");
            setLoading(false);
            return;
          }
          navigate(`/review/${claimedPacketId}`);
          return;
        }

        const id = await getOrCreateDraftPacket({
          orgId: userProfile.orgId,
          orgName: userProfile.orgName,
          outgoingLeaderId: user.uid,
          outgoingLeaderName: userProfile.name,
        });
        if (cancelled) return;
        setPacketId(id);

        const data = await getPacket(id);
        if (cancelled) return;
        setPacket(data);
        setFields({
          yearInReview: data.yearInReview || "",
          ongoingProjects: data.ongoingProjects || "",
          keyContacts: data.keyContacts || "",
        });
      } catch (err) {
        console.error("Failed to load/create packet:", err);
        if (!cancelled) setError("Couldn't load this handover packet: " + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [user, navigate]);

  const scheduleAutosave = useCallback((nextFields) => {
    if (!packetId) return;
    setSaveStatus("Saving…");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDraft(packetId, nextFields);
        setSaveStatus("Saved");
      } catch (err) {
        setSaveStatus("Couldn't save — check your connection");
        console.error(err);
      }
    }, 800);
  }, [packetId]);

  function handleFieldChange(field, value) {
    const next = { ...fields, [field]: value };
    setFields(next);
    scheduleAutosave(next);
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadErrors([]);
    try {
      const { uploaded, errors } = await uploadDocuments(files);
      if (uploaded.length > 0) {
        await addDocumentsToPacket(packetId, uploaded);
        setPacket((prev) => ({ ...prev, documents: [...(prev?.documents || []), ...uploaded] }));
      }
      if (errors.length > 0) {
        setUploadErrors(errors.map((e) => `${e.file}: ${e.message}`));
      }
    } catch (err) {
      setUploadErrors([err.message]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit() {
    const missing = getMissingFields(fields);
    if (missing.length > 0) {
      setSubmitErrors(missing);
      return;
    }
    setSubmitErrors([]);
    setSubmitting(true);
    try {
      await submitPacket(packetId, fields);
      setPacket((prev) => ({ ...prev, status: "pending_admin_review" }));
    } catch (err) {
      setSubmitErrors([err.message]);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="content">
        <div className="loading-state">Loading packet…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <div className="empty-state error-text">{error}</div>
      </div>
    );
  }

  const isEditable = packet?.status === "draft" || packet?.status === "changes_requested";
  const statusMessage = STATUS_MESSAGES[packet?.status];

  return (
    <div className="content">
      <div className="page">
        <span className="mono" style={{ color: "var(--text-2)", fontSize: "12px" }}>
          {(packet?.orgName || "ORG").toUpperCase()} / HANDOVER PACKET
        </span>
        <h1 style={{ marginTop: "6px" }}>Handover packet</h1>
        <p className="sub">
          Outgoing: {packet?.outgoingLeaderName || "—"} &nbsp;→&nbsp; Incoming: {packet?.incomingLeaderName || "not yet assigned"}
        </p>

        {packet?.status === "changes_requested" && packet?.adminNote && (
          <div className="form-section" style={{ borderColor: "var(--warning)", background: "var(--warning-bg)" }}>
            <div className="label">🛎️ Admin requested changes</div>
            <p style={{ fontSize: "13px" }}>{packet.adminNote}</p>
          </div>
        )}

        <div className="stepper">
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: "contents" }}>
              <div className={`step ${i === 0 ? "done" : i === 1 ? "current" : ""}`}>
                <div className="dot">{i === 0 ? "✓" : i + 1}</div>
                <span className="steplabel">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`line ${i === 0 ? "done" : ""}`}></div>}
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="label">📍 Year in review</div>
          <textarea
            placeholder="Key achievements, events run, membership growth"
            value={fields.yearInReview}
            onChange={(e) => handleFieldChange("yearInReview", e.target.value)}
            disabled={!isEditable}
          />
        </div>

        <div className="form-section">
          <div className="label">📋 Ongoing projects</div>
          <textarea
            placeholder="Anything mid-flight the incoming leader needs to continue"
            value={fields.ongoingProjects}
            onChange={(e) => handleFieldChange("ongoingProjects", e.target.value)}
            disabled={!isEditable}
          />
        </div>

        <div className="form-section">
          <div className="label">📇 Key contacts</div>
          <textarea
            style={{ minHeight: "40px" }}
            placeholder="Name, role, and contact info for people this role depends on"
            value={fields.keyContacts}
            onChange={(e) => handleFieldChange("keyContacts", e.target.value)}
            disabled={!isEditable}
          />
        </div>

        <div className="form-section">
          <div className="label">📎 Documents</div>
          {isEditable && (
            <>
              <label className="upload" htmlFor="doc-upload">
                {uploading ? "Uploading…" : "Click to upload — constitution, budget, minutes (PDF/DOCX/XLSX, max 10MB)"}
              </label>
              <input
                id="doc-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </>
          )}
          {uploadErrors.length > 0 && (
            <p className="error-text">{uploadErrors.join(" · ")}</p>
          )}
          {packet?.documents?.length > 0 && (
            <ul className="doc-list">
              {packet.documents.map((doc) => (
                <li key={doc.publicId}>
                  <a href={doc.url} target="_blank" rel="noreferrer">{doc.name}</a>
                  <span className="mono" style={{ color: "var(--text-2)" }}>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {submitErrors.length > 0 && (
          <p className="error-text" style={{ marginBottom: "12px" }}>
            Please fill in: {submitErrors.join(", ")}
          </p>
        )}

        {isEditable ? (
          <div className="form-actions">
            <span className="save-status mono">{saveStatus}</span>
            <button className="btn btn-secondary" onClick={() => scheduleAutosave(fields)}>
              Save draft
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        ) : (
          <p className="badge warning">{statusMessage}</p>
        )}
      </div>
    </div>
  );
}