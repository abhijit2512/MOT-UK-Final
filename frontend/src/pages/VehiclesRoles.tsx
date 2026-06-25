/**
 * Vehicles & Roles — placeholder screen (Phase 2).
 * The vehicle/car builder and role assignment come in a later phase.
 */
export default function VehiclesRoles() {
  return (
    <div>
      <h1 className="page-title">Vehicles &amp; Roles</h1>
      <p className="page-subtitle">Manage vehicle profiles and user roles.</p>

      <div className="card">
        <span className="badge">Coming soon</span>
        <h3 style={{ marginTop: 10 }}>Vehicle builder</h3>
        <p>
          This screen will let you create and edit a vehicle profile
          (registration number, brand, model, registered year, fuel type,
          vehicle type, mileage) and assign a user/role.
        </p>
      </div>

      <div className="placeholder-note">
        Phase 2 foundation: this is a placeholder screen so navigation works.
      </div>
    </div>
  );
}
