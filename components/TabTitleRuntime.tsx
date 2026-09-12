"use client";

import { useEffect } from "react";

const DEFAULT_TITLE = "VALIE | Creative Editor & Web Designer";
const INITIAL_TITLE = "Welcome to VALIE 🎬";

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

const VISIBLE_MESSAGE_HOLD_MS = 6500;

export default function TabTitleRuntime() {
  useEffect(() => {
    let restoreTimer = 0;
    let awayIndex = 0;
    let returnIndex = 0;

    const clearRestoreTimer = () => {
      if (restoreTimer) window.clearTimeout(restoreTimer);
      restoreTimer = 0;
    };

    const restoreDefaultLater = () => {
      clearRestoreTimer();
      restoreTimer = window.setTimeout(() => {
        document.title = DEFAULT_TITLE;
        restoreTimer = 0;
      }, VISIBLE_MESSAGE_HOLD_MS);
    };

    const showAwayTitle = () => {
      clearRestoreTimer();
      document.title = AWAY_TITLES[awayIndex];
      awayIndex = (awayIndex + 1) % AWAY_TITLES.length;
    };

    const showReturnTitle = () => {
      clearRestoreTimer();
      document.title = RETURN_TITLES[returnIndex];
      returnIndex = (returnIndex + 1) % RETURN_TITLES.length;
      restoreDefaultLater();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        showAwayTitle();
        return;
      }

      showReturnTitle();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (document.hidden) {
      showAwayTitle();
    } else {
      document.title = INITIAL_TITLE;
      restoreDefaultLater();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearRestoreTimer();
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return null;
}
