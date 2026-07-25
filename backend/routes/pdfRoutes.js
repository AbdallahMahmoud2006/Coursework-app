import express from "express";
import path from "path";
import fs from "fs";
import Pdf from "../models/Pdf.js";
import { upload, UPLOADS_DIR } from "../config/upload.js";

const router = express.Router();

// GET all PDFs across every week (used by the Dashboard's unreviewed-hours total)
router.get("/", async (req, res) => {
  const pdfs = await Pdf.find({}, "originalName difficulty hoursToFinish done week");
  res.json(pdfs);
});

// GET all PDFs for a given week
router.get("/week/:weekId", async (req, res) => {
  const pdfs = await Pdf.find({ week: req.params.weekId }).sort({
    createdAt: 1,
  });
  res.json(pdfs);
});

// GET a single PDF's metadata
router.get("/:id", async (req, res) => {
  const pdf = await Pdf.findById(req.params.id);
  if (!pdf) return res.status(404).json({ error: "PDF not found" });
  res.json(pdf);
});

// GET the actual file bytes (streamed), used by the viewer
router.get("/:id/file", async (req, res) => {
  const pdf = await Pdf.findById(req.params.id);
  if (!pdf) return res.status(404).json({ error: "PDF not found" });
  const filePath = path.join(UPLOADS_DIR, pdf.storedFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File missing on disk" });
  }
  res.sendFile(filePath);
});

// POST upload a new PDF for a week
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const pdf = await Pdf.create({
      originalName: req.file.originalname,
      storedFilename: req.file.filename,
      week: req.body.weekId,
    });
    res.status(201).json(pdf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a PDF's metadata (difficulty, hoursToFinish, notes, done)
router.put("/:id", async (req, res) => {
  try {
    const { difficulty, hoursToFinish, notes, done } = req.body;
    const update = {};
    if (difficulty !== undefined) update.difficulty = difficulty;
    if (hoursToFinish !== undefined) update.hoursToFinish = hoursToFinish;
    if (notes !== undefined) update.notes = notes;
    if (done !== undefined) update.done = done;

    const pdf = await Pdf.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!pdf) return res.status(404).json({ error: "PDF not found" });
    res.json(pdf);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a PDF (removes DB record and the file on disk)
router.delete("/:id", async (req, res) => {
  const pdf = await Pdf.findById(req.params.id);
  if (!pdf) return res.status(404).json({ error: "PDF not found" });
  const filePath = path.join(UPLOADS_DIR, pdf.storedFilename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await pdf.deleteOne();
  res.status(204).end();
});

export default router;
