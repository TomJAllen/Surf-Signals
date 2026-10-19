// Copies MediaPipe's WASM runtime from node_modules into public/ so the app serves
// it itself: no third-party CDN request from users' browsers, a strict CSP, and the
// runtime version always matches the installed @mediapipe/tasks-vision package.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const src = join("node_modules", "@mediapipe", "tasks-vision", "wasm");
const dest = join("public", "mediapipe", "wasm");

if (!existsSync(src)) {
  console.error(`copy-mediapipe: ${src} not found. Run npm install first.`);
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`copy-mediapipe: copied ${src} -> ${dest}`);
