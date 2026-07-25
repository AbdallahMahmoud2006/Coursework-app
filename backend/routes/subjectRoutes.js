import express from "express";
import Subject from "../models/Subject.js";
import { cascadeDeleteSubject } from "../utils/cascadeDelete.js";

const router = express.Router();

// GET all subjects across every semester (used by the Calendar's subject dropdown)
router.get("/", async (req, res) => {
  const subjects = await Subject.find().populate("semester").sort({
    createdAt: 1,
  });
  res.json(subjects);
});

// GET all subjects for a given semester
router.get("/semester/:semesterId", async (req, res) => {
  const subjects = await Subject.find({
    semester: req.params.semesterId,
  }).sort({ createdAt: 1 });
  res.json(subjects);
});

// GET a single subject
router.get("/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) return res.status(404).json({ error: "Subject not found" });
  res.json(subject);
});

// POST a new subject
router.post("/", async (req, res) => {
  try {
    const subject = await Subject.create({
      name: req.body.name,
      semester: req.body.semesterId,
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a subject (and everything nested under it — weeks, PDFs, categories, grade items)
router.delete("/:id", async (req, res) => {
  await cascadeDeleteSubject(req.params.id);
  await Subject.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
