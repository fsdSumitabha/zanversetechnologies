/* ───────────────────────────────────────────────────────────────────────────
   INPUT BEFORE HYDRATION

   A page opened on a section link, or on an answer the browser's find opened,
   is held there while the page is built (components/zan/shell/holdTarget.ts).
   The hold starts at hydration, which on a slow device can come seconds after
   the page could first be scrolled. This head script notes when the visitor
   starts to scroll before then, so they are not pulled back.

   What counts is what can move the page: the wheel, and the keys that scroll or
   move focus (movesPage). A shortcut such as Ctrl+F, Alt+Tab or a lone Shift does
   not, which is why the find that opened an answer does not cancel its own hold.
   A find is noted apart (EARLY_FIND_ATTRIBUTE), for the section-link hold only:
   someone who searched the page is not looking for that section any more.

   A finger moving on the screen counts too, except on Apple systems: on iPhone
   and iPad any touch listener makes buttons show their pressed style before
   hydration, which the site never did. There a finger scroll before hydration
   is not seen, and a page with no preloader can still be pulled back once, at
   hydration, on a slow phone.

   Free of React and of the scroll libraries, so the layouts can import it.
   ─────────────────────────────────────────────────────────────────────────── */

export const EARLY_INPUT_ATTRIBUTE = "data-early-input";
export const EARLY_FIND_ATTRIBUTE = "data-early-find";

/** On Apple systems Option is not a shortcut key: Option+Tab moves to links in Safari, and Option+arrows scroll. */
const APPLE = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/**
 * Whether a key can scroll the page or move the focus. Tab, Space and Page Up or
 * Down with Ctrl or Meta held are shortcuts (switching tabs or apps), not
 * scrolling; the arrows, Home and End still scroll with them. Alt is a shortcut
 * key too (switching windows, going back in history), except on Apple systems.
 * EARLY_INPUT_SCRIPT spells the same test in plain script: keep the two the same.
 */
export function movesPage(e: KeyboardEvent): boolean {
  const k = e.key;
  const alt = e.altKey && !APPLE;
  if (k === "Tab" || k === " " || k === "Spacebar" || k === "PageUp" || k === "PageDown") {
    return !(e.ctrlKey || e.metaKey || alt);
  }
  if (k === "ArrowUp" || k === "ArrowDown" || k === "ArrowLeft" || k === "ArrowRight" || k === "Home" || k === "End") {
    return !alt;
  }
  return false;
}

/**
 * For the layouts' head. Marks <html> with EARLY_INPUT_ATTRIBUTE at the first
 * wheel, finger move (not on Apple systems) or key that scrolls (movesPage), and
 * with EARLY_FIND_ATTRIBUTE at the browser's find: its keys (Ctrl or Cmd with F or
 * G by the physical key, F3, / or ' outside a field) or an answer it opens.
 */
export const EARLY_INPUT_SCRIPT = `(function(){var d=document.documentElement,p=/Mac|iPhone|iPad|iPod/.test(navigator.platform),t=p?["wheel","keydown"]:["wheel","keydown","touchmove"],o={capture:true,passive:true},a={Tab:1," ":1,Spacebar:1,PageUp:1,PageDown:1},b={ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,Home:1,End:1},m=function(e){var l=e.altKey&&!p;return a[e.key]?!(e.ctrlKey||e.metaKey||l):b[e.key]?!l:false},q=function(e){var k=typeof e.key==="string"?e.key:"",c=/^[a-z]$/i.test(k)?k.toLowerCase():e.code==="KeyF"?"f":e.code==="KeyG"?"g":"",g=e.target;if((e.ctrlKey||e.metaKey)&&(c==="f"||c==="g"))return true;if(k==="F3")return true;return(k==="/"||k==="'")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(g&&(g.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(g.tagName)))},n=function(){d.setAttribute("${EARLY_FIND_ATTRIBUTE}","")},f=function(e){if(e.type==="keydown"){if(q(e))n();if(!m(e))return}d.setAttribute("${EARLY_INPUT_ATTRIBUTE}","");t.forEach(function(x){removeEventListener(x,f,o)})};addEventListener("keydown",function(e){if(q(e))n()},o);document.addEventListener("beforematch",n,{capture:true});t.forEach(function(x){addEventListener(x,f,o)})})();`;
