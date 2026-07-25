import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import BackButton from "../components/BackButton";

export default function PdfViewer() {
  const { semesterId, subjectId, weekId, pdfId } = useParams();
  const [pdf, setPdf] = useState(null);
  const [difficulty, setDifficulty] = useState("");
  const [hoursToFinish, setHoursToFinish] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const load = async () => {
    const data = await api.getPdf(pdfId);
    setPdf(data);
    setDifficulty(data.difficulty ?? "");
    setHoursToFinish(data.hoursToFinish ?? "");
    setNotes(data.notes ?? "");
    setDone(data.done ?? false);
  };

  useEffect(() => {
    load();
  }, [pdfId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updatePdf(pdfId, {
        difficulty: difficulty === "" ? null : Number(difficulty),
        hoursToFinish: hoursToFinish === "" ? null : Number(hoursToFinish),
        notes,
        done,
      });
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  };

  if (!pdf) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <BackButton to={`/semesters/${semesterId}/subjects/${subjectId}/weeks/${weekId}`} label="Week" />
      <div className="card-row" style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ margin: 0 }}>{pdf.originalName}</h1>
        <a href={api.pdfFileUrl(pdf._id)} target="_blank" rel="noopener noreferrer">
          <button>Open in new tab ↗</button>
        </a>
      </div>

      <iframe
        src={api.pdfFileUrl(pdf._id)}
        title={pdf.originalName}
        width="100%"
        height="600px"
        style={{ border: "1px solid var(--border-strong)", borderRadius: "8px", marginBottom: "1.25rem" }}
      />

      <form onSubmit={handleSave} className="card" style={{ maxWidth: "420px" }}>
        <div className="form-row">
          <label style={{ flex: 1 }}>
            Difficulty (1=hard, 10=easy)
            <br />
            <input
              type="number"
              min="1"
              max="10"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="form-row">
          <label style={{ flex: 1 }}>
            Hours to finish
            <br />
            <input
              type="number"
              step="0.1"
              min="0"
              value={hoursToFinish}
              onChange={(e) => setHoursToFinish(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} /> Done
          </label>
        </div>

        <div className="form-row" style={{ display: "block" }}>
          <label>
            Notes
            <br />
            <textarea
              rows={6}
              style={{ width: "100%", marginTop: "0.3rem" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        {savedAt && <span className="text-muted" style={{ marginLeft: "0.6rem" }}>Saved at {savedAt}</span>}
      </form>
    </div>
  );
}
