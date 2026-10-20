// ---------------------------------------------------------------------------
// EXERCISE LIBRARY
// To add an exercise: copy one object below and give it a unique `id`.
//
//   id         unique key (used when saving workouts, never change it later)
//   name       display name
//   muscle     must be one of MUSCLE_GROUPS (used for filters)
//   goldKg     total kg you must lift (sets x reps x weight, all-time) for GOLD.
//              All other tiers are multiples of this (see data/medals.js).
//   bodyweight true = your bodyweight counts as part of the load
//              (pull-ups, dips...). Extra weight you add is on top.
//   cue        short how-to text shown in the "How to" popup
//   videoUrl   put a video link here later (mp4 or YouTube embed URL)
// ---------------------------------------------------------------------------

export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export const EXERCISES = [
  // ---- Chest ----
  { id: "bench", name: "Bench Press", muscle: "Chest", goldKg: 100000, cue: "Shoulder blades pinched, feet planted. Lower the bar to mid-chest, press up in a slight arc.", videoUrl: null },
  { id: "incline", name: "Incline Dumbbell Press", muscle: "Chest", goldKg: 60000, cue: "Bench at ~30 degrees. Lower the dumbbells to chest level, press up and slightly together.", videoUrl: null },
  { id: "pushup", name: "Push-up", muscle: "Chest", goldKg: 30000, bodyweight: true, cue: "Body in a straight line, elbows ~45 degrees from the torso. Chest to the floor, push back up.", videoUrl: null },

  // ---- Back ----
  { id: "deadlift", name: "Deadlift", muscle: "Back", goldKg: 150000, cue: "Bar over mid-foot, flat back, push the floor away. Lock out hips and knees together.", videoUrl: null },
  { id: "row", name: "Barbell Row", muscle: "Back", goldKg: 80000, cue: "Hinge to ~45 degrees, pull the bar to your lower ribs, squeeze the shoulder blades.", videoUrl: null },
  { id: "pulldown", name: "Lat Pulldown", muscle: "Back", goldKg: 80000, cue: "Lean back slightly, pull the bar to your upper chest, elbows driving down.", videoUrl: null },
  { id: "pullup", name: "Pull-up", muscle: "Back", goldKg: 40000, bodyweight: true, cue: "Full hang to chin over the bar. Avoid swinging, lead with the chest.", videoUrl: null },

  // ---- Legs ----
  { id: "squat", name: "Back Squat", muscle: "Legs", goldKg: 150000, cue: "Bar on upper back, brace your core, sit between the hips, knees track over toes.", videoUrl: null },
  { id: "legpress", name: "Leg Press", muscle: "Legs", goldKg: 200000, cue: "Feet shoulder-width, lower until knees ~90 degrees, do not let the lower back lift off.", videoUrl: null },
  { id: "lunge", name: "Walking Lunge", muscle: "Legs", goldKg: 50000, cue: "Long step, back knee almost touches the floor, drive through the front heel.", videoUrl: null },
  { id: "rdl", name: "Romanian Deadlift", muscle: "Legs", goldKg: 80000, cue: "Soft knees, push the hips back, bar slides down the thighs until you feel the hamstrings stretch.", videoUrl: null },
  { id: "calf", name: "Calf Raise", muscle: "Legs", goldKg: 60000, cue: "Full stretch at the bottom, pause at the top. Slow and controlled.", videoUrl: null },

  // ---- Shoulders ----
  { id: "ohp", name: "Overhead Press", muscle: "Shoulders", goldKg: 50000, cue: "Squeeze glutes, bar starts at collarbone, press straight up and move your head through.", videoUrl: null },
  { id: "lateral", name: "Lateral Raise", muscle: "Shoulders", goldKg: 10000, cue: "Slight elbow bend, raise to shoulder height, lead with the elbows not the hands.", videoUrl: null },
  { id: "facepull", name: "Face Pull", muscle: "Shoulders", goldKg: 15000, cue: "Rope at face height, pull towards the eyes with elbows high, rotate the hands outward.", videoUrl: null },

  // ---- Arms ----
  { id: "curl", name: "Biceps Curl", muscle: "Arms", goldKg: 25000, cue: "Elbows pinned to your sides, curl up, squeeze, lower slowly.", videoUrl: null },
  { id: "pushdown", name: "Triceps Pushdown", muscle: "Arms", goldKg: 30000, cue: "Elbows stay at your sides, fully extend the arms, control the way back up.", videoUrl: null },
  { id: "dips", name: "Dips", muscle: "Arms", goldKg: 30000, bodyweight: true, cue: "Lean slightly forward for chest, upright for triceps. Lower until upper arms are parallel.", videoUrl: null },

  // ---- Core ----
  { id: "crunch", name: "Cable Crunch", muscle: "Core", goldKg: 30000, cue: "Kneel under the cable, curl the ribs towards the pelvis. Do not just bend at the hips.", videoUrl: null },
  { id: "legraise", name: "Hanging Leg Raise", muscle: "Core", goldKg: 20000, bodyweight: true, cue: "Hang from a bar, lift the legs with a posterior pelvic tilt, lower without swinging.", videoUrl: null },
];

// Quick lookup by id. Returns undefined if the exercise was removed from the list.
export const getExercise = (id) => EXERCISES.find((e) => e.id === id);

// Quick-start templates shown on the Workout page. Edit freely.
export const TEMPLATES = [
  { id: "push", name: "Push day", exercises: ["bench", "ohp", "incline", "pushdown", "lateral"] },
  { id: "pull", name: "Pull day", exercises: ["deadlift", "row", "pulldown", "curl", "facepull"] },
  { id: "legs", name: "Leg day", exercises: ["squat", "rdl", "legpress", "lunge", "calf"] },
];
