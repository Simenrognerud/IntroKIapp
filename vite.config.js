import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config. The react plugin gives us JSX support and instant hot-reload.
export default defineConfig({
  plugins: [react()],
});
