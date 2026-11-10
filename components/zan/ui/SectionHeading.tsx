"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

const HEADINGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3 } as const;

/* The in-view entrance's line rise. The eyebrow's and the lead's timings are
   inline below. entrance="css" plays the same three as keyframes in
   app/globals.css (zan-eyebrow-in, zan-title-in, zan-lead-in), with the same
   distances, durations, delays and ease: change them together. */
const line: Variants = {
  hidden: { y: "110%" },
  visible: (i: number) => ({
    y: "0%",
    transition: { duration: 1.1, ease: EASE, delay: 0.06 + i * 0.08 },
  }),
};

/**
 * A display heading is sized against the column it sits in, not against the
 * window.
 *
 * The scale reaches its 5.25rem ceiling at about a 1040px viewport, but a hero
 * heading only has seven of the band's twelve columns — 529px at 1024, against
 * 691px from 1320px up. So between those two widths the heading was set at 83px
 * inside a box that could hold about 65px, and a title that is one long word
 * with nowhere to wrap ran straight out under the panel beside it:
 * CYBERSECURITY overhung by 113px, PERFORMANCE MARKETING by 64px, WEB
 * DEVELOPMENT, MOBILE APP DEVELOPMENT and SOCIAL MEDIA MANAGEMENT by about 50px
 * each, measured on the pages themselves.
 *
 * `cqi` is one percent of the wrapper's own inline size, so this caps the type
 * at whatever the column can actually hold. 12.2 is set by the longest word in
 * the catalogue: CYBERSECURITY is 7.75em wide in the display face, and 100/7.75
 * is 12.9, taken down to 12.2 for margin. At a full-width container it works out
 * above the ceiling, so `min` leaves the scale untouched from 1320px up and
 * everywhere the heading is not in a column.
 */
const DISPLAY_FIT = "min(var(--text-display), 12.2cqi)";

/**
 * Eyebrow + display heading + lead, with each heading line rising out of its
 * own mask as it enters. The lines are the heading's real text, with a space
 * between them: it renders nothing between two blocks, and it keeps the last
 * word of one line apart from the first word of the next for anything that
 * reads the text rather than the layout.
 *
 * Two entrances, chosen by `entrance`.
 *
 * "view", the default, for every heading further down a page: Framer Motion
 * plays it as the heading scrolls into view. The in-view trigger sits on the
 * HEADING, not on each line. A line starts translated fully below its
 * overflow-hidden mask, and IntersectionObserver clips a target by its
 * ancestors' overflow — so a line watching itself never intersects and never
 * rises. The heading's own box is never clipped; it fires once and its
 * variant propagates to the lines. Reduced motion: <MotionConfig
 * reducedMotion="user"> in the root turns the rise into a plain appearance.
 * No-JS: the noscript rule in layout.tsx shows every [data-reveal] element
 * at rest.
 *
 * "css", for the heading at the top of a page (PageHero). The same entrance,
 * played by keyframes in app/globals.css that start on the first frame of
 * the server HTML instead of after hydration. The in-view version starts the
 * eyebrow and the lead at opacity 0, so on a slow phone they stayed off the
 * screen until the scripts ran: on /privacy-policy, on slow 4G at 4x CPU, the
 * lead was the largest paint at 6.1 s against a first paint at 2.6 s. Here
 * the eyebrow and the lead rise and come into focus with transform and blur,
 * never opacity, so they are painted from the first frame, and the lines
 * rise out of their masks as above. The markup is the same on the server and
 * the client, so hydration leaves the running animations alone. There is no
 * [data-reveal] on these: nothing here waits for JavaScript, so without it
 * the entrance plays as it does for everyone. Reduced motion, Pause
 * animations and client-side navigation are covered beside the keyframes.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as = "h2",
  size = "h1",
  id,
  accentLine,
  entrance = "view",
  className,
  leadClassName,
}: {
  eyebrow?: string;
  title: readonly string[];
  lead?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "display" | "h1" | "h2";
  /** On the heading element, for a section's aria-labelledby. */
  id?: string;
  /** Index of the one title line set in the brand text gradient. One per view, at most. */
  accentLine?: number;
  /**
   * When the entrance plays. "view": as the heading scrolls into view, with
   * Framer Motion. "css": from the first frame, without waiting for the
   * scripts, for a heading that is on screen at load.
   */
  entrance?: "view" | "css";
  className?: string;
  leadClassName?: string;
}) {
  const centred = align === "center";
  const display = size === "display";
  const wrapperClass = cn(
    /* The query container DISPLAY_FIT measures against. Only on the
       display size, so nothing else on the site takes containment. */
    display && "[container-type:inline-size]",
    centred && "mx-auto flex flex-col items-center text-center",
    className,
  );
  /* Inline, so it overrides only the font-size the text-display utility
     sets and leaves its line height, tracking and weight alone. */
  const headingStyle = display ? { fontSize: DISPLAY_FIT } : undefined;
  const headingClass = cn(
    "font-display text-balance",
    display ? "text-display" : size === "h1" ? "text-h1" : "text-h2",
    eyebrow && "mt-5",
  );
  const lineClass = (i: number) => cn("block", i === accentLine && "text-accent-gradient");
  const leadClass = cn("mt-6 max-w-[54ch] text-lead text-muted", leadClassName);
  /* Each line inside its own mask, a space between them. Both entrances
     share it, so the masks are the same whichever one plays. */
  const lines = (renderLine: (text: string, i: number) => ReactNode) =>
    title.map((text, i) => (
      <Fragment key={i}>
        {i > 0 && " "}
        <span className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">{renderLine(text, i)}</span>
      </Fragment>
    ));

  if (entrance === "css") {
    const Tag = as;
    return (
      <div className={wrapperClass}>
        {eyebrow && (
          <div className="zan-eyebrow-in">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
        )}

        {/* --zan-line, the line's index, staggers the delays, as `custom`
            does for the in-view version. */}
        <Tag id={id} style={headingStyle} className={headingClass}>
          {lines((text, i) => (
            <span className={cn("zan-title-in", lineClass(i))} style={{ "--zan-line": i } as CSSProperties}>
              {text}
            </span>
          ))}
        </Tag>

        {lead && <p className={cn("zan-lead-in", leadClass)}>{lead}</p>}
      </div>
    );
  }

  const Heading = HEADINGS[as];
  return (
    <div className={wrapperClass}>
      {eyebrow && (
        <motion.div
          data-reveal
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
      )}

      <Heading
        id={id}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        style={headingStyle}
        className={headingClass}
      >
        {lines((text, i) => (
          <motion.span data-reveal className={lineClass(i)} variants={line} custom={i}>
            {text}
          </motion.span>
        ))}
      </Heading>

      {lead && (
        <motion.p
          data-reveal
          className={leadClass}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          {lead}
        </motion.p>
      )}
    </div>
  );
}
