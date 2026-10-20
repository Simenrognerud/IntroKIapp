// ---------------------------------------------------------------------------
// DEMO FRIENDS
// Fake friends so the leaderboard has something to show. Each friend has
// all-time totals per exercise (kg), same shape as your own totals.
//
// LATER (real friends): replace this file with a fetch() to a backend that
// returns [{ id, name, totals }]. Leaderboard.jsx only needs that shape.
// ---------------------------------------------------------------------------
import { EXERCISES } from "./exercises";

// Generates believable but varied totals. `skill` scales how strong the friend
// is (1 = roughly gold level on most lifts). `seed` makes each friend unique.
function makeTotals(skill, seed) {
  const totals = {};
  EXERCISES.forEach((ex, i) => {
    const wobble = 0.6 + ((i * 37 + seed * 17) % 40) / 50; // 0.6 .. 1.4
    totals[ex.id] = Math.round((ex.goldKg * skill * wobble) / 100) * 100;
  });
  return totals;
}

export const DEMO_FRIENDS = [
  { id: "f1", name: "Emil", totals: makeTotals(1.6, 3) },
  { id: "f2", name: "Sara", totals: makeTotals(1.0, 7) },
  { id: "f3", name: "Jonas", totals: makeTotals(0.55, 11) },
  { id: "f4", name: "Mia", totals: makeTotals(0.35, 5) },
  { id: "f5", name: "Ola", totals: makeTotals(0.2, 9) },
];
