import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtimePath = path.join(root, "components", "TabTitleRuntime.tsx");
const layoutPath = path.join(root, "app", "layout.tsx");
const runtime = fs.readFileSync(runtimePath, "utf8");
const layout = fs.readFileSync(layoutPath, "utf8");

const away = [
  "You left the playhead behind 🎬",
  "The sequence is still running 🎞️",
  "The timeline kept moving 🖥️",
  "The next frame is waiting ⏳",
  "This scene is not over 🎥",
  "You vanished mid scene 🕶️",
  "The record never stopped 🔴",
  "One frame is still missing 🧩",
  "The edit noticed you left 🪄",
  "The timeline lost its editor 🎛️",
  "The frame is still here 🖤",
];
const returned = [
  "The editor returns 🎬",
  "Back on the timeline 🎞️",
  "Back inside the edit 🖥️",
  "The scene continues 🎥",
  "The frame found you 🪄",
  "The timeline has you again 🎛️",
  "Right where you left it 🖤",
];

const checks = [
  [layout.includes('import TabTitleRuntime from "@/components/TabTitleRuntime";'), "runtime imported in root layout"],
  [layout.includes("<TabTitleRuntime />"), "runtime mounted in root layout"],
  [runtime.includes('document.addEventListener("visibilitychange"'), "visibilitychange listener installed"],
  [runtime.includes('document.title = DEFAULT_TITLE'), "default title restoration present"],
  [runtime.includes('const DEFAULT_TITLE = "VALIE | Creative Editor & Web Designer"'), "default title exact"],
  [away.every((message) => runtime.includes(message)), "all away messages present"],
  [returned.every((message) => runtime.includes(message)), "all return messages present"],
  [runtime.includes("AWAY_STEP_MS = 1800"), "away title cadence present"],
  [runtime.includes("RETURN_STEP_MS = 650"), "return title cadence present"],
  [runtime.includes("RETURN_FINAL_HOLD_MS = 1100"), "final return hold present"],
];

let failed = 0;
checks.forEach(([ok, label], index) => {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${index + 1}/${checks.length} ${label}`);
});
if (failed) process.exit(1);
console.log(`Tab title runtime audit passed ${checks.length}/${checks.length}`);
