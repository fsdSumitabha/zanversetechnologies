import Image from "next/image";
import type { Person } from "@/constants/zan";
import { cn } from "@/lib/utils";

/* The one portrait frame, shared by the homepage rail's card and the two
   cards on /our-team, so a headshot that lands looks the same in all three
   and only one place has to know what to do when there isn't one. */

/**
 * The fallback: the person's initials. Initials rather than the first two
 * letters of the first name, which is what this frame used to draw — three of
 * the six names begin with S, and "Sr / Su / Sa" is a far harder set to tell
 * apart at a glance than "SM / SD / SB".
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * The headshot once there is one, and the monogram until then.
 *
 * `fill` rather than width and height, so `portrait` in constants/zan.ts can
 * stay a bare path: adding a photograph is one line, in whatever format it
 * arrived in, and no dimension has to be measured and typed out first. The
 * frame is square and the file is specified square, so when the spec is
 * followed `object-cover` has nothing to crop.
 */
export function Portrait({
  person,
  sizes,
  className,
  monogramClassName,
}: {
  person: Person;
  /** What the frame measures at each breakpoint; `fill` needs telling. */
  sizes: string;
  /** The frame's size and radius. */
  className?: string;
  monogramClassName?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-soft",
        className,
      )}
    >
      {person.portrait ? (
        <Image src={person.portrait} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden="true" className={cn("font-display text-brand-ink", monogramClassName)}>
          {initials(person.name)}
        </span>
      )}
    </span>
  );
}
