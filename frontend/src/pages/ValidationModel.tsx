/**
 * Validation Model — HIDDEN / INTERNAL ONLY.
 *
 * This screen must NOT appear in the menu bar, sidebar, bottom navigation,
 * or any visible app navigation. It is intentionally left out of BottomNav.
 * It is reachable only by typing the URL directly:
 *     /internal/validation-model
 *
 * Its real purpose (data/validation logic) is implemented in a later phase.
 */
export default function ValidationModel() {
  return (
    <div>
      <h1 className="page-title">Validation Model</h1>
      <p className="page-subtitle">Internal only — not part of app navigation.</p>

      <div className="card">
        <span className="badge">Internal</span>
        <h3 style={{ marginTop: 10 }}>Hidden screen</h3>
        <p>
          This is an internal-only screen used by the app behind the scenes. It
          is intentionally hidden from all navigation.
        </p>
      </div>
    </div>
  );
}
