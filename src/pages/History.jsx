import { useState } from "react";
import Icon from "../components/Icon";
import { getExercise } from "../data/exercises";
import { workoutVolume, entryVolume, fmtKg, fmtDate, fmtDuration } from "../utils/stats";

// ---------------------------------------------------------------------------
// HISTORY: every finished workout, newest first. Tap one to expand its sets.
// Deleting a workout also removes its kg from your totals and medals.
// ---------------------------------------------------------------------------
export default function History({ workouts, profile, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const bw = profile.bodyweightKg;

  const sorted = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page">
      <h1 className="page-title">History</h1>
      {sorted.length === 0 && <section className="card"><p className="muted">No finished workouts yet.</p></section>}

      {sorted.map((w) => {
        const open = openId === w.id;
        return (
          <section className="card" key={w.id}>
            <button className="history-head" onClick={() => setOpenId(open ? null : w.id)} aria-expanded={open}>
              <div>
                <strong>{w.name}</strong>
                <div className="muted small">{fmtDate(w.date)} · {fmtDuration(w.durationSec)} · {w.entries.length} exercises</div>
              </div>
              <div className="row gap">
                <span>{fmtKg(workoutVolume(w, bw))} kg</span>
                <span className={"chev" + (open ? " open" : "")}><Icon name="chevron" size={18} /></span>
              </div>
            </button>

            {open && (
              <div className="history-body">
                {w.entries.map((e) => (
                  <div className="history-entry" key={e.uid}>
                    <div className="row between">
                      <strong>{getExercise(e.exerciseId)?.name || e.exerciseId}</strong>
                      <span className="muted small">{fmtKg(entryVolume(e, bw))} kg</span>
                    </div>
                    <div className="muted small">{e.sets.map((s) => `${s.weight} × ${s.reps}`).join("  ·  ")}</div>
                  </div>
                ))}

                <div className="row end">
                  {confirmId === w.id ? (
                    <span className="row gap">
                      <span className="muted">Delete this workout?</span>
                      <button className="btn danger small" onClick={() => { onDelete(w.id); setConfirmId(null); }}>Delete</button>
                      <button className="btn ghost small" onClick={() => setConfirmId(null)}>Keep</button>
                    </span>
                  ) : (
                    <button className="link danger" onClick={() => setConfirmId(w.id)}>Delete workout</button>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
