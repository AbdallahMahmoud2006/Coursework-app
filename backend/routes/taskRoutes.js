import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// GET all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: 1 });
  res.json(tasks);
});

// POST a new task
router.post("/", async (req, res) => {
  try {
    const { title, dueDate, linkedWeek, linkedEvent } = req.body;
    const task = await Task.create({
      title,
      dueDate: dueDate || "",
      linkedWeek: linkedWeek || null,
      linkedEvent: linkedEvent || null,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a task (title, done, dueDate, links)
router.put("/:id", async (req, res) => {
  try {
    const { title, done, dueDate, linkedWeek, linkedEvent } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (done !== undefined) update.done = done;
    if (dueDate !== undefined) update.dueDate = dueDate;
    if (linkedWeek !== undefined) update.linkedWeek = linkedWeek;
    if (linkedEvent !== undefined) update.linkedEvent = linkedEvent;

    const task = await Task.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
