import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    dueDate: { type: String, default: "" }, // free-text, consistent with grade item dates
    linkedWeek: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Week",
      default: null,
    },
    linkedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
