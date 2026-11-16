/* ───────────────────────────────────────────────────────────────────────────
   AGENTS GET THE STILL PAGE — a PostCSS plugin, run after Tailwind on every
   stylesheet (postcss.config.mjs)

   A page in agent mode (<html data-agent>, lib/agentMode.ts) must look the way
   it looks to a visitor who prefers reduced motion, whatever the agent's own
   browser prefers. Script reads MQ in lib/gsap.ts for that. This does the same
   for CSS, so nobody has to keep a second copy of any rule:

     @media (prefers-reduced-motion: no-preference) { … }
         The rules inside stop applying in agent mode. Each one's subject gets
         :where(:root:not([data-agent]), :root:not([data-agent]) *), which is
         true for every element of a page without the attribute and adds no
         specificity, so for a person the rule matches exactly as before.

     @media (prefers-reduced-motion: reduce) { … }
         Stays as it is, and a copy follows it for agent mode: the same rules
         with :where(:root[data-agent], :root[data-agent] *) on their subject,
         under the block's other conditions only. Without the attribute the
         copy matches nothing.

   Both shapes are handled: rules inside the @media, and declarations inside
   an @media nested in a rule, which is how Tailwind writes motion-safe: and
   motion-reduce: before they are flattened. A query it cannot read, such as
   `not (prefers-reduced-motion: reduce)` or a list that mixes no-preference
   with another condition, stops the build rather than guessing.
   ─────────────────────────────────────────────────────────────────────────── */

/* No imports: postcss and postcss-selector-parser are not dependencies of this
   project, and pnpm in CI only links the ones that are. PostCSS hands the
   plugin its Rule class, and selectors are read by onSubject below.
   CommonJS, because Next loads PostCSS plugins with require(). */

const HUMAN = ":where(:root:not([data-agent]), :root:not([data-agent]) *)";
const AGENT = ":where(:root[data-agent], :root[data-agent] *)";

const MOTION = /prefers-reduced-motion/i;
const NO_PREFERENCE = /^\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)$/i;
const REDUCE = /^\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)$/i;

/** The legacy pseudo-elements that take one colon. */
const LEGACY_PSEUDO_ELEMENT = /^(before|after|first-line|first-letter)$/i;
/** At-rules whose children are rules in the same context, so they are walked into. */
const GROUPING = /^(media|supports|layer|container|scope|starting-style)$/i;
/** At-rules that must not be copied: a copy would apply to every page, people's too. */
const GLOBAL = /^(keyframes|-webkit-keyframes|font-face|property|counter-style|font-feature-values|page|import|namespace|charset)$/i;

/** Splits on a separator outside parentheses. */
function splitTop(text, separator) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && text.startsWith(separator, i)) {
      parts.push(text.slice(start, i));
      start = i + separator.length;
      i += separator.length - 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Reads a media query list. Returns null when it says nothing about motion,
 * "human" when every query in it needs no-preference, or { agent } with the
 * conditions under which the block applies in agent mode: null for always.
 */
function classify(params, where) {
  if (!MOTION.test(params)) return null;
  const queries = splitTop(params, ",").map((query) => {
    const parts = splitTop(query, " and ");
    const motion = parts.filter((p) => MOTION.test(p));
    if (!motion.length) return { kind: "plain", rest: parts };
    if (motion.length > 1 || /^\s*(not|only)\b/i.test(query)) throw unreadable(params, where);
    if (NO_PREFERENCE.test(motion[0])) return { kind: "human", rest: parts.filter((p) => p !== motion[0]) };
    if (REDUCE.test(motion[0])) return { kind: "reduce", rest: parts.filter((p) => p !== motion[0]) };
    throw unreadable(params, where);
  });
  const kinds = new Set(queries.map((q) => q.kind));
  if (kinds.has("human")) {
    if (kinds.size > 1) throw unreadable(params, where);
    return "human";
  }
  // Agent mode treats reduce as true. A query with nothing else is always
  // true; the others keep their remaining conditions. Plain queries need no
  // copy: the original block already applies to an agent through them.
  const reduce = queries.filter((q) => q.kind === "reduce");
  if (reduce.some((q) => q.rest.length === 0)) return { agent: null };
  return { agent: reduce.map((q) => q.rest.join(" and ")).join(", ") };
}

function unreadable(params, where) {
  return new Error(`agent-still: cannot read @media ${params}${where ? ` in ${where}` : ""}. Add support for it in postcss/agent-still.cjs.`);
}

/**
 * Splits a selector list on its top-level commas, and finds in each selector
 * where its subject ends: before its pseudo-element if it has one, else at its
 * end. Skips escapes (Tailwind's \: and \[), strings, and anything inside
 * brackets or parentheses, where spaces and commas are not separators.
 */
function scan(list) {
  const selectors = [];
  let depth = 0;
  let quote = "";
  let from = 0;
  let compound = 0;
  let pseudo = -1;
  const close = (to) => {
    const text = list.slice(from, to);
    const lead = text.length - text.trimStart().length;
    const body = text.trim();
    const at = pseudo >= 0 ? pseudo - from - lead : body.length;
    selectors.push({ lead: text.slice(0, lead), body, at, tail: text.slice(lead + body.length) });
  };
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (c === "\\") {
      // An escape: a hex code with one optional space after it, or one character.
      let j = i + 1;
      while (j < list.length && j < i + 7 && /[0-9a-f]/i.test(list[j])) j++;
      if (j > i + 1) i = /\s/.test(list[j] || "") ? j : j - 1;
      else i++;
      continue;
    }
    if (quote) {
      if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth > 0) continue;
    else if (c === ",") {
      close(i);
      from = i + 1;
      compound = from;
      pseudo = -1;
    } else if (/[\s>+~]/.test(c)) {
      // A combinator: the subject starts after it, unless nothing follows.
      let j = i;
      while (j < list.length && /[\s>+~]/.test(list[j])) j++;
      if (j < list.length && list[j] !== ",") {
        if (list.slice(from, i).trim()) {
          compound = j;
          pseudo = -1;
        }
      }
      i = j - 1;
    } else if (c === ":" && pseudo < 0 && i >= compound) {
      if (list[i + 1] === ":") pseudo = i;
      else {
        const name = /^[\w-]+/.exec(list.slice(i + 1));
        if (name && LEGACY_PSEUDO_ELEMENT.test(name[0]) && list[i + 1 + name[0].length] !== "(") pseudo = i;
      }
      if (list[i + 1] === ":") i++;
    }
  }
  close(list.length);
  return selectors;
}

/** Puts `condition` on the subject of every selector in the rule, before any pseudo-element. */
function onSubject(rule, condition) {
  rule.selector = scan(rule.selector)
    .map(({ lead, body, at, tail }) => lead + body.slice(0, at) + condition + body.slice(at) + tail)
    .join(",");
}

function insideRule(node) {
  for (let parent = node.parent; parent; parent = parent.parent) if (parent.type === "rule") return true;
  return false;
}

/**
 * Adds `condition` to everything a block styles. Rules get it on their
 * subject. Declarations sitting straight in a block nested inside a rule apply
 * to that rule's selector, so each run of them moves into `&<condition> {}`,
 * in place, which keeps their order and adds no specificity.
 */
function condition(block, cond, nested, Rule) {
  let run = null;
  for (const child of [...block.nodes]) {
    if (child.type === "decl" && nested) {
      if (!run) {
        run = new Rule({ selector: `&${cond}` });
        child.before(run);
      }
      run.append(child);
      continue;
    }
    if (child.type === "comment") continue;
    run = null;
    if (child.type === "rule") onSubject(child, cond);
    else if (child.type === "atrule" && GROUPING.test(child.name)) condition(child, cond, nested, Rule);
  }
}

/** Removes from a copy anything that would apply outside its rules. */
function dropGlobals(block, file) {
  block.walkAtRules((at) => {
    if (GLOBAL.test(at.name)) {
      console.warn(`agent-still: left @${at.name} out of the agent copy of a reduced-motion block${file ? ` in ${file}` : ""}.`);
      at.remove();
    }
  });
}

/** @type {import('postcss').PluginCreator<void>} */
module.exports = () => ({
  postcssPlugin: "agent-still",
  OnceExit(root, { Rule }) {
    const file = root.source?.input?.file;
    const blocks = [];
    root.walkAtRules("media", (media) => {
      const kind = classify(media.params, file);
      if (kind) blocks.push([media, kind]);
    });
    for (const [media, kind] of blocks) {
      const nested = insideRule(media);
      if (kind === "human") {
        condition(media, HUMAN, nested, Rule);
        continue;
      }
      const copy = media.clone();
      dropGlobals(copy, file);
      condition(copy, AGENT, nested, Rule);
      if (!copy.nodes.length) continue;
      if (kind.agent === null) media.after(copy.nodes);
      else {
        copy.params = kind.agent;
        media.after(copy);
      }
    }
  },
});
module.exports.postcss = true;
