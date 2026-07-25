import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import BackButton from "../components/BackButton";

export default function WeekContent() {
  const { semesterId, subjectId, weekId } = useParams();
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadPdfs = async () => {
    try {
      const data = await api.getPdfs(weekId);
      setPdfs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadPdfs();
  }, [weekId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await api.uploadPdf(file, weekId);
      setFile(null);
      e.target.reset();
      loadPdfs();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    await api.deletePdf(id);
    loadPdfs();
  };

  return (
    <div>
      <BackButton to={`/semesters/${semesterId}/subjects/${subjectId}/weeks`} label="Weeks" />
      <h1>Week Content</h1>
      {error && <p style={{ color: "var(--urgent)" }}>{error}</p>}

      <form onSubmit={handleUpload} className="form-row">
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" className="primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>

      <div className="card">
        {pdfs.length === 0 && <p className="text-muted mt-0">No PDFs uploaded yet.</p>}
        {pdfs.map((pdf) => (
          <div key={pdf._id} className="card-row" style={{ marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <a href={api.pdfFileUrl(pdf._id)} target="_blank" rel="noopener noreferrer">
                <button>
                  {pdf.done ? "✓ " : ""}
                  {pdf.originalName} ↗
                </button>
              </a>
              <Link to={`/semesters/${semesterId}/subjects/${subjectId}/weeks/${weekId}/pdf/${pdf._id}`}>
                <button className="text-muted">Details</button>
              </Link>
            </div>
            <button onClick={() => handleDelete(pdf._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
