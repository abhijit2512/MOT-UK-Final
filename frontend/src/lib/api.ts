/* ---------------------------------------------------------------------------
   Small API client for talking to the backend.
   The base URL comes from VITE_API_URL (see frontend/.env.example).
--------------------------------------------------------------------------- */

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export interface Vehicle {
  id: string;
  brandName: string;
  model: string;
  registeredYear: number;
  fuelType: string;
  registrationNumber: string;
  vehicleType: string | null;
  mileage: number | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields the form sends when creating/updating a vehicle. */
export interface VehicleInput {
  brandName: string;
  model: string;
  registeredYear: number | string;
  fuelType: string;
  registrationNumber: string;
  vehicleType?: string;
  mileage?: number | string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export interface ServiceEntry {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  entryType: string;
  serviceType: string;
  category: string | null;
  serviceDate: string;
  recommendedServiceDate: string | null;
  motDueDate: string | null;
  amount: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Fields the form sends when creating/updating an entry. Dates are strings. */
export interface ServiceEntryInput {
  vehicleId: string;
  entryType: string;
  serviceType: string;
  category?: string;
  serviceDate: string;
  motDueDate?: string;
  amount?: number | string;
  status: string;
  notes?: string;
}

export const vehiclesApi = {
  list(): Promise<Vehicle[]> {
    return fetch(`${API_URL}/api/vehicles`).then((r) => handle<Vehicle[]>(r));
  },

  get(id: string): Promise<Vehicle> {
    return fetch(`${API_URL}/api/vehicles/${id}`).then((r) => handle<Vehicle>(r));
  },

  create(input: VehicleInput): Promise<Vehicle> {
    return fetch(`${API_URL}/api/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<Vehicle>(r));
  },

  update(id: string, input: VehicleInput): Promise<Vehicle> {
    return fetch(`${API_URL}/api/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<Vehicle>(r));
  },

  remove(id: string): Promise<{ ok: boolean }> {
    return fetch(`${API_URL}/api/vehicles/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ ok: boolean }>(r)
    );
  },
};

export const entriesApi = {
  list(): Promise<ServiceEntry[]> {
    return fetch(`${API_URL}/api/entries`).then((r) => handle<ServiceEntry[]>(r));
  },

  get(id: string): Promise<ServiceEntry> {
    return fetch(`${API_URL}/api/entries/${id}`).then((r) => handle<ServiceEntry>(r));
  },

  create(input: ServiceEntryInput): Promise<ServiceEntry> {
    return fetch(`${API_URL}/api/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<ServiceEntry>(r));
  },

  update(id: string, input: Partial<ServiceEntryInput>): Promise<ServiceEntry> {
    return fetch(`${API_URL}/api/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handle<ServiceEntry>(r));
  },

  remove(id: string): Promise<{ ok: boolean }> {
    return fetch(`${API_URL}/api/entries/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ ok: boolean }>(r)
    );
  },
};
