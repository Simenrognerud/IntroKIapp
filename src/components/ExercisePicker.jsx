import { useState } from "react";
import Modal from "./Modal";
import { EXERCISES, MUSCLE_GROUPS } from "../data/exercises";

// ---------------------------------------------------------------------------
// Popup to pick an exercise: search box + muscle-group dropdown.
// Calls onPick(exerciseId) when you tap one.
// ---------------------------------------------------------------------------
export default function ExercisePicker({ onPick, onClose }) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");

  const results = EXERCISES.filter(
    (ex) =>
      (muscle === "All" || ex.muscle === muscle) &&
      ex.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Modal title="Add exercise" onClose={onClose}>
      <div className="picker-filters">
        <input className="input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        <select className="select" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          <option value="All">All muscles</option>
          {MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="picker-list">
        {results.length === 0 && <p className="muted">No exercises found.</p>}
        {results.map((ex) => (
          <button key={ex.id} className="picker-item" onClick={() => onPick(ex.id)}>
            <span>{ex.name}</span>
            <span className="muted small">{ex.muscle}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
