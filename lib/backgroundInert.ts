/* ───────────────────────────────────────────────────────────────────────────
   THE PAGE BEHIND AN OVERLAY

   `aria-modal` alone does not take the page behind a popup out of the
   accessibility tree: the browser keeps listing every link back there, and a
   screen reader in browse mode or an agent reading the tree finds controls it
   cannot press. `inert` does take them out, and it paints nothing, so an overlay
   looks exactly the same with it.

   The children of <body> are what gets marked, because that is the one level
   every overlay here shares a parent with. Counted per element, so a popup that
   opens over the phone menu, and closes after it, cannot wake the page early.
   ─────────────────────────────────────────────────────────────────────────── */

const holds = new WeakMap<HTMLElement, number>();

/** Elements that must keep working behind any overlay. */
const SKIP = new Set(["SCRIPT", "STYLE", "LINK", "NOSCRIPT", "NEXT-ROUTE-ANNOUNCER"]);

/**
 * Marks every other child of <body> inert while `keep` is showing.
 * Returns the function that undoes it: call it before focus moves back.
 */
export function inertOutside(keep: Element): () => void {
  const held: HTMLElement[] = [];
  for (const el of Array.from(document.body.children)) {
    // Not the preloader: it is aria-hidden already, and inert would let presses
    // through it while it still covers the page.
    if (!(el instanceof HTMLElement) || SKIP.has(el.tagName) || el.contains(keep) || el.id === "zan-preloader") continue;
    const count = holds.get(el) ?? 0;
    holds.set(el, count + 1);
    if (count === 0) el.inert = true;
    held.push(el);
  }
  let done = false;
  return () => {
    if (done) return;
    done = true;
    for (const el of held) {
      const count = (holds.get(el) ?? 1) - 1;
      holds.set(el, count);
      if (count <= 0) el.inert = false;
    }
  };
}
