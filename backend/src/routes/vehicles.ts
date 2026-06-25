import { Router, Request, Response } from "express";
import { prisma } from "../prisma";
import { ensureDemoUser } from "../demoUser";

const router = Router();

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Validate and normalise the vehicle fields from the request body.
 * Returns either { data } or { error } (a human-readable message).
 */
function parseVehicleInput(body: unknown, partial = false) {
  const b = (body ?? {}) as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const brandName = str(b.brandName);
  const model = str(b.model);
  const fuelType = str(b.fuelType);
  const registrationNumber = str(b.registrationNumber).toUpperCase();
  const vehicleType = str(b.vehicleType);

  // For create, these fields are required.
  if (!partial) {
    if (!brandName) return { error: "Vehicle Brand Name is required" };
    if (!model) return { error: "Vehicle Model is required" };
    if (!fuelType) return { error: "Fuel Type is required" };
    if (!registrationNumber) return { error: "Registration Number is required" };
  }

  // Registered Year: must be a realistic vehicle year.
  let registeredYear: number | undefined;
  if (b.registeredYear !== undefined && b.registeredYear !== null && b.registeredYear !== "") {
    registeredYear = Number(b.registeredYear);
    if (!Number.isInteger(registeredYear) || registeredYear < 1900 || registeredYear > CURRENT_YEAR + 1) {
      return { error: `Registered Year must be between 1900 and ${CURRENT_YEAR + 1}` };
    }
  } else if (!partial) {
    return { error: "Registered Year is required" };
  }

  // Mileage: optional, non-negative integer.
  let mileage: number | null | undefined;
  if (b.mileage === undefined || b.mileage === null || b.mileage === "") {
    mileage = partial ? undefined : null;
  } else {
    mileage = Number(b.mileage);
    if (!Number.isInteger(mileage) || mileage < 0) {
      return { error: "Mileage must be a positive whole number" };
    }
  }

  const data: Record<string, unknown> = {};
  if (brandName || !partial) data.brandName = brandName;
  if (model || !partial) data.model = model;
  if (fuelType || !partial) data.fuelType = fuelType;
  if (registrationNumber || !partial) data.registrationNumber = registrationNumber;
  if (registeredYear !== undefined) data.registeredYear = registeredYear;
  data.vehicleType = vehicleType || null;
  if (mileage !== undefined) data.mileage = mileage;

  return { data };
}

// CREATE -------------------------------------------------------------------
router.post("/", async (req: Request, res: Response) => {
  const parsed = parseVehicleInput(req.body, false);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  try {
    const ownerId = await ensureDemoUser();
    const vehicle = await prisma.vehicle.create({
      data: { ...(parsed.data as any), ownerId },
    });
    res.status(201).json(vehicle);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "A vehicle with that Registration Number already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not create vehicle" });
  }
});

// LIST ---------------------------------------------------------------------
router.get("/", async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not list vehicles" });
  }
});

// GET ONE ------------------------------------------------------------------
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not get vehicle" });
  }
});

// UPDATE -------------------------------------------------------------------
router.put("/:id", async (req: Request, res: Response) => {
  const parsed = parseVehicleInput(req.body, true);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: parsed.data as any,
    });
    res.json(vehicle);
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Vehicle not found" });
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "A vehicle with that Registration Number already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not update vehicle" });
  }
});

// DELETE -------------------------------------------------------------------
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Vehicle not found" });
    console.error(err);
    res.status(500).json({ error: "Could not delete vehicle" });
  }
});

export default router;
