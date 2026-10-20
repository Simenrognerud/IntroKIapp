// ---------------------------------------------------------------------------
// STATS & GAME LOGIC
// All the maths lives here, so the pages stay simple. Pure functions only
// (no React), which also makes them easy to test.
//
// Data shapes used throughout the app:
//   workout = { id, name, date (ISO string), durationSec,
//               entries: [ { uid, exerciseId, sets: [ { weight, reps } ] } ] }
//   totals  = { [exerciseId]: total kg lifted all-time }
// ---------------------------------------------------------------------------
import { EXERCISES, getExercise } from "../data/exercises";
import { TIERS } from "../data/medals";

export const uid = () => Math.random().toString(36).slice(2, 9);

// ----- Volume ---------------------------------------------------------------

// kg moved in one set. For bodyweight exercises your bodyweight is added.
// NOTE: totals are recalculated from history, so changing bodyweight in
// settings also updates old bodyweight-exercise totals.
export function setVolume(set, exercise, bodyweightKg) {
  const weight = Number(set.weight) || 0;
  const reps = Number(set.reps) || 0;
  const load = exercise && exercise.bodyweight ? bodyweightKg + weight : weight;
  return load * reps;
}

export function entryVolume(entry, bodyweightKg) {
  const ex = getExercise(entry.exerciseId);
  return entry.sets.reduce((sum, s) => sum + setVolume(s, ex, bodyweightKg), 0);
}

export function workoutVolume(workout, bodyweightKg) {
  return workout.entries.reduce((sum, e) => sum + entryVolume(e, bodyweightKg), 0);
}

// All-time kg per exercise: { bench: 12345, squat: 6789, ... }
export function totalsByExercise(workouts, bodyweightKg) {
  const totals = {};
  for (const w of workouts) {
    for (const e of w.entries) {
      if (!getExercise(e.exerciseId)) continue; // exercise removed from library
      totals[e.exerciseId] = (totals[e.exerciseId] || 0) + entryVolume(e, bodyweightKg);
    }
  }
  return totals;
}

export const sumTotals = (totals) => Object.values(totals).reduce((a, b) => a + b, 0);

// ----- Medals ---------------------------------------------------------------

// The kg needed for every tier of one exercise.
export function getThresholds(exercise) {
  return TIERS.map((t) => ({ ...t, kg: Math.round(exercise.goldKg * t.mult) }));
}

// Current medal, next medal and progress (0..1) towards the next one.
export function getMedalStatus(exercise, total = 0) {
  const thresholds = getThresholds(exercise);
  let tierIndex = -1;
  thresholds.forEach((t, i) => {
    if (total >= t.kg) tierIndex = i;
  });
  const tier = tierIndex >= 0 ? thresholds[tierIndex] : null;
  const next = thresholds[tierIndex + 1] || null;
  const floor = tier ? tier.kg : 0;
  const progress = next ? Math.min(1, (total - floor) / (next.kg - floor)) : 1;
  return { tier, tierIndex, next, progress, thresholds, remaining: next ? next.kg - total : 0 };
}

// Total medals earned across all exercises (every tier counts as one medal).
export function countMedals(totals) {
  return EXERCISES.reduce((n, ex) => n + getMedalStatus(ex, totals[ex.id] || 0).tierIndex + 1, 0);
}

// Compare totals before and after a workout -> list of newly unlocked tiers.
export function findUnlocked(before, after) {
  const unlocked = [];
  for (const ex of EXERCISES) {
    const a = getMedalStatus(ex, before[ex.id] || 0).tierIndex;
    const b = getMedalStatus(ex, after[ex.id] || 0).tierIndex;
    if (b > a) unlocked.push({ exercise: ex, tier: getThresholds(ex)[b] });
  }
  return unlocked;
}

// ----- Personal records -----------------------------------------------------

// Epley formula: estimated one-rep max from any weight x reps.
export const estimate1RM = (weight, reps) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export function bestE1RM(workouts, exerciseId) {
  let best = 0;
  for (const w of workouts) {
    for (const e of w.entries) {
      if (e.exerciseId !== exerciseId) continue;
      for (const s of e.sets) {
        best = Math.max(best, estimate1RM(Number(s.weight) || 0, Number(s.reps) || 0));
      }
    }
  }
  return best;
}

// New personal records set by `workout` compared with older workouts.
// (The very first time you log an exercise is not counted as a PR.)
export function findPRs(previousWorkouts, workout) {
  const prs = [];
  for (const entry of workout.entries) {
    const ex = getExercise(entry.exerciseId);
    if (!ex) continue;
    const prev = bestE1RM(previousWorkouts, entry.exerciseId);
    const now = bestE1RM([{ entries: [entry] }], entry.exerciseId);
    if (prev > 0 && now > prev) prs.push({ exercise: ex, e1rm: now });
  }
  return prs;
}

// ----- Dates, streaks and levels -------------------------------------------

const DAY = 86400000;

// Midnight on the Monday of the week containing `date` (as a timestamp).
const weekStart = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
};

// Number of workouts so far this week.
export function workoutsThisWeek(workouts) {
  const start = weekStart(new Date());
  return workouts.filter((w) => weekStart(w.date) === start).length;
}

// Streak = consecutive weeks with at least one workout.
// An empty current week does not break the streak until the week is over.
export function weeklyStreak(workouts) {
  const weeks = new Set(workouts.map((w) => weekStart(w.date)));
  let cursor = weekStart(new Date());
  if (!weeks.has(cursor)) cursor = weekStart(new Date(cursor - 3 * DAY));
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor = weekStart(new Date(cursor - 3 * DAY)); // step to previous Monday
  }
  return streak;
}

// kg lifted per day for the last 7 days (used by the Home bar chart).
export function lastSevenDays(workouts, bodyweightKg) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ start: d.getTime(), label: d.toLocaleDateString("en-GB", { weekday: "short" }), kg: 0 });
  }
  for (const w of workouts) {
    const d = new Date(w.date);
    d.setHours(0, 0, 0, 0);
    const slot = days.find((x) => x.start === d.getTime());
    if (slot) slot.kg += workoutVolume(w, bodyweightKg);
  }
  return days;
}

// XP: 1 per 50 kg lifted + 100 per workout. Level grows with sqrt(xp).
export function levelInfo(totalKg, workoutCount) {
  const xp = Math.round(totalKg / 50) + workoutCount * 100;
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const floor = (level - 1) ** 2 * 100;
  const ceil = level ** 2 * 100;
  return { xp, level, progress: (xp - floor) / (ceil - floor), toNext: ceil - xp };
}

// ----- Leaderboard ----------------------------------------------------------

// Builds a sorted list of friends + you for one exercise (or "overall").
export function buildLeaderboard(friends, myTotals, myName, exerciseId) {
  const pick = (totals) => (exerciseId === "overall" ? sumTotals(totals) : totals[exerciseId] || 0);
  const rows = [
    { id: "me", name: myName || "You", isYou: true, total: pick(myTotals), medals: countMedals(myTotals), totals: myTotals },
    ...friends.map((f) => ({ id: f.id, name: f.name, isYou: false, total: pick(f.totals), medals: countMedals(f.totals), totals: f.totals })),
  ];
  return rows.sort((a, b) => b.total - a.total);
}

// ----- Formatting -----------------------------------------------------------

export function fmtKg(n) {
  n = Math.round(n || 0);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 10_000) return (n / 1000).toFixed(1) + "k";
  return n.toLocaleString("en-GB");
}

export function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
