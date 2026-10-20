import Icon from "../components/Icon";
import MedalBadge from "../components/MedalBadge";
import { EXERCISES } from "../data/exercises";
import {
  sumTotals, levelInfo, lastSevenDays, countMedals, weeklyStreak, workoutsThisWeek,
  getMedalStatus, buildLeaderboard, workoutVolume, fmtKg, fmtDate,
} from "../utils/stats";

// ---------------------------------------------------------------------------
// HOME: the overview screen. Everything here is read-only; it just summarises
// data computed in utils/stats.js. Each <section className="card"> is one
// block, so you can reorder, remove or add blocks easily.
// ---------------------------------------------------------------------------
export default function Home({ workouts, totals, profile, friends, hasActiveWorkout, goTo }) {
  const bw = profile.bodyweightKg;
  const totalKg = sumTotals(totals);
  const level = levelInfo(totalKg, workouts.length);
  const week = lastSevenDays(workouts, bw);
  const weekMax = Math.max(...week.map((d) => d.kg), 1);

  // The 3 exercises closest to their next medal (only ones you have trained).
  const closest = EXERCISES
    .map((ex) => ({ ex, total: totals[ex.id] || 0, status: getMedalStatus(ex, totals[ex.id] || 0) }))
    .filter((x) => x.total > 0 && x.status.next)
    .sort((a, b) => b.status.progress - a.status.progress)
    .slice(0, 3);

  // Overall friend ranking, just the top 3 plus you.
  const board = buildLeaderboard(friends, totals, profile.name, "overall");
  const myRank = board.findIndex((r) => r.isYou) + 1;
  const boardPreview = board.slice(0, 3);
  if (myRank > 3) boardPreview.push(board[myRank - 1]);

  const recent = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div className="page">
      {/* ---------- Hero: greeting, level, start button ---------- */}
      <section className="card hero">
        <div>
          <h1>Hey {profile.name}</h1>
          <p className="muted">
            {workouts.length === 0
              ? "No workouts yet. Start your first one or load demo data from the profile menu."
              : `Level ${level.level} · ${level.toNext} XP to level ${level.level + 1}`}
          </p>
          <div className="progress thin"><div style={{ width: `${Math.round(level.progress * 100)}%` }} /></div>
        </div>
        <button className="btn primary large" onClick={() => goTo("workout")}>
          <Icon name="play" size={18} />
          {hasActiveWorkout ? "Resume workout" : "Start workout"}
        </button>
      </section>

      {/* ---------- Stat tiles ---------- */}
      <div className="tiles">
        <div className="tile"><span className="tile-value">{fmtKg(totalKg)}</span><span className="tile-label">kg lifted, all-time</span></div>
        <div className="tile"><span className="tile-value">{workoutsThisWeek(workouts)}</span><span className="tile-label">workouts this week</span></div>
        <div className="tile"><span className="tile-value"><Icon name="flame" size={20} /> {weeklyStreak(workouts)}</span><span className="tile-label">week streak</span></div>
        <div className="tile"><span className="tile-value">{countMedals(totals)}</span><span className="tile-label">medals earned</span></div>
      </div>

      <div className="grid-2">
        {/* ---------- Last 7 days chart ---------- */}
        <section className="card">
          <h2>Last 7 days</h2>
          <div className="bars">
            {week.map((d) => (
              <div className="bar-col" key={d.start} title={`${Math.round(d.kg)} kg`}>
                <div className="bar-track"><div className="bar-fill" style={{ height: `${(d.kg / weekMax) * 100}%` }} /></div>
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Next medals ---------- */}
        <section className="card">
          <div className="card-head">
            <h2>Next medals</h2>
            <button className="link" onClick={() => goTo("ranks")}>All ranks</button>
          </div>
          {closest.length === 0 && <p className="muted">Log a workout to start climbing the ranks.</p>}
          <div className="stack">
            {closest.map(({ ex, status }) => (
              <div className="next-row" key={ex.id}>
                <MedalBadge tier={status.next} size={34} />
                <div className="grow">
                  <div className="row between"><strong>{ex.name}</strong><span className="muted small">{fmtKg(status.remaining)} kg to {status.next.name}</span></div>
                  <div className="progress"><div style={{ width: `${Math.round(status.progress * 100)}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Friends snapshot ---------- */}
        <section className="card">
          <div className="card-head">
            <h2>Friends ranking</h2>
            <button className="link" onClick={() => goTo("friends")}>Full board</button>
          </div>
          <div className="stack">
            {boardPreview.map((r) => (
              <div className={"lb-row compact" + (r.isYou ? " you" : "")} key={r.id}>
                <span className="lb-rank">#{board.indexOf(r) + 1}</span>
                <span className="lb-name">{r.isYou ? `${r.name} (you)` : r.name}</span>
                <span className="lb-total">{fmtKg(r.total)} kg</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Recent workouts ---------- */}
        <section className="card">
          <div className="card-head">
            <h2>Recent workouts</h2>
            <button className="link" onClick={() => goTo("history")}>History</button>
          </div>
          {recent.length === 0 && <p className="muted">Nothing logged yet.</p>}
          <div className="stack">
            {recent.map((w) => (
              <div className="recent-row" key={w.id}>
                <div><strong>{w.name}</strong><div className="muted small">{fmtDate(w.date)} · {w.entries.length} exercises</div></div>
                <span className="muted">{fmtKg(workoutVolume(w, bw))} kg</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
