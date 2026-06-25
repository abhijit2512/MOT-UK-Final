/**
 * Reminders — placeholder screen (Phase 2).
 * Reminder list and statuses come in a later phase.
 */
export default function Reminders() {
  return (
    <div>
      <h1 className="page-title">Reminders</h1>
      <p className="page-subtitle">Upcoming MOT &amp; service reminders.</p>

      <div className="card">
        <span className="badge">Coming soon</span>
        <h3 style={{ marginTop: 10 }}>Reminder list</h3>
        <p>
          This screen will list reminders with statuses such as Upcoming, Due
          Soon, and Overdue.
        </p>
      </div>

      <div className="placeholder-note">
        Phase 2 foundation: this is a placeholder screen so navigation works.
      </div>
    </div>
  );
}
