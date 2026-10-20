import { useState } from "react";
import Icon from "../components/Icon";
import MedalBadge from "../components/MedalBadge";
import { EXERCISES, getExercise } from "../data/exercises";
import { buildLeaderboard, getMedalStatus, fmtKg } from "../utils/stats";

// ---------------------------------------------------------------------------
// FRIENDS / LEADERBOARD: pick "Overall" or one exercise from the dropdown and
// see how you stack up. Friends are demo data for now (data/friends.js).
//
// TODO (friends feature): needs a backend to store accounts and totals.
// Once /api/friends exists, load it in App.jsx and pass it in as `friends`.
// ---------------------------------------------------------------------------
export default function Leaderboard({ friends, totals, profile }) {
  const [exerciseId, setExerciseId] = useState("overall");
  const [showInfo, setShowInfo] = useState(false);

  const rows = buildLeaderboard(friends, totals, profile.name, exerciseId);
  const myIndex = rows.findIndex((r) => r.isYou);
  const ex = exerciseId === "overall" ? null : getExercise(exerciseId);

  // Message such as "You are 4.2k kg behind Sara" or "You lead the board".
  let gapText = "You lead the board. Keep going!";
  if (myIndex > 0) {
    gapText = `${fmtKg(rows[myIndex - 1].total - rows[myIndex].total)} kg behind ${rows[myIndex - 1].name}`;
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Friends</h1>
        <div className="row gap">
          <select className="select" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)} aria-label="Leaderboard category">
            <option value="overall">Overall (all exercises)</option>
            {EXERCISES.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button className="btn ghost" onClick={() => setShowInfo((s) => !s)}><Icon name="plus" size={16} /> Add friend</button>
        </div>
      </div>

      {showInfo && (
        <p className="notice">Adding real friends needs a backend (accounts + shared data). See the TODO at the top of pages/Leaderboard.jsx.</p>
      )}

      <section className="card">
        <div className="card-head">
          <h2>{ex ? ex.name : "Overall"}</h2>
          <span className="muted small">{gapText}</span>
        </div>

        <div className="stack">
          {rows.map((r, i) => {
            // Per-exercise board shows each person's medal; overall shows medal count.
            const tier = ex ? getMedalStatus(ex, r.total).tier : null;
            return (
              <div className={"lb-row" + (r.isYou ? " you" : "") + (i < 3 ? ` top-${i + 1}` : "")} key={r.id}>
                <span className="lb-rank">{i + 1}</span>
                <span className="avatar">{r.name.charAt(0).toUpperCase()}</span>
                <span className="lb-name">{r.isYou ? `${r.name} (you)` : r.name}</span>
                <span className="lb-extra">
                  {ex ? <MedalBadge tier={tier} size={28} /> : <span className="muted small">{r.medals} medals</span>}
                </span>
                <span className="lb-total">{fmtKg(r.total)} kg</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
