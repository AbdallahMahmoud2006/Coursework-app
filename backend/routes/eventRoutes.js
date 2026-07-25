import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// GET all events (optionally within a date range via ?from=&to=)
router.get("/", async (req, res) => {
  const { from, to } = req.query;
  const filter = {};
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }
  const events = await Event.find(filter).populate("subject").sort({ date: 1 });
  res.json(events);
});

// GET all events for a given subject
router.get("/subject/:subjectId", async (req, res) => {
  const events = await Event.find({ subject: req.params.subjectId }).sort({
    date: 1,
  });
  res.json(events);
});

// POST a new event
router.post("/", async (req, res) => {
  try {
    const { title, date, type, description, subjectId, reminderLeadDays } = req.body;
    const event = await Event.create({
      title,
      date,
      type,
      description: description || "",
      subject: subjectId || null,
      reminderLeadDays: reminderLeadDays ?? 3,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update an event
router.put("/:id", async (req, res) => {
  try {
    const { title, date, type, description, subjectId, reminderLeadDays } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (date !== undefined) update.date = date;
    if (type !== undefined) update.type = type;
    if (description !== undefined) update.description = description;
    if (subjectId !== undefined) update.subject = subjectId || null;
    if (reminderLeadDays !== undefined) update.reminderLeadDays = reminderLeadDays;

    const event = await Event.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE an event
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
