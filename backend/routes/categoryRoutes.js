import express from "express";
import Category from "../models/Category.js";
import GradeItem from "../models/GradeItem.js";

const router = express.Router();

// GET all categories for a subject
router.get("/subject/:subjectId", async (req, res) => {
  const categories = await Category.find({
    subject: req.params.subjectId,
  }).sort({ createdAt: 1 });
  res.json(categories);
});

// POST a new category
router.post("/", async (req, res) => {
  try {
    const { subjectId, name, weight, keepBestN, isMidterm, isFinal } = req.body;

    if (isMidterm) {
      const existing = await Category.findOne({
        subject: subjectId,
        isMidterm: true,
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "This subject already has a Midterm category." });
      }
    }

    if (isFinal) {
      const existing = await Category.findOne({
        subject: subjectId,
        isFinal: true,
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "This subject already has a Final category." });
      }
    }

    const category = await Category.create({
      subject: subjectId,
      name,
      weight,
      keepBestN: isMidterm ? null : keepBestN || null,
      isMidterm: !!isMidterm,
      isFinal: !!isFinal,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a category (name, weight, keepBestN)
router.put("/:id", async (req, res) => {
  try {
    const { name, weight, keepBestN } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (weight !== undefined) update.weight = weight;
    if (keepBestN !== undefined) update.keepBestN = keepBestN;

    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!category)
      return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a category (and every grade item that belongs to it)
router.delete("/:id", async (req, res) => {
  await GradeItem.deleteMany({ category: req.params.id });
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
