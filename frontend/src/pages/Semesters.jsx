import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState({});
  const [newSemesterName, setNewSemesterName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState({});
  const [error, setError] = useState("");

  const loadSemesters = async () => {
    try {
      const data = await api.getSemesters();
      setSemesters(data);
      const subjectsMap = {};
      for (const sem of data) {
        subjectsMap[sem._id] = await api.getSubjects(sem._id);
      }
      setSubjectsBySemester(subjectsMap);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSemesters();
  }, []);

  const handleAddSemester = async (e) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;
    try {
      await api.createSemester(newSemesterName.trim());
      setNewSemesterName("");
      loadSemesters();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSemester = async (id) => {
    await api.deleteSemester(id);
    loadSemesters();
  };

  const handleAddSubject = async (e, semesterId) => {
    e.preventDefault();
    const name = (newSubjectName[semesterId] || "").trim();
    if (!name) return;
    try {
      await api.createSubject(name, semesterId);
      setNewSubjectName({ ...newSubjectName, [semesterId]: "" });
      loadSemesters();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Semesters</h1>
      {error && <p style={{ color: "var(--urgent)" }}>{error}</p>}

      <form onSubmit={handleAddSemester} className="form-row">
        <input
          value={newSemesterName}
          onChange={(e) => setNewSemesterName(e.target.value)}
          placeholder="e.g. Semester 1"
        />
        <button type="submit" className="primary">Add Semester</button>
      </form>

      {semesters.map((sem) => (
        <div className="card" key={sem._id}>
          <div className="card-row" style={{ marginBottom: "0.7rem" }}>
            <h2 style={{ margin: 0 }}>{sem.name}</h2>
            <button onClick={() => handleDeleteSemester(sem._id)}>Delete Semester</button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, marginBottom: "0.8rem" }}>
            {(subjectsBySemester[sem._id] || []).map((subj) => (
              <li key={subj._id} style={{ marginBottom: "0.3rem" }}>
                <Link to={`/semesters/${sem._id}/subjects/${subj._id}`}>
                  <button>{subj.name}</button>
                </Link>
              </li>
            ))}
          </ul>

          <form onSubmit={(e) => handleAddSubject(e, sem._id)} className="form-row" style={{ marginBottom: 0 }}>
            <input
              value={newSubjectName[sem._id] || ""}
              onChange={(e) =>
                setNewSubjectName({ ...newSubjectName, [sem._id]: e.target.value })
              }
              placeholder="e.g. Operating Systems"
            />
            <button type="submit">Add Subject</button>
          </form>
        </div>
      ))}
    </div>
  );
}
