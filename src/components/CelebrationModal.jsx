import Modal from "./Modal";
import MedalBadge from "./MedalBadge";
import { fmtKg } from "../utils/stats";

// ---------------------------------------------------------------------------
// Shown right after you finish a workout: total kg, new medals and new PRs.
// `result` is built in App.jsx (finishWorkout).
// ---------------------------------------------------------------------------
export default function CelebrationModal({ result, onClose }) {
  const { volume, unlocked, prs } = result;

  return (
    <Modal title="Workout complete" onClose={onClose}>
      <div className="celebrate-total">
        <span className="big-number">{fmtKg(volume)}</span>
        <span className="muted">kg lifted this session</span>
      </div>

      {unlocked.length > 0 && (
        <>
          <h4>New medals</h4>
          <div className="stack">
            {unlocked.map((u) => (
              <div className="unlock-row" key={u.exercise.id}>
                <MedalBadge tier={u.tier} size={44} />
                <div>
                  <strong>{u.tier.name}</strong> in {u.exercise.name}
                  <div className="muted small">{fmtKg(u.tier.kg)} kg total reached</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {prs.length > 0 && (
        <>
          <h4>New personal records</h4>
          <div className="stack">
            {prs.map((p) => (
              <div className="pr-row" key={p.exercise.id}>
                <span>{p.exercise.name}</span>
                <span className="muted">est. 1RM {Math.round(p.e1rm)} kg</span>
              </div>
            ))}
          </div>
        </>
      )}

      {unlocked.length === 0 && prs.length === 0 && (
        <p className="muted">No new medals this time. Keep stacking kilos.</p>
      )}

      <button className="btn primary full" onClick={onClose}>Nice</button>
    </Modal>
  );
}
