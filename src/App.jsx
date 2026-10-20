import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import HowToModal from "./components/HowToModal";
import CelebrationModal from "./components/CelebrationModal";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Ranks from "./pages/Ranks";
import Leaderboard from "./pages/Leaderboard";
import History from "./pages/History";
import { DEMO_FRIENDS } from "./data/friends";
import { makeDemoWorkouts } from "./data/demo";
import { useLocalStorage } from "./utils/storage";
import { totalsByExercise, sumTotals, levelInfo, workoutVolume, findUnlocked, findPRs } from "./utils/stats";

// ---------------------------------------------------------------------------
// APP: the root component. It owns all data (profile, workouts, active
// workout) and passes it down to the pages as props.
//
// TO ADD A NEW PAGE:
//   1. Create pages/MyPage.jsx
//   2. Add an entry to PAGES below (icon names are in components/Icon.jsx)
//   3. Add a line in the "Page switch" section further down
// ---------------------------------------------------------------------------
const PAGES = [
  { id: "home", label: "Home", icon: "home" },
  { id: "workout", label: "Workout", icon: "dumbbell" },
  { id: "ranks", label: "Ranks", icon: "trophy" },
  { id: "friends", label: "Friends", icon: "users" },
  { id: "history", label: "History", icon: "clock" },
];

const DEFAULT_PROFILE = { name: "Athlete", bodyweightKg: 80, setup: false };

export default function App() {
  // ----- Saved data (kept in the browser, see utils/storage.js) -----
  const [profile, setProfile] = useLocalStorage("liftrank.profile", DEFAULT_PROFILE);
  const [workouts, setWorkouts] = useLocalStorage("liftrank.workouts", []);
  const [active, setActive] = useLocalStorage("liftrank.active", null); // workout in progress

  // ----- Screen state (not saved) -----
  const [page, setPage] = useState("home");
  const [howTo, setHowTo] = useState(null);            // exercise shown in the how-to popup
  const [result, setResult] = useState(null);          // summary popup after finishing
  const [settingsOpen, setSettingsOpen] = useState(!profile.setup); // first launch = welcome

  // ----- Derived data -----
  const totals = totalsByExercise(workouts, profile.bodyweightKg);
  const level = levelInfo(sumTotals(totals), workouts.length).level;

  // ----- Actions -----
  const finishWorkout = (workout) => {
    const bw = profile.bodyweightKg;
    const after = totalsByExercise([...workouts, workout], bw);
    setResult({
      volume: workoutVolume(workout, bw),
      unlocked: findUnlocked(totals, after), // medals earned by this workout
      prs: findPRs(workouts, workout),       // new personal records
    });
    setWorkouts([...workouts, workout]);
    setActive(null);
    setPage("home");
  };

  const deleteWorkout = (id) => setWorkouts(workouts.filter((w) => w.id !== id));

  const loadDemo = () => {
    if (workouts.length === 0 || window.confirm("Replace your workouts with demo data?")) {
      setWorkouts(makeDemoWorkouts());
      setPage("home");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, workouts }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "liftrank-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const resetAll = () => {
    if (window.confirm("Delete ALL your data? This cannot be undone.")) {
      setWorkouts([]);
      setActive(null);
      setProfile(DEFAULT_PROFILE);
      setSettingsOpen(true);
      setPage("home");
    }
  };

  return (
    <div className="shell">
      <Header
        pages={PAGES} page={page} setPage={setPage}
        profile={profile} level={level} hasActiveWorkout={!!active}
        onSettings={() => setSettingsOpen(true)} onDemo={loadDemo} onExport={exportData} onReset={resetAll}
      />

      <main className="container">
        {/* ---------- Page switch ---------- */}
        {page === "home" && (
          <Home workouts={workouts} totals={totals} profile={profile} friends={DEMO_FRIENDS} hasActiveWorkout={!!active} goTo={setPage} />
        )}
        {page === "workout" && (
          <Workout active={active} setActive={setActive} workouts={workouts} profile={profile} onFinish={finishWorkout} onHowTo={setHowTo} />
        )}
        {page === "ranks" && <Ranks totals={totals} onHowTo={setHowTo} />}
        {page === "friends" && <Leaderboard friends={DEMO_FRIENDS} totals={totals} profile={profile} />}
        {page === "history" && <History workouts={workouts} profile={profile} onDelete={deleteWorkout} />}
      </main>

      <Footer pages={PAGES} page={page} setPage={setPage} hasActiveWorkout={!!active} />

      {/* ---------- Popups ---------- */}
      {howTo && <HowToModal exercise={howTo} onClose={() => setHowTo(null)} />}
      {result && <CelebrationModal result={result} onClose={() => setResult(null)} />}
      {settingsOpen && (
        <SettingsModal
          profile={profile}
          onSave={(p) => { setProfile({ ...p, setup: true }); setSettingsOpen(false); }}
          onClose={() => { setProfile({ ...profile, setup: true }); setSettingsOpen(false); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile & settings popup (name + bodyweight). Add more settings here.
// ---------------------------------------------------------------------------
function SettingsModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [bodyweight, setBodyweight] = useState(String(profile.bodyweightKg));

  const save = () => onSave({ ...profile, name: name.trim() || "Athlete", bodyweightKg: Number(bodyweight) > 0 ? Number(bodyweight) : 80 });

  return (
    <Modal title={profile.setup ? "Profile & settings" : "Welcome to LiftRank"} onClose={onClose}>
      <div className="stack">
        <label className="field">
          <span>Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} autoFocus />
        </label>
        <label className="field">
          <span>Bodyweight (kg)</span>
          <input className="input" type="number" inputMode="decimal" min="30" step="0.5" value={bodyweight} onChange={(e) => setBodyweight(e.target.value)} />
          <span className="muted small">Used for pull-ups, dips and other bodyweight exercises.</span>
        </label>
        <button className="btn primary full" onClick={save}>Save</button>
      </div>
    </Modal>
  );
}
