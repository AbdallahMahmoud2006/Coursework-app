import express from "express";
import Week from "../models/Week.js";
import { cascadeDeleteWeek } from "../utils/cascadeDelete.js";

const router = express.Router();

// GET all weeks for a given subject
router.get("/subject/:subjectId", async (req, res) => {
  const weeks = await Week.find({ subject: req.params.subjectId }).sort({
    weekNumber: 1,
  });
  res.json(weeks);
});

// GET a single week
router.get("/:id", async (req, res) => {
  const week = await Week.findById(req.params.id);
  if (!week) return res.status(404).json({ error: "Week not found" });
  res.json(week);
});

// POST a new week
router.post("/", async (req, res) => {
  try {
    const week = await Week.create({
      weekNumber: req.body.weekNumber,
      topics: req.body.topics || [],
      subject: req.body.subjectId,
    });
    res.status(201).json(week);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a week (and every PDF that belongs to it, including files on disk)
router.delete("/:id", async (req, res) => {
  await cascadeDeleteWeek(req.params.id);
  res.status(204).end();
});

export default router;
