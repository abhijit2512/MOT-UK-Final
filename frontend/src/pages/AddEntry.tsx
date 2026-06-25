/**
 * Add Entry — placeholder screen (Phase 2).
 * Manual + voice entry forms come in a later phase.
 */
export default function AddEntry() {
  return (
    <div>
      <h1 className="page-title">Add Entry</h1>
      <p className="page-subtitle">Record a new MOT or service entry.</p>

      <div className="card">
        <span className="badge">Coming soon</span>
        <h3 style={{ marginTop: 10 }}>Manual &amp; voice entry</h3>
        <p>
          This screen will let you add an entry by typing or by voice. Voice
          input will fill the form, show a preview, and let you correct it
          before saving.
        </p>
      </div>

      <div className="placeholder-note">
        Phase 2 foundation: this is a placeholder screen so navigation works.
      </div>
    </div>
  );
}
