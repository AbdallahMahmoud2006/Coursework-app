import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedFilename: { type: String, required: true },
    week: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Week",
      required: true,
    },
    difficulty: { type: Number, min: 1, max: 10, default: null },
    hoursToFinish: { type: Number, default: null },
    notes: { type: String, default: "" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Pdf", pdfSchema);
