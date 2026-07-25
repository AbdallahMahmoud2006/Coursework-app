import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["exam", "deadline", "other"],
      required: true,
    },
    description: { type: String, default: "" },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    reminderLeadDays: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
