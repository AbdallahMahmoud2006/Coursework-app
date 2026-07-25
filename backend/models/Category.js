import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    name: { type: String, required: true, trim: true }, // e.g. "Quizzes", "Midterm"
    weight: { type: Number, required: true, min: 0, max: 100 }, // % of subject total
    keepBestN: { type: Number, default: null }, // null = count all items
    isMidterm: { type: Boolean, default: false }, // only one per subject, percentage-only
    isFinal: { type: Boolean, default: false }, // only one per subject; used by the reverse calculator
    isFinal: { type: Boolean, default: false }, // only one per subject, drives the reverse calculator
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
