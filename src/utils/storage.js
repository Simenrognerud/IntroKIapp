import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// useLocalStorage: works exactly like useState, but the value is also saved in
// the browser (localStorage), so your data survives a page refresh.
//
// LATER: to share data between friends you will replace this with calls to a
// backend (e.g. FastAPI + a database). The rest of the app will not need to
// change, since it only uses the [value, setValue] pair.
// ---------------------------------------------------------------------------
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue; // corrupted or blocked storage: start fresh
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: ignore, the app still works in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
