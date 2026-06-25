import "dotenv/config";
import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Allow the frontend (running on a different port) to call this API.
app.use(cors());
app.use(express.json());

// Vehicle endpoints (Phase 3).
app.use("/api/vehicles", vehiclesRouter);

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
