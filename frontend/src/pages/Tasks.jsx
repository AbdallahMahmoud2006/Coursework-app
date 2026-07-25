import { useEffect, useState } from "react";
import { api } from "../api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.createTask({ title: title.trim(), dueDate });
      setTitle("");
      setDueDate("");
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleDone = async (task) => {
    await api.updateTask(task._id, { done: !task.done });
    loadTasks();
  };

  const handleDelete = async (id) => {
    await api.deleteTask(id);
    loadTasks();
  };

  const visibleTasks = tasks.filter((t) => {
    if (filter === "open") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  return (
    <div>
      <h1>To-Do List</h1>
      {error && <p style={{ color: "var(--urgent)" }}>{error}</p>}

      <form onSubmit={handleAdd} className="form-row">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Due date (optional)"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit" className="primary">Add Task</button>
      </form>

      <div className="form-row">
        <label>
          Show{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <div className="card">
        {visibleTasks.length === 0 && <p className="text-muted mt-0">Nothing here.</p>}
        {visibleTasks.map((task) => (
          <div
            key={task._id}
            className="card-row"
            style={{
              marginBottom: "0.5rem",
              textDecoration: task.done ? "line-through" : "none",
              opacity: task.done ? 0.55 : 1,
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
              <input type="checkbox" checked={task.done} onChange={() => handleToggleDone(task)} />
              {task.title}
              {task.dueDate && <span className="text-muted">({task.dueDate})</span>}
            </label>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
