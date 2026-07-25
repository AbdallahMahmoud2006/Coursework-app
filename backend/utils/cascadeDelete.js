import fs from "fs";
import path from "path";
import Week from "../models/Week.js";
import Pdf from "../models/Pdf.js";
import Category from "../models/Category.js";
import GradeItem from "../models/GradeItem.js";
import Event from "../models/Event.js";
import { UPLOADS_DIR } from "../config/upload.js";

// Deletes a Week and every PDF that belongs to it, including the files on disk.
export async function cascadeDeleteWeek(weekId) {
  const pdfs = await Pdf.find({ week: weekId });
  for (const pdf of pdfs) {
    const filePath = path.join(UPLOADS_DIR, pdf.storedFilename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await Pdf.deleteMany({ week: weekId });
  await Week.findByIdAndDelete(weekId);
}

// Deletes a Subject and everything nested under it:
// every Week (+ its PDFs/files), every Category (+ its GradeItems).
// Events that reference this subject are kept, but unlinked (subject set to null)
// rather than deleted, since a deadline/exam is still worth remembering.
export async function cascadeDeleteSubject(subjectId) {
  const weeks = await Week.find({ subject: subjectId });
  for (const week of weeks) {
    await cascadeDeleteWeek(week._id);
  }

  const categories = await Category.find({ subject: subjectId });
  for (const category of categories) {
    await GradeItem.deleteMany({ category: category._id });
  }
  await Category.deleteMany({ subject: subjectId });

  await Event.updateMany({ subject: subjectId }, { subject: null });
}
