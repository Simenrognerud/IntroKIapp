import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

// ---------------------------------------------------------------------------
// HEADER: logo, main navigation (desktop), level badge and the profile
// dropdown menu. Add new menu entries in the <div className="dropdown-menu">.
// ---------------------------------------------------------------------------
export default function Header({ pages, page, setPage, profile, level, hasActiveWorkout, onSettings, onDemo, onExport, onReset }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Runs a menu action and closes the menu.
  const choose = (fn) => () => {
    setMenuOpen(false);
    fn();
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo: click to go home */}
        <button className="logo" onClick={() => setPage("home")}>
          <span className="logo-mark"><Icon name="dumbbell" size={18} /></span>
          LiftRank
        </button>

        {/* Main navigation (hidden on phones, the bottom bar takes over) */}
        <nav className="top-nav" aria-label="Main">
          {pages.map((p) => (
            <button key={p.id} className={"nav-link" + (page === p.id ? " active" : "")} onClick={() => setPage(p.id)}>
              <Icon name={p.icon} size={18} />
              {p.label}
              {p.id === "workout" && hasActiveWorkout && <span className="live-dot" title="Workout in progress" />}
            </button>
          ))}
        </nav>

        {/* Level badge + profile dropdown */}
        <div className="header-right">
          <span className="level-pill">Lv {level}</span>
          <div className="dropdown" ref={menuRef}>
            <button className="user-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <span className="avatar">{(profile.name || "?").charAt(0).toUpperCase()}</span>
              <span className="user-name">{profile.name}</span>
              <Icon name="chevron" size={16} />
            </button>

            {menuOpen && (
              <div className="dropdown-menu" role="menu">
                <button className="menu-item" onClick={choose(onSettings)}><Icon name="user" size={16} /> Profile &amp; settings</button>
                <button className="menu-item" onClick={choose(onDemo)}><Icon name="play" size={16} /> Load demo data</button>
                <button className="menu-item" onClick={choose(onExport)}><Icon name="download" size={16} /> Export my data</button>
                <div className="menu-sep" />
                <button className="menu-item danger" onClick={choose(onReset)}><Icon name="trash" size={16} /> Reset everything</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
