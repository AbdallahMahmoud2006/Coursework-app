import { useEffect, useState } from "react";
import { api } from "../api";
import { daysUntil, isUrgent } from "../calendarHelpers";
import DaysChip from "../components/DaysChip";

const EVENT_TYPES = [
  { value: "exam", label: "Exam" },
  { value: "deadline", label: "Deadline" },
  { value: "other", label: "Other" },
];

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function buildMonthMatrix(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeek(firstOfMonth);
  const weeks = [];
  let cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function buildWeekRow(anchorDate) {
  const start = startOfWeek(anchorDate);
  const days = [];
  for (let d = 0; d < 7; d++) {
    const day = new Date(start);
    day.setDate(day.getDate() + d);
    days.push(day);
  }
  return days;
}

export default function Calendar() {
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [action, setAction] = useState(null); // "task" | "event" | null
  const [error, setError] = useState("");

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("exam");
  const [eventSubjectId, setEventSubjectId] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventReminderLeadDays, setEventReminderLeadDays] = useState(3);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");

  const load = async () => {
    try {
      const [ev, tk, subs] = await Promise.all([
        api.getEvents(),
        api.getTasks(),
        api.getAllSubjects(),
      ]);
      setEvents(ev);
      setTasks(tk);
      setSubjects(subs);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const eventsByDate = {};
  for (const ev of events) {
    const key = toISODate(new Date(ev.date));
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }
  const tasksByDate = {};
  for (const t of tasks) {
    if (!t.dueDate) continue;
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = [];
    tasksByDate[t.dueDate].push(t);
  }

  const openDay = (date) => {
    setSelectedDate(date);
    setAction(null);
    setEventTitle("");
    setEventDescription("");
    setEventSubjectId("");
    setEventReminderLeadDays(3);
    setTaskTitle("");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedDate) return;
    await api.createTask({
      title: taskTitle.trim(),
      dueDate: toISODate(selectedDate),
    });
    setTaskTitle("");
    setAction(null);
    load();
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !selectedDate) return;
    try {
      await api.createEvent({
        title: eventTitle.trim(),
        date: selectedDate.toISOString(),
        type: eventType,
        description: eventType === "other" ? eventDescription : "",
        subjectId: eventType !== "other" ? eventSubjectId || null : null,
        reminderLeadDays: Number(eventReminderLeadDays) || 3,
      });
      setEventTitle("");
      setEventDescription("");
      setEventSubjectId("");
      setAction(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    await api.deleteEvent(id);
    load();
  };

  const goPrev = () => {
    const d = new Date(anchorDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setAnchorDate(d);
  };

  const goNext = () => {
    const d = new Date(anchorDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setAnchorDate(d);
  };

  const renderDayCell = (date) => {
    const key = toISODate(date);
    const dayEvents = eventsByDate[key] || [];
    const dayTasks = tasksByDate[key] || [];
    const isSelected = selectedDate && toISODate(selectedDate) === key;
    const inCurrentMonth = date.getMonth() === anchorDate.getMonth();

    return (
      <td
        key={key}
        onClick={() => openDay(date)}
        style={{
          border: "1px solid var(--border)",
          verticalAlign: "top",
          padding: "0.5rem",
          cursor: "pointer",
          width: "14%",
          minHeight: "80px",
          background: isSelected ? "var(--accent-soft)" : "transparent",
          opacity: viewMode === "month" && !inCurrentMonth ? 0.35 : 1,
          borderRadius: "6px",
        }}
      >
        <div>{date.getDate()}</div>
        {(dayEvents.length > 0 || dayTasks.length > 0) && (
          <div style={{ fontSize: "0.75rem" }}>
            {dayEvents.map((ev) => (
              <div key={ev._id} style={{ marginBottom: "2px" }}>
                <span className={`badge ${isUrgent(ev) ? "urgent" : ev.type}`}>
                  {ev.title}
                </span>
              </div>
            ))}
            {dayTasks.map((t) => (
              <div key={t._id} style={{ marginBottom: "2px" }}>
                <span className="badge task">☐ {t.title}</span>
              </div>
            ))}
          </div>
        )}
      </td>
    );
  };

  const weeks =
    viewMode === "month"
      ? buildMonthMatrix(anchorDate.getFullYear(), anchorDate.getMonth())
      : [buildWeekRow(anchorDate)];

  const upcoming = events
    .filter((ev) => daysUntil(ev.date) >= 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ padding: "1rem", display: "flex", gap: "2rem" }}>
      <div style={{ flex: 2 }}>
        <h1>Calendar</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "center" }}>
          <button onClick={goPrev}>← Prev</button>
          <span>
            {viewMode === "month"
              ? anchorDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
              : `Week of ${toISODate(startOfWeek(anchorDate))}`}
          </span>
          <button onClick={goNext}>Next →</button>

          <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </div>

        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>{week.map((date) => renderDayCell(date))}</tr>
            ))}
          </tbody>
        </table>

        {selectedDate && (
          <div className="card" style={{ marginTop: "1.5rem" }}>
            <h3>{selectedDate.toDateString()}</h3>

            {!action && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setAction("task")}>Add task for this day</button>
                <button onClick={() => setAction("event")}>Add event for this day</button>
              </div>
            )}

            {action === "task" && (
              <form onSubmit={handleAddTask} style={{ marginTop: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
                <button type="submit">Add Task</button>
                <button type="button" onClick={() => setAction(null)}>Cancel</button>
              </form>
            )}

            {action === "event" && (
              <form onSubmit={handleAddEvent} style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Event title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />

                {eventType !== "other" ? (
                  <select value={eventSubjectId} onChange={(e) => setEventSubjectId(e.target.value)}>
                    <option value="">(no subject)</option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                  />
                )}

                <label>
                  Remind me{" "}
                  <input
                    type="number"
                    min="0"
                    style={{ width: "3rem" }}
                    value={eventReminderLeadDays}
                    onChange={(e) => setEventReminderLeadDays(e.target.value)}
                  />{" "}
                  days before
                </label>

                <button type="submit">Add Event</button>
                <button type="button" onClick={() => setAction(null)}>Cancel</button>
              </form>
            )}

            <div style={{ marginTop: "1rem" }}>
              {(eventsByDate[toISODate(selectedDate)] || []).map((ev) => (
                <div key={ev._id} style={{ marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`badge ${ev.type}`}>{ev.type}</span>
                  <strong>{ev.title}</strong>
                  {ev.subject && <span className="text-muted">— {ev.subject.name}</span>}
                  <button onClick={() => handleDeleteEvent(ev._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, borderLeft: "1px solid var(--border)", paddingLeft: "1.5rem", maxHeight: "600px", overflowY: "auto" }}>
        <h2>Upcoming</h2>
        {upcoming.length === 0 && <p className="text-muted">Nothing upcoming.</p>}
        {upcoming.map((ev) => {
          const d = daysUntil(ev.date);
          const urgent = isUrgent(ev);
          return (
            <div key={ev._id} className="card" style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}>
              <DaysChip days={d} urgent={urgent} />
              <div>
                <div>
                  <span className={`badge ${urgent ? "urgent" : ev.type}`}>{ev.type}</span>{" "}
                  <strong>{ev.title}</strong>
                </div>
                {ev.subject && <div className="text-muted" style={{ fontSize: "0.8rem" }}>{ev.subject.name}</div>}
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>{new Date(ev.date).toDateString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
