import Icon from "./Icon";

// ---------------------------------------------------------------------------
// FOOTER: a slim info bar (desktop) plus the bottom tab bar (phones).
// The bottom tab bar is what makes the app feel like a real mobile app.
// ---------------------------------------------------------------------------
export default function Footer({ pages, page, setPage, hasActiveWorkout }) {
  return (
    <>
      <footer className="footer">
        <span>LiftRank v0.1 · school project</span>
        <span>Your data is stored in this browser</span>
      </footer>

      <nav className="bottom-nav" aria-label="Main (mobile)">
        {pages.map((p) => (
          <button key={p.id} className={"tab" + (page === p.id ? " active" : "")} onClick={() => setPage(p.id)}>
            <span className="tab-icon">
              <Icon name={p.icon} size={22} />
              {p.id === "workout" && hasActiveWorkout && <span className="live-dot" />}
            </span>
            <span>{p.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
