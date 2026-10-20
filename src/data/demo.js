// ---------------------------------------------------------------------------
// DEMO WORKOUTS
// "Load demo data" (in the profile menu) fills the app with 12 past workouts
// so you can see medals, charts and the leaderboard without logging by hand.
// ---------------------------------------------------------------------------
import { TEMPLATES } from "./exercises";
import { uid } from "../utils/stats";

// Starting weights (kg) per exercise. 0 = bodyweight only.
const BASE_WEIGHT = {
  bench: 80, ohp: 45, incline: 28, pushdown: 30, lateral: 10,
  deadlift: 120, row: 70, pulldown: 65, curl: 18, facepull: 25,
  squat: 100, rdl: 80, legpress: 180, lunge: 40, calf: 70,
};

export function makeDemoWorkouts() {
  const workouts = [];
  for (let i = 0; i < 12; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const factor = 1 - i * 0.012; // older sessions are a little lighter
    const date = new Date(Date.now() - (i * 2 + 1) * 86400000);
    workouts.push({
      id: uid(),
      name: template.name,
      date: date.toISOString(),
      durationSec: 3300 + i * 60,
      entries: template.exercises.map((exerciseId) => ({
        uid: uid(),
        exerciseId,
        sets: [10, 9, 8, 8, 7].map((reps) => ({
          weight: Math.round(((BASE_WEIGHT[exerciseId] || 0) * factor) / 2.5) * 2.5,
          reps,
        })),
      })),
    });
  }
  return workouts;
}
