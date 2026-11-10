/* ───────────────────────────────────────────────────────────────────────────
   PAUSE ANIMATIONS

   WCAG 2.2.2 asks for a way to stop anything that moves by itself for more than
   five seconds. This is that switch, for the visitor who asks for it. It changes
   nothing until someone presses the control (components/zan/shell/
   MotionPauseControl.tsx), which only shows on keyboard focus, like the skip link.

   CSS loops stop through `html[data-motion-paused]` in app/globals.css. The
   things driven by script (the hero's typing, the Industries carousel's timer,
   the logo loop, the work wall, the light rays, the project board's timer, the
   tech arc's drift and the hero's 3D mark) read this module. A choice saved on
   an earlier visit is put on the page before it paints, by MOTION_PAUSE_SCRIPT
   in the layouts.

   Free of React, so non-component code can read it. The hook is in
   lib/useMotionPaused.ts.
   ─────────────────────────────────────────────────────────────────────────── */

const KEY = "zan.motionPaused";
const ATTRIBUTE = "data-motion-paused";

/**
 * For the layouts' head: a saved choice goes on <html> before the first paint,
 * so a CSS loop never starts for someone who stopped them on an earlier visit.
 * The loops driven by script read the same storage when they start.
 */
export const MOTION_PAUSE_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="1")document.documentElement.setAttribute("${ATTRIBUTE}","")}catch(e){}`;

let paused = false;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    paused = localStorage.getItem(KEY) === "1";
  } catch {
    // Storage refused: the choice lasts for this page only.
  }
  if (paused) document.documentElement.setAttribute(ATTRIBUTE, "");
}

export function isMotionPaused(): boolean {
  load();
  return paused;
}

export function setMotionPaused(on: boolean): void {
  load();
  if (on === paused) return;
  paused = on;
  if (on) document.documentElement.setAttribute(ATTRIBUTE, "");
  else document.documentElement.removeAttribute(ATTRIBUTE);
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // Storage refused: the choice lasts for this page only.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeMotionPause(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
