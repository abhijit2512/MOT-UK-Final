/**
 * Reports — placeholder screen (Phase 2).
 * From/To date filtering and report output come in a later phase.
 */
export default function Reports() {
  return (
    <div>
      <h1 className="page-title">Reports</h1>
      <p className="page-subtitle">Generate service &amp; MOT reports by date range.</p>

      <div className="card">
        <span className="badge">Coming soon</span>
        <h3 style={{ marginTop: 10 }}>Date-range report</h3>
        <p>
          This screen will show a <strong>From Date</strong> and{" "}
          <strong>To Date</strong> side by side, then list entries in that range.
        </p>
      </div>

      <div className="placeholder-note">
        Phase 2 foundation: this is a placeholder screen so navigation works.
      </div>
    </div>
  );
}
