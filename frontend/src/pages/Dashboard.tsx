/**
 * Dashboard — placeholder screen (Phase 2).
 * Bar charts and live data come in a later phase.
 */
export default function Dashboard() {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Overview of your vehicle's MOT &amp; service status.</p>

      <div className="card">
        <span className="badge">Coming soon</span>
        <h3 style={{ marginTop: 10 }}>Bar charts</h3>
        <p>
          This screen will show bar charts only (service costs over time, MOT
          pass/fail counts, etc.). Charts are added in a later phase.
        </p>
      </div>

      <div className="card">
        <h3>Quick status</h3>
        <p>Last MOT, next MOT due date, and recommended service date will appear here.</p>
      </div>

      <div className="placeholder-note">
        Phase 2 foundation: this is a placeholder screen so navigation works.
      </div>
    </div>
  );
}
