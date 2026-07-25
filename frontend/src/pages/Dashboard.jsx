import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { daysUntil, isUrgent, TYPE_COLORS } from "../calendarHelpers";
import { computeOverall } from "../gradeCalculations";
import WeightBar from "../components/WeightBar";
import DaysChip from "../components/DaysChip";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [subjectSummaries, setSubjectSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ev, tk, allPdfs, subjects] = await Promise.all([
        api.getEvents(),
        api.getTasks(),
        api.getAllPdfs(),
        api.getAllSubjects(),
      ]);
      setEvents(ev);
      setTasks(tk);
      setPdfs(allPdfs);

      const summaries = await Promise.all(
        subjects.map(async (subject) => {
          const [categories, items] = await Promise.all([
            api.getCategories(subject._id),
            api.getGradeItems(subject._id),
          ]);
          const itemsByCategoryId = {};
          for (const item of items) {
            const catId = item.category?._id || item.category;
            if (!itemsByCategoryId[catId]) itemsByCategoryId[catId] = [];
            itemsByCategoryId[catId].push(item);
          }
          const { overall, letter } = computeOverall(categories, itemsByCategoryId);
          return { subject, categories, overall, letter };
        })
      );
      setSubjectSummaries(summaries);
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted">Loading dashboard...</p>;

  const upcoming = events
    .filter((ev) => daysUntil(ev.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const openTasks = tasks.filter((t) => !t.done);
  const unreviewedHours = pdfs
    .filter((p) => !p.done && p.hoursToFinish)
    .reduce((sum, p) => sum + p.hoursToFinish, 0);

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "0.5rem" }}>
        <div className="card">
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>OPEN TASKS</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem" }}>{openTasks.length}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>UPCOMING EVENTS</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem" }}>{upcoming.length}</div>
        </div>
        <div className="card">
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>UNREVIEWED HOURS</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.8rem" }}>{unreviewedHours.toFixed(1)}h</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem" }}>
        <div>
          <h2>Your subjects</h2>
          {subjectSummaries.length === 0 && (
            <p className="text-muted">No subjects yet — add one under Semesters.</p>
          )}
          {subjectSummaries.map(({ subject, categories, overall, letter }) => (
            <div className="card" key={subject._id}>
              <div className="card-row" style={{ marginBottom: "0.6rem" }}>
                <Link to={`/semesters/${subject.semester?._id || subject.semester}/subjects/${subject._id}`}>
                  <h3 style={{ margin: 0 }}>{subject.name}</h3>
                </Link>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 600 }}>
                  {overall !== null ? `${overall.toFixed(1)}% · ${letter}` : "no data yet"}
                </span>
              </div>
              <WeightBar categories={categories} />
            </div>
          ))}
        </div>

        <div>
          <h2>Upcoming</h2>
          <div className="card">
            {upcoming.length === 0 && <p className="text-muted mt-0">Nothing upcoming.</p>}
            {upcoming.map((ev) => (
              <div
                key={ev._id}
                style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.8rem" }}
              >
                <DaysChip days={daysUntil(ev.date)} urgent={isUrgent(ev)} />
                <div>
                  <div>
                    <span className={`badge ${ev.type}`}>{ev.type}</span>{" "}
                    <strong>{ev.title}</strong>
                  </div>
                  {ev.subject && <div className="text-muted" style={{ fontSize: "0.8rem" }}>{ev.subject.name}</div>}
                </div>
              </div>
            ))}
          </div>

          <h2>Open tasks</h2>
          <div className="card">
            {openTasks.length === 0 && <p className="text-muted mt-0">Nothing pending.</p>}
            {openTasks.slice(0, 8).map((t) => (
              <div key={t._id} style={{ marginBottom: "0.4rem" }}>
                ☐ {t.title} {t.dueDate && <span className="text-muted">({t.dueDate})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
