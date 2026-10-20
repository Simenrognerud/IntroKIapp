// ---------------------------------------------------------------------------
// MEDAL TIERS
// Every exercise has its own `goldKg` (see data/exercises.js).
// A tier's threshold = goldKg x mult.
//   Example: Bench Press goldKg = 100,000
//     Bronze  10,000 kg | Silver  35,000 kg | Gold  100,000 kg
//     Platinum 250,000 kg | Diamond 500,000 kg
//
// To add a tier (e.g. "Legend"): append an object here. The rest of the app
// (badges, progress bars, leaderboard) picks it up automatically.
// Keep the list ordered from lowest to highest `mult`.
// ---------------------------------------------------------------------------

export const TIERS = [
  { id: "bronze", name: "Bronze", mult: 0.1, color: "#cd7f32" },
  { id: "silver", name: "Silver", mult: 0.35, color: "#c4cbd6" },
  { id: "gold", name: "Gold", mult: 1, color: "#f5c542" },
  { id: "platinum", name: "Platinum", mult: 2.5, color: "#6fd8e8" },
  { id: "diamond", name: "Diamond", mult: 5, color: "#7ea2ff" },
];
