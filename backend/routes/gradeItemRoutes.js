import express from "express";
import GradeItem from "../models/GradeItem.js";
import Category from "../models/Category.js";

const router = express.Router();

// GET all grade items for a subject.
// Non-midterm rows sort oldest-first; midterm category's row (if present) is always last.
router.get("/subject/:subjectId", async (req, res) => {
  const items = await GradeItem.find({ subject: req.params.subjectId })
    .sort({ createdAt: 1 })
    .populate("category");
  const midterm = items.filter((i) => i.category?.isMidterm);
  const rest = items.filter((i) => !i.category?.isMidterm);
  res.json([...rest, ...midterm]);
});

// POST a new grade item
router.post("/", async (req, res) => {
  try {
    const {
      subjectId,
      categoryId,
      instanceNumber,
      obtained,
      max,
      percentage,
      date,
    } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    if (category.isMidterm) {
      const existing = await GradeItem.findOne({ category: categoryId });
      if (existing) {
        return res.status(400).json({
          error: "This subject's Midterm category already has an entry.",
        });
      }
      if (percentage === undefined || percentage === null) {
        return res
          .status(400)
          .json({ error: "Midterm requires a percentage." });
      }
    }

    const item = await GradeItem.create({
      subject: subjectId,
      category: categoryId,
      instanceNumber: category.isMidterm ? null : instanceNumber,
      obtained: category.isMidterm ? null : obtained,
      max: category.isMidterm ? null : max,
      percentage: category.isMidterm ? percentage : null,
      date: date || "",
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a grade item
router.put("/:id", async (req, res) => {
  try {
    const { instanceNumber, obtained, max, percentage, date } = req.body;
    const item = await GradeItem.findById(req.params.id).populate("category");
    if (!item) return res.status(404).json({ error: "Grade item not found" });

    const isMidterm = item.category?.isMidterm;
    const update = {};
    if (instanceNumber !== undefined)
      update.instanceNumber = isMidterm ? null : instanceNumber;
    if (obtained !== undefined) update.obtained = isMidterm ? null : obtained;
    if (max !== undefined) update.max = isMidterm ? null : max;
    if (percentage !== undefined)
      update.percentage = isMidterm ? percentage : null;
    if (date !== undefined) update.date = date;

    const updated = await GradeItem.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a grade item
router.delete("/:id", async (req, res) => {
  await GradeItem.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
