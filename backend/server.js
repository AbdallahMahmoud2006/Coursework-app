import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import weekRoutes from "./routes/weekRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import gradeItemRoutes from "./routes/gradeItemRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/semesters", semesterRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/grade-items", gradeItemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);

// Serve the built frontend (run `npm run build` in /frontend first), so the
// whole app is reachable from this one process — no separate frontend server.
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
