import mongoose from "mongoose";

const gradeItemSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    instanceNumber: { type: Number, default: null }, // null when category.isMidterm
    obtained: { type: Number, default: null }, // null when category.isMidterm
    max: { type: Number, default: null }, // null when category.isMidterm
    percentage: { type: Number, default: null }, // only used when category.isMidterm
    date: { type: String, default: "" }, // free-text, per design
  },
  { timestamps: true }
);

export default mongoose.model("GradeItem", gradeItemSchema);
