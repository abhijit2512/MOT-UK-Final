import "dotenv/config";
import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles";
import serviceEntriesRouter from "./routes/serviceEntries";
import { dashboardRouter, reportsRouter, remindersRouter } from "./routes/insights";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Allow the frontend (running on a different port) to call this API.
app.use(cors());
app.use(express.json());

// Vehicle endpoints (Phase 3).
app.use("/api/vehicles", vehiclesRouter);

// Service / MOT entry endpoints (Phase 4).
app.use("/api/entries", serviceEntriesRouter);

// Dashboard, reports and reminders (Phase 5).
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/reminders", remindersRouter);

/**
 * Health check route.
 * Used to confirm the backend is running. Visit:
 *   http://localhost:4000/api/health
 */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mot-uk-backend",
    phase: "Phase 2 - Foundation",
    timestamp: new Date().toISOString(),
  });
});

// Simple root route so the base URL doesn't show an error.
app.get("/", (_req, res) => {
  res.send("MOT-UK backend is running. Try GET /api/health");
});

app.listen(PORT, () => {
  console.log(`MOT-UK backend listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
