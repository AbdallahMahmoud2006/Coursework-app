import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import BackButton from "../components/BackButton";

export default function Weeks() {
  const { semesterId, subjectId } = useParams();
  const [weeks, setWeeks] = useState([]);
  const [newWeekNumber, setNewWeekNumber] = useState("");
  const [error, setError] = useState("");

  const loadWeeks = async () => {
    try {
      const data = await api.getWeeks(subjectId);
      setWeeks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, [subjectId]);

  const handleAddWeek = async (e) => {
    e.preventDefault();
    if (!newWeekNumber) return;
    try {
      await api.createWeek(Number(newWeekNumber), subjectId);
      setNewWeekNumber("");
      loadWeeks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteWeek = async (id) => {
    await api.deleteWeek(id);
    loadWeeks();
  };

  return (
    <div>
      <BackButton to={`/semesters/${semesterId}/subjects/${subjectId}`} label="Subject" />
      <h1>Weeks</h1>
      {error && <p style={{ color: "var(--urgent)" }}>{error}</p>}

      <form onSubmit={handleAddWeek} className="form-row">
        <input
          type="number"
          value={newWeekNumber}
          onChange={(e) => setNewWeekNumber(e.target.value)}
          placeholder="Week number, e.g. 1"
        />
        <button type="submit" className="primary">Add Week</button>
      </form>

      <div className="card">
        {weeks.length === 0 && <p className="text-muted mt-0">No weeks yet.</p>}
        {weeks.map((week) => (
          <div key={week._id} className="card-row" style={{ marginBottom: "0.5rem" }}>
            <Link to={`/semesters/${semesterId}/subjects/${subjectId}/weeks/${week._id}`}>
              <button>Week {week.weekNumber}</button>
            </Link>
            <button onClick={() => handleDeleteWeek(week._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
