import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import BackButton from "../components/BackButton";
import WeightBar from "../components/WeightBar";
import DaysChip from "../components/DaysChip";
import { daysUntil, isUrgent } from "../calendarHelpers";
import { computeOverall } from "../gradeCalculations";

export default function SubjectHub() {
  const { semesterId, subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [overall, setOverall] = useState(null);
  const [letter, setLetter] = useState("-");

  useEffect(() => {
    api.getSubject(subjectId).then(setSubject);
    api.getEventsForSubject(subjectId).then(setEvents);
    (async () => {
      const [cats, items] = await Promise.all([
        api.getCategories(subjectId),
        api.getGradeItems(subjectId),
      ]);
      setCategories(cats);
      const itemsByCategoryId = {};
      for (const item of items) {
        const catId = item.category?._id || item.category;
        if (!itemsByCategoryId[catId]) itemsByCategoryId[catId] = [];
        itemsByCategoryId[catId].push(item);
      }
      const result = computeOverall(cats, itemsByCategoryId);
      setOverall(result.overall);
      setLetter(result.letter);
    })();
  }, [subjectId]);

  if (!subject) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <BackButton to="/semesters" label="Semesters" />
      <div className="card-row" style={{ marginBottom: "0.5rem" }}>
        <h1 style={{ margin: 0 }}>{subject.name}</h1>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>
          {overall !== null ? `${overall.toFixed(1)}% · ${letter}` : "no data yet"}
        </span>
      </div>

      <div className="card">
        <WeightBar categories={categories} />
      </div>

      <div className="form-row" style={{ marginBottom: "1.5rem" }}>
        <Link to={`/semesters/${semesterId}/subjects/${subjectId}/weeks`}>
          <button className="primary">Weeks</button>
        </Link>
        <Link to={`/semesters/${semesterId}/subjects/${subjectId}/grades`}>
          <button className="primary">Grades</button>
        </Link>
      </div>

      <h2>Upcoming for this subject</h2>
      <div className="card">
        {events.length === 0 && (
          <p className="text-muted mt-0">No exams or deadlines linked to this subject yet.</p>
        )}
        {events.map((ev) => (
          <div key={ev._id} style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.7rem" }}>
            <DaysChip days={daysUntil(ev.date)} urgent={isUrgent(ev)} />
            <div>
              <span className={`badge ${isUrgent(ev) ? "urgent" : ev.type}`}>{ev.type}</span>{" "}
              <strong>{ev.title}</strong>
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>{new Date(ev.date).toDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
