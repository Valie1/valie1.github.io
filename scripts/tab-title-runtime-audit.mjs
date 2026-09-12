import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const runtime = fs.readFileSync(path.join(root, "components", "TabTitleRuntime.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");

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
  [runtime.includes('const INITIAL_TITLE = "Welcome to VALIE 🎬"'), "single initial welcome title present"],
  [runtime.includes('document.addEventListener("visibilitychange"'), "visibilitychange listener installed"],
  [runtime.includes('const VISIBLE_MESSAGE_HOLD_MS = 6500'), "welcome and return title hold is 6.5 seconds"],
  [runtime.includes('document.title = AWAY_TITLES[awayIndex]'), "away state sets exactly one title"],
  [runtime.includes('document.title = RETURN_TITLES[returnIndex]'), "return state sets exactly one title"],
  [!runtime.includes("setInterval"), "no title cycling interval remains"],
  [runtime.includes('document.title = DEFAULT_TITLE'), "default title restoration present"],
  [runtime.includes('const DEFAULT_TITLE = "VALIE | Creative Editor & Web Designer"'), "default title exact"],
  [away.every((message) => runtime.includes(message)), "all approved away messages remain available across separate leave events"],
  [returned.every((message) => runtime.includes(message)), "all approved return messages remain available across separate return events"],
];

let failed = 0;
checks.forEach(([ok, label], index) => {
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${index + 1}/${checks.length} ${label}`);
});
if (failed) process.exit(1);
console.log(`Tab title runtime audit passed ${checks.length}/${checks.length}`);
