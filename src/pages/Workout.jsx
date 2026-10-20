import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import ExercisePicker from "../components/ExercisePicker";
import { getExercise, TEMPLATES } from "../data/exercises";
import { uid, setVolume, fmtDuration, fmtKg } from "../utils/stats";

// ---------------------------------------------------------------------------
// WORKOUT: start a session, add exercises, log sets, finish.
//
// `active` is the workout in progress (or null). It is saved in the browser by
// App.jsx, so a page refresh does not lose it. Shape:
//   { id, name, startedAt, entries: [ { uid, exerciseId, sets: [ {weight, reps, done} ] } ] }
// Only sets you tick as done are counted when you finish.
// ---------------------------------------------------------------------------

const newEntry = (exerciseId) => ({ uid: uid(), exerciseId, sets: [{ weight: "", reps: "", done: false }] });

// Your most recent set of an exercise (used as placeholder / auto-fill).
function lastSetOf(workouts, exerciseId) {
  let best = null;
  for (const w of workouts) {
    for (const e of w.entries) {
      if (e.exerciseId === exerciseId && e.sets.length && (!best || new Date(w.date) > new Date(best.date))) {
        best = { date: w.date, set: e.sets[e.sets.length - 1] };
      }
    }
  }
  return best ? best.set : null;
}

export default function Workout({ active, setActive, workouts, profile, onFinish, onHowTo }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState(Date.now());       // ticks every second (timers)
  const [restEnd, setRestEnd] = useState(null);     // timestamp when rest ends
  const [restLen, setRestLen] = useState(90);       // rest length in seconds
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ----- Starting a workout -----
  const start = (name, exerciseIds = []) => {
    setActive({ id: uid(), name, startedAt: Date.now(), entries: exerciseIds.map(newEntry) });
    setMessage("");
  };

  if (!active) {
    return (
      <div className="page">
        <h1 className="page-title">Workout</h1>
        <section className="card">
          <h2>Start a workout</h2>
          <button className="btn primary large" onClick={() => start("Workout")}>
            <Icon name="plus" size={18} /> Empty workout
          </button>
        </section>

        <section className="card">
          <h2>Quick start</h2>
          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <button key={t.id} className="template" onClick={() => start(t.name, t.exercises)}>
                <strong>{t.name}</strong>
                <span className="muted small">{t.exercises.map((id) => getExercise(id)?.name).join(" · ")}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ----- Editing the active workout -----
  // mutate(fn): copies the workout, lets fn change the copy, saves it.
  const mutate = (fn) => setActive((prev) => { const copy = structuredClone(prev); fn(copy); return copy; });
  const entryOf = (draft, entryUid) => draft.entries.find((e) => e.uid === entryUid);

  const addExercise = (id) => { mutate((a) => a.entries.push(newEntry(id))); setPickerOpen(false); };
  const removeExercise = (entryUid) => mutate((a) => { a.entries = a.entries.filter((e) => e.uid !== entryUid); });
  const addSet = (entryUid) => mutate((a) => {
    const e = entryOf(a, entryUid);
    const last = e.sets[e.sets.length - 1];
    e.sets.push({ weight: last ? last.weight : "", reps: last ? last.reps : "", done: false }); // copy previous set
  });
  const removeSet = (entryUid, i) => mutate((a) => { entryOf(a, entryUid).sets.splice(i, 1); });
  const updateSet = (entryUid, i, field, value) => mutate((a) => { entryOf(a, entryUid).sets[i][field] = value; });

  // Tick / untick a set. Ticking starts the rest timer and auto-fills empty
  // fields from your last performance.
  const toggleDone = (entry, i) => {
    const set = entry.sets[i];
    if (set.done) return updateSet(entry.uid, i, "done", false);

    const prev = lastSetOf(workouts, entry.exerciseId);
    const reps = set.reps !== "" ? set.reps : prev ? prev.reps : "";
    const weight = set.weight !== "" ? set.weight : prev ? prev.weight : "";
    if (!Number(reps)) { setMessage("Enter the reps before ticking a set."); return; }

    setMessage("");
    mutate((a) => { Object.assign(entryOf(a, entry.uid).sets[i], { weight, reps, done: true }); });
    setRestEnd(Date.now() + restLen * 1000);
  };

  // ----- Finishing -----
  const finish = () => {
    const entries = active.entries
      .map((e) => ({
        uid: e.uid,
        exerciseId: e.exerciseId,
        sets: e.sets.filter((s) => s.done && Number(s.reps) > 0).map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) })),
      }))
      .filter((e) => e.sets.length > 0);

    if (entries.length === 0) { setMessage("Tick at least one completed set before finishing."); return; }

    onFinish({
      id: active.id,
      name: active.name || "Workout",
      date: new Date().toISOString(),
      durationSec: Math.round((Date.now() - active.startedAt) / 1000),
      entries,
    });
  };

  // ----- Live numbers for the top bar -----
  const elapsed = Math.floor((now - active.startedAt) / 1000);
  const restLeft = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : 0;
  let doneSets = 0;
  let liveVolume = 0;
  for (const e of active.entries) {
    const ex = getExercise(e.exerciseId);
    for (const s of e.sets) if (s.done) { doneSets++; liveVolume += setVolume(s, ex, profile.bodyweightKg); }
  }

  return (
    <div className="page">
      {/* ---------- Top bar: name, timer, live stats ---------- */}
      <section className="card session-bar">
        <input className="input name-input" value={active.name} onChange={(e) => mutate((a) => { a.name = e.target.value; })} aria-label="Workout name" />
        <div className="session-stats">
          <div><span className="tile-value">{fmtDuration(elapsed)}</span><span className="tile-label">time</span></div>
          <div><span className="tile-value">{doneSets}</span><span className="tile-label">sets done</span></div>
          <div><span className="tile-value">{fmtKg(liveVolume)}</span><span className="tile-label">kg</span></div>
        </div>
      </section>

      {/* ---------- Rest timer ---------- */}
      <section className="card rest-bar">
        <div className="row gap wrap">
          <span className="muted">Rest timer</span>
          {[60, 90, 120, 180].map((s) => (
            <button key={s} className={"chip button" + (restLen === s ? " selected" : "")} onClick={() => setRestLen(s)}>{s}s</button>
          ))}
        </div>
        {restLeft > 0 && (
          <div className="rest-count">
            <strong>Rest {fmtDuration(restLeft)}</strong>
            <button className="btn ghost small" onClick={() => setRestEnd(null)}>Skip</button>
          </div>
        )}
      </section>

      {message && <p className="notice">{message}</p>}

      {/* ---------- Exercises ---------- */}
      {active.entries.length === 0 && <p className="muted center">No exercises yet. Add your first one below.</p>}

      {active.entries.map((entry) => {
        const ex = getExercise(entry.exerciseId);
        if (!ex) return null;
        const last = lastSetOf(workouts, ex.id);
        return (
          <section className="card exercise-card" key={entry.uid}>
            <div className="exercise-head">
              <div>
                <h3>{ex.name}</h3>
                <span className="muted small">{ex.muscle}{last ? ` · Last: ${last.weight} kg × ${last.reps}` : ""}</span>
              </div>
              <div className="row gap">
                {/* HOW-TO BUTTON: opens the popup in components/HowToModal.jsx */}
                <button className="btn ghost small" onClick={() => onHowTo(ex)}><Icon name="info" size={16} /> How to</button>
                <button className="icon-btn" onClick={() => removeExercise(entry.uid)} aria-label="Remove exercise"><Icon name="trash" size={18} /></button>
              </div>
            </div>

            <div className="sets">
              <div className="set-row set-header">
                <span>Set</span><span>{ex.bodyweight ? "+ kg" : "kg"}</span><span>Reps</span><span /><span />
              </div>
              {entry.sets.map((s, i) => (
                <div className={"set-row" + (s.done ? " done" : "")} key={i}>
                  <span className="set-num">{i + 1}</span>
                  <input className="input" type="number" inputMode="decimal" min="0" step="0.5" placeholder={last ? String(last.weight) : "0"} value={s.weight} onChange={(e) => updateSet(entry.uid, i, "weight", e.target.value)} aria-label="Weight in kg" />
                  <input className="input" type="number" inputMode="numeric" min="0" step="1" placeholder={last ? String(last.reps) : "0"} value={s.reps} onChange={(e) => updateSet(entry.uid, i, "reps", e.target.value)} aria-label="Reps" />
                  <button className={"check-btn" + (s.done ? " on" : "")} onClick={() => toggleDone(entry, i)} aria-label="Mark set done"><Icon name="check" size={18} /></button>
                  <button className="icon-btn" onClick={() => removeSet(entry.uid, i)} aria-label="Remove set"><Icon name="x" size={16} /></button>
                </div>
              ))}
            </div>
            <button className="btn ghost full" onClick={() => addSet(entry.uid)}><Icon name="plus" size={16} /> Add set</button>
          </section>
        );
      })}

      {/* ---------- Actions ---------- */}
      <div className="action-bar">
        <button className="btn ghost" onClick={() => setPickerOpen(true)}><Icon name="plus" size={18} /> Add exercise</button>
        <button className="btn primary" onClick={finish}><Icon name="check" size={18} /> Finish workout</button>
      </div>

      <div className="center">
        {!confirmCancel ? (
          <button className="link danger" onClick={() => setConfirmCancel(true)}>Cancel workout</button>
        ) : (
          <span className="row gap center-row">
            <span className="muted">Discard this workout?</span>
            <button className="btn danger small" onClick={() => { setActive(null); setConfirmCancel(false); }}>Discard</button>
            <button className="btn ghost small" onClick={() => setConfirmCancel(false)}>Keep</button>
          </span>
        )}
      </div>

      {pickerOpen && <ExercisePicker onPick={addExercise} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
