import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  // base: process.env.NODE_ENV === "production" ? "/botc-icon-generator/" : "/",
});
