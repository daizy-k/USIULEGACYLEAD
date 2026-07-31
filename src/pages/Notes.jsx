import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { addNote, getNotes, updateNote, deleteNote } from "../services/NoteService";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  async function load() {
    const data = await getNotes(user.uid);
    setNotes(data);
    setLoading(false);
  }

 useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
  if (user) load();
}, [user]);

  async function handleAdd() {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await addNote(user.uid, newText.trim());
      setNewText("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditText(note.text);
  }

  async function saveEdit(noteId) {
    if (!editText.trim()) return;
    await updateNote(user.uid, noteId, editText.trim());
    setEditingId(null);
    await load();
  }

  async function handleDelete(noteId) {
    const confirmed = window.confirm("Delete this note? This can't be undone.");
    if (!confirmed) return;
    await deleteNote(user.uid, noteId);
    await load();
  }

  return (
    <div className="content">
      <div className="page" style={{ maxWidth: "640px" }}>
        <h1>My notes</h1>
        <p className="sub">Private scratchpad — not tied to any specific handover.</p>

        <div className="form-section">
          <textarea
            placeholder="Write a new note…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{ minHeight: "70px" }}
          />
          <button
            className="btn btn-primary"
            style={{ marginTop: "10px" }}
            onClick={handleAdd}
            disabled={saving || !newText.trim()}
          >
            {saving ? "Saving…" : "+ Add note"}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">No notes yet — add one above.</div>
        ) : (
          notes.map((note) => (
            <div className="form-section" key={note.id}>
              {editingId === note.id ? (
                <>
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => saveEdit(note.id)} disabled={!editText.trim()}>Save</button>
                  </div>
                </>
              ) : (
                <>
                  <p
                    style={{ fontSize: "14px", marginBottom: "10px", cursor: "pointer" }}
                    onClick={() => startEdit(note)}
                    title="Tap to edit"
                  >
                    {note.text}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: "11px", color: "var(--text-2)" }}>
                      {formatDate(note.createdAt)}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: "12px" }} onClick={() => startEdit(note)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "5px 12px", fontSize: "12px", color: "var(--danger)", borderColor: "var(--danger)" }}
                        onClick={() => handleDelete(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}