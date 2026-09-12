"use client";

import { useEffect } from "react";

const DEFAULT_TITLE = "VALIE | Creative Editor & Web Designer";

const AWAY_TITLES = [
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
] as const;

const RETURN_TITLES = [
  "The editor returns 🎬",
  "Back on the timeline 🎞️",
  "Back inside the edit 🖥️",
  "The scene continues 🎥",
  "The frame found you 🪄",
  "The timeline has you again 🎛️",
  "Right where you left it 🖤",
] as const;

const AWAY_STEP_MS = 1800;
const RETURN_STEP_MS = 650;
const RETURN_FINAL_HOLD_MS = 1100;

export default function TabTitleRuntime() {
  useEffect(() => {
    let awayInterval = 0;
    let returnInterval = 0;
    let restoreTimer = 0;
    let awayIndex = 0;
    let returnIndex = 0;

    const clearAwaySequence = () => {
      if (awayInterval) window.clearInterval(awayInterval);
      awayInterval = 0;
    };

    const clearReturnSequence = () => {
      if (returnInterval) window.clearInterval(returnInterval);
      if (restoreTimer) window.clearTimeout(restoreTimer);
      returnInterval = 0;
      restoreTimer = 0;
    };

    const restoreDefaultTitle = () => {
      clearReturnSequence();
      document.title = DEFAULT_TITLE;
    };

    const startAwaySequence = () => {
      clearAwaySequence();
      clearReturnSequence();
      awayIndex = 0;
      document.title = AWAY_TITLES[awayIndex];

      awayInterval = window.setInterval(() => {
        awayIndex = (awayIndex + 1) % AWAY_TITLES.length;
        document.title = AWAY_TITLES[awayIndex];
      }, AWAY_STEP_MS);
    };

    const startReturnSequence = () => {
      clearAwaySequence();
      clearReturnSequence();
      returnIndex = 0;
      document.title = RETURN_TITLES[returnIndex];

      returnInterval = window.setInterval(() => {
        returnIndex += 1;

        if (returnIndex >= RETURN_TITLES.length) {
          window.clearInterval(returnInterval);
          returnInterval = 0;
          restoreTimer = window.setTimeout(restoreDefaultTitle, RETURN_FINAL_HOLD_MS);
          return;
        }

        document.title = RETURN_TITLES[returnIndex];
      }, RETURN_STEP_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        startAwaySequence();
        return;
      }

      startReturnSequence();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (document.hidden) startAwaySequence();
    else document.title = DEFAULT_TITLE;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearAwaySequence();
      clearReturnSequence();
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return null;
}
