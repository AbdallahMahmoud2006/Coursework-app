import express from "express";
import Semester from "../models/Semester.js";
import Subject from "../models/Subject.js";
import { cascadeDeleteSubject } from "../utils/cascadeDelete.js";

const router = express.Router();

// GET all semesters
router.get("/", async (req, res) => {
  const semesters = await Semester.find().sort({ createdAt: 1 });
  res.json(semesters);
});

// POST a new semester
router.post("/", async (req, res) => {
  try {
    const semester = await Semester.create({ name: req.body.name });
    res.status(201).json(semester);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a semester (and every subject under it, fully cascaded)
router.delete("/:id", async (req, res) => {
  const subjects = await Subject.find({ semester: req.params.id });
  for (const subject of subjects) {
    await cascadeDeleteSubject(subject._id);
  }
  await Subject.deleteMany({ semester: req.params.id });
  await Semester.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
