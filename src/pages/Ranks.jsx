import { useState } from "react";
import Icon from "../components/Icon";
import MedalBadge from "../components/MedalBadge";
import { EXERCISES, MUSCLE_GROUPS } from "../data/exercises";
import { getMedalStatus, fmtKg } from "../utils/stats";

// ---------------------------------------------------------------------------
// RANKS: every exercise has its own ranked mode. Each card shows your all-time
// kg, your current medal, progress to the next one and the full tier ladder.
// ---------------------------------------------------------------------------
export default function Ranks({ totals, onHowTo }) {
  const [muscle, setMuscle] = useState("All");
  const [sort, setSort] = useState("progress");

  const cards = EXERCISES
    .filter((ex) => muscle === "All" || ex.muscle === muscle)
    .map((ex) => ({ ex, total: totals[ex.id] || 0, status: getMedalStatus(ex, totals[ex.id] || 0) }))
    .sort((a, b) => {
      if (sort === "name") return a.ex.name.localeCompare(b.ex.name);
      if (sort === "total") return b.total - a.total;
      return b.status.tierIndex - a.status.tierIndex || b.status.progress - a.status.progress; // medal, then progress
    });

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Ranks</h1>
        <div className="row gap">
          <select className="select" value={muscle} onChange={(e) => setMuscle(e.target.value)} aria-label="Filter by muscle">
            <option value="All">All muscles</option>
            {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="progress">Sort: best rank</option>
            <option value="total">Sort: most kg</option>
            <option value="name">Sort: name</option>
          </select>
        </div>
      </div>

      <div className="grid-cards">
        {cards.map(({ ex, total, status }) => (
          <section className="card rank-card" key={ex.id}>
            <div className="row between">
              <div className="row gap">
                <MedalBadge tier={status.tier} size={44} />
                <div>
                  <h3>{ex.name}</h3>
                  <span className="muted small">{ex.muscle} · {status.tier ? status.tier.name : "Unranked"}</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => onHowTo(ex)} aria-label={`How to do ${ex.name}`}><Icon name="info" size={18} /></button>
            </div>

            <div className="rank-total"><strong>{fmtKg(total)}</strong> <span className="muted">kg lifted</span></div>

            {status.next ? (
              <>
                <div className="progress"><div style={{ width: `${Math.round(status.progress * 100)}%` }} /></div>
                <span className="muted small">{fmtKg(status.remaining)} kg to {status.next.name}</span>
              </>
            ) : (
              <span className="muted small">Max rank reached</span>
            )}

            {/* The full ladder: earned tiers are coloured, locked ones are grey */}
            <div className="tier-row">
              {status.thresholds.map((t, i) => (
                <div className="tier" key={t.id} title={`${t.name}: ${t.kg.toLocaleString("en-GB")} kg`}>
                  <MedalBadge tier={i <= status.tierIndex ? t : null} size={26} />
                  <span className="muted tiny">{fmtKg(t.kg)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
