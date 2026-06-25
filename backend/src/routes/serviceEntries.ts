import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import {
  parseFlexibleDate,
  computeRecommendedServiceDate,
  isoToDate,
} from "../dates";

const router = Router();

interface ParsedEntry {
  data: Record<string, unknown>;
}

/**
 * Validate and normalise the service-entry fields.
 * Dates are accepted in flexible formats and stored as clean dates.
 * The Recommended Service Date is always derived from the Service Date
 * (it is never set manually).
 */
function parseEntryInput(
  body: unknown,
  partial: boolean
): { error: string } | ParsedEntry {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const data: Record<string, unknown> = {};

  // vehicleId
  const vehicleId = str(b.vehicleId);
  if (!partial && !vehicleId) return { error: "Please select a vehicle" };
  if (vehicleId) data.vehicleId = vehicleId;

  // entryType
  const entryType = str(b.entryType);
  if (!partial && !entryType) return { error: "Entry Type is required" };
  if (entryType) data.entryType = entryType;

  // serviceType
  const serviceType = str(b.serviceType);
  if (!partial && !serviceType) return { error: "Service Type is required" };
  if (serviceType) data.serviceType = serviceType;

  // status
  const status = str(b.status);
  if (!partial && !status) return { error: "Status is required" };
  if (status) data.status = status;

  // category (optional)
  if (b.category !== undefined) data.category = str(b.category) || null;

  // notes (optional)
  if (b.notes !== undefined) data.notes = str(b.notes) || null;

  // amount (optional, non-negative)
  if (b.amount !== undefined && b.amount !== null && b.amount !== "") {
    const amount = Number(b.amount);
    if (Number.isNaN(amount)) return { error: "Amount must be a number" };
    if (amount < 0) return { error: "Amount cannot be negative" };
    data.amount = amount;
  } else if (b.amount === "" || b.amount === null) {
    data.amount = null;
  }

  // serviceDate (required on create) -> also drives recommendedServiceDate
  if (b.serviceDate !== undefined && b.serviceDate !== null && b.serviceDate !== "") {
    const iso = parseFlexibleDate(b.serviceDate);
    if (!iso) return { error: "Service Date is not a valid date" };
    data.serviceDate = isoToDate(iso);
    data.recommendedServiceDate = isoToDate(computeRecommendedServiceDate(iso));
  } else if (!partial) {
    return { error: "Service Date is required" };
  }

  // motDueDate (optional, kept SEPARATE from recommendedServiceDate)
  if (b.motDueDate !== undefined) {
    if (b.motDueDate === null || b.motDueDate === "") {
      data.motDueDate = null;
    } else {
      const iso = parseFlexibleDate(b.motDueDate);
      if (!iso) return { error: "MOT Due Date is not a valid date" };
      data.motDueDate = isoToDate(iso);
    }
  }

  return { data };
}

// CREATE -------------------------------------------------------------------
router.post("/", async (req: Request, res: Response) => {
  const parsed = parseEntryInput(req.body, false);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  // Entry must belong to an existing vehicle.
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parsed.data.vehicleId as string },
  });
  if (!vehicle) return res.status(400).json({ error: "Selected vehicle does not exist" });

  try {
    const entry = await prisma.serviceEntry.create({
      data: parsed.data as any,
      include: { vehicle: true },
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create entry" });
  }
});

// LIST ---------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const entries = await prisma.serviceEntry.findMany({
      orderBy: { serviceDate: "desc" },
      include: { vehicle: true },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not list entries" });
  }
});

// GET ONE ------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const entry = await prisma.serviceEntry.findUnique({
      where: { id: req.params.id },
      include: { vehicle: true },
    });
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not get entry" });
  }
});

// UPDATE -------------------------------------------------------------------
router.put("/:id", async (req: Request, res: Response) => {
  const parsed = parseEntryInput(req.body, true);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  // If the vehicle is being changed, make sure it exists.
  if (parsed.data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parsed.data.vehicleId as string },
    });
    if (!vehicle) return res.status(400).json({ error: "Selected vehicle does not exist" });
  }

  try {
    const entry = await prisma.serviceEntry.update({
      where: { id: req.params.id },
      data: parsed.data as any,
      include: { vehicle: true },
    });
    res.json(entry);
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Entry not found" });
    console.error(err);
    res.status(500).json({ error: "Could not update entry" });
  }
});

// DELETE -------------------------------------------------------------------
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.serviceEntry.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Entry not found" });
    console.error(err);
    res.status(500).json({ error: "Could not delete entry" });
  }
});

export default router;
