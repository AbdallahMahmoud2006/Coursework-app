import mongoose from "mongoose";

const weekSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    topics: [{ type: String, trim: true }],
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Week", weekSchema);
