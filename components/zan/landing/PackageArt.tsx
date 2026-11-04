import type { ReactNode } from "react";
import type { PackageArtKey } from "@/constants/landing";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────────────────────
   One small drawing per package, on the hero's drawing-board ground: what is
   actually being bought, as a wireframe. They take the place of the old pages'
   stock icons and of the 3D, weigh next to nothing, and are drawn in the site's
   tokens, so they follow the palette. Decorative: the card says everything in
   words.

   Each one moves a little when its card is hovered. The drawing is complete and
   at rest without that, so reduced motion and touch lose nothing.
   ─────────────────────────────────────────────────────────────────────────── */

/** Slides and scales glide; `fill-box` makes an element turn around its own middle. */
const MOVES = "transition-[translate,scale,rotate] duration-700 ease-out-expo [transform-box:fill-box] origin-center";

const ink = "fill-foreground/75";
const rule = "fill-border-strong";
const pale = "fill-surface-muted";
const accent = "fill-accent";
const tint = "fill-accent-soft";
const frame = "fill-surface stroke-border-strong";
const hair = "fill-none stroke-border-strong";

function Bar({
  x,
  y,
  w,
  h = 4,
  className = rule,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  className?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={className} />;
}

function Browser({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} className={frame} />
      <path d={`M${x} ${y + 14}H${x + w}`} className={hair} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 8 + i * 6} cy={y + 7} r={1.6} className={rule} />
      ))}
      {children}
    </g>
  );
}

function Phone({
  x,
  y,
  w = 60,
  h = 124,
  camera = "island",
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  camera?: "island" | "dot";
  children?: ReactNode;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} className={frame} />
      {camera === "island" ? (
        <rect x={x + w / 2 - 8} y={y + 5} width={16} height={4} rx={2} className={ink} />
      ) : (
        <circle cx={x + w / 2} cy={y + 7} r={2} className={ink} />
      )}
      {children}
    </g>
  );
}

/** The same small app screen, so two phones read as one product. */
function Screen({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x + 6} y={y + 15} width={48} height={30} rx={5} className={tint} />
      <Bar x={x + 6} y={y + 52} w={36} h={3.5} className={ink} />
      <Bar x={x + 6} y={y + 60} w={48} />
      <Bar x={x + 6} y={y + 67} w={42} />
      <rect x={x + 6} y={y + 76} width={22} height={18} rx={4} className={pale} />
      <rect x={x + 32} y={y + 76} width={22} height={18} rx={4} className={pale} />
      <rect x={x + 6} y={y + 101} width={48} height={12} rx={6} className={accent} />
    </g>
  );
}

/** A tick, in whatever is behind it's contrasting ink. */
function Tick({ cx, cy, r = 8 }: { cx: number; cy: number; r?: number }) {
  return (
    <path
      d={`M${cx - r * 0.42} ${cy + r * 0.02}l${r * 0.3} ${r * 0.32} ${r * 0.56}-${r * 0.66}`}
      className="fill-none stroke-accent-foreground"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function SearchBox({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={14} rx={7} className={pale} />
      <circle cx={x + 9} cy={y + 6.6} r={2.8} className="fill-none stroke-foreground/60" strokeWidth={1.3} />
      <path
        d={`M${x + 11} ${y + 8.8}l2.4 2.4`}
        className="fill-none stroke-foreground/60"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
      <Bar x={x + 18} y={y + 5} w={w * 0.4} />
    </g>
  );
}

function Star({ cx, cy, r = 4, className = accent }: { cx: number; cy: number; r?: number; className?: string }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? r * 0.45 : r;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return <polygon points={points.join(" ")} className={className} />;
}

function Heart({ x, y, s = 1, className = accent }: { x: number; y: number; s?: number; className?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 11C-5 7-8 4.5-8 1c0-2.8 2.1-4.6 4.4-4.6C-2-3.6-.7-2.7 0-1.4.7-2.7 2-3.6 3.6-3.6 5.9-3.6 8-1.8 8 1c0 3.5-3 6-8 10Z"
      className={className}
    />
  );
}

function Play({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={accent} />
      <path d={`M${cx - r * 0.28} ${cy - r * 0.4}v${r * 0.8}l${r * 0.68}-${r * 0.4}Z`} className="fill-accent-foreground" />
    </g>
  );
}

/** A small ad, or a post: the same picture wherever it runs. */
function Picture({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} className={tint} />
      <path
        d={`M${x} ${y + h * 0.82}l${w * 0.3}-${h * 0.34} ${w * 0.2} ${h * 0.2} ${w * 0.22}-${h * 0.26} ${w * 0.28} ${h * 0.4}V${y + h - 4}a4 4 0 0 1-4 4H${x + 4}a4 4 0 0 1-4-4Z`}
        className="fill-accent/45"
      />
      <circle cx={x + w * 0.74} cy={y + h * 0.26} r={Math.min(w, h) * 0.09} className={accent} />
    </g>
  );
}

const DRAWINGS: Record<PackageArtKey, () => ReactNode> = {
  /* One page, one form, one thumb-sized way to get on to WhatsApp. */
  "campaign-page": () => (
    <>
      <Browser x={48} y={20} w={206} h={140}>
        <Bar x={62} y={52} w={70} h={7} className={ink} />
        <Bar x={62} y={64} w={54} h={7} className={ink} />
        <Bar x={62} y={82} w={74} />
        <Bar x={62} y={90} w={62} />
        <rect x={62} y={104} width={46} height={13} rx={6.5} className={accent} />
      </Browser>
      <g className={cn(MOVES, "group-hover/card:-translate-x-1 group-hover/card:-translate-y-1.5")}>
        <rect x={158} y={46} width={84} height={100} rx={7} className={frame} />
        <rect x={166} y={55} width={68} height={12} rx={4} className={pale} />
        <rect x={166} y={72} width={68} height={12} rx={4} className={pale} />
        <rect x={166} y={89} width={68} height={22} rx={4} className={pale} />
        <rect x={166} y={118} width={68} height={17} rx={8.5} className={accent} />
      </g>
      <g className={cn(MOVES, "group-hover/card:scale-115")}>
        <circle cx={258} cy={150} r={13} className="fill-whatsapp" />
        <path
          d="M252 150a6 6 0 1 1 3 5.2l-3.4.9.9-3.3a6 6 0 0 1-.5-2.8Z"
          className="fill-none stroke-surface"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>
    </>
  ),

  /* A handful of pages behind the front one. They fan out on hover. */
  "starter-site": () => (
    <>
      <g className={cn(MOVES, "group-hover/card:translate-x-3 group-hover/card:-translate-y-2")}>
        <Browser x={142} y={18} w={118} h={108}>
          <Bar x={152} y={42} w={60} h={5} className={rule} />
          <Bar x={152} y={53} w={84} />
          <Bar x={152} y={61} w={74} />
        </Browser>
      </g>
      <g className={cn(MOVES, "group-hover/card:translate-x-1.5 group-hover/card:-translate-y-1")}>
        <Browser x={100} y={34} w={118} h={108}>
          <rect x={110} y={56} width={36} height={28} rx={4} className={pale} />
          <rect x={150} y={56} width={36} height={28} rx={4} className={pale} />
          <Bar x={110} y={92} w={84} />
        </Browser>
      </g>
      <Browser x={58} y={50} w={118} h={112}>
        <rect x={68} y={72} width={98} height={38} rx={5} className={tint} />
        <path d="M68 104l24-16 16 10 18-14 40 26H68Z" className="fill-accent/45" />
        <circle cx={146} cy={82} r={5} className={accent} />
        <Bar x={68} y={118} w={62} h={5} className={ink} />
        <Bar x={68} y={129} w={92} />
        <rect x={68} y={140} width={36} height={12} rx={6} className={accent} />
      </Browser>
    </>
  ),

  /* A company's front door, with the numbers behind it. The bars grow on hover. */
  "business-site": () => (
    <Browser x={40} y={20} w={240} h={140}>
      <circle cx={54} cy={46} r={5} className={accent} />
      <Bar x={190} y={44} w={18} />
      <Bar x={214} y={44} w={18} />
      <Bar x={238} y={44} w={28} />
      <Bar x={54} y={66} w={84} h={7} className={ink} />
      <Bar x={54} y={78} w={62} h={7} className={ink} />
      <Bar x={54} y={94} w={88} />
      <Bar x={54} y={102} w={72} />
      <rect x={54} y={116} width={42} height={13} rx={6.5} className={accent} />
      <rect x={160} y={60} width={106} height={86} rx={6} className="fill-surface-muted stroke-border" />
      {[
        { x: 171, h: 20, c: rule },
        { x: 188, h: 32, c: rule },
        { x: 205, h: 26, c: rule },
        { x: 222, h: 44, c: "fill-accent/55" },
        { x: 239, h: 60, c: accent },
      ].map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={136 - b.h}
          width={12}
          height={b.h}
          rx={2}
          className={cn(b.c, MOVES, "origin-bottom group-hover/card:scale-y-110")}
        />
      ))}
    </Browser>
  ),

  /* Shelves and a basket. The basket's count pops on hover. */
  "online-store": () => (
    <>
      <Browser x={40} y={20} w={240} h={140}>
        <Bar x={52} y={44} w={46} h={5} className={ink} />
        {[0, 1, 2].map((col) =>
          [0, 1].map((row) => {
            const x = 52 + col * 73;
            const y = 58 + row * 48;
            const lit = col === 1 && row === 0;
            return (
              <g key={`${col}-${row}`}>
                <rect x={x} y={y} width={66} height={30} rx={4} className={lit ? tint : pale} />
                <Bar x={x} y={y + 35} w={38} className={lit ? ink : rule} />
                {lit && <rect x={x + 44} y={y + 33} width={22} height={8} rx={4} className={accent} />}
              </g>
            );
          }),
        )}
      </Browser>
      <g className={cn(MOVES, "group-hover/card:scale-125")}>
        <circle cx={262} cy={46} r={10} className={accent} />
        <path
          d="M258 43h1.4l1.2 6h5.2l1-4.4h-6.6"
          className="fill-none stroke-accent-foreground"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  ),

  /* One phone now; the dashed ones are what the first users' answers decide. */
  "mvp-app": () => (
    <>
      <g className={cn(MOVES, "group-hover/card:-translate-x-2")}>
        <rect
          x={70}
          y={44}
          width={52}
          height={106}
          rx={9}
          className="fill-none stroke-border-strong"
          strokeDasharray="4 4"
        />
      </g>
      <g className={cn(MOVES, "group-hover/card:translate-x-2")}>
        <rect
          x={198}
          y={44}
          width={52}
          height={106}
          rx={9}
          className="fill-none stroke-border-strong"
          strokeDasharray="4 4"
        />
      </g>
      <Phone x={130} y={26}>
        <Screen x={130} y={26} />
      </Phone>
    </>
  ),

  /* Two phones, one codebase between them. */
  "cross-platform": () => (
    <>
      <path d="M126 90h68" className={hair} strokeDasharray="3 3" />
      <g className={cn(MOVES, "group-hover/card:translate-x-1.5")}>
        <Phone x={66} y={28} camera="island">
          <Screen x={66} y={28} />
        </Phone>
      </g>
      <g className={cn(MOVES, "group-hover/card:-translate-x-1.5")}>
        <Phone x={194} y={28} camera="dot">
          <Screen x={194} y={28} />
        </Phone>
      </g>
      <g className={cn(MOVES, "group-hover/card:scale-110")}>
        <rect x={140} y={76} width={40} height={28} rx={14} className={accent} />
        <path
          d="M154 85l-5 5 5 5m12-10 5 5-5 5m-4-11-4 12"
          className="fill-none stroke-accent-foreground"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  ),

  /* A native app, its systems behind it, and the lock between them. */
  "enterprise-app": () => (
    <>
      <Phone x={62} y={28}>
        <Screen x={62} y={28} />
      </Phone>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={186} y={36 + i * 38} width={78} height={30} rx={6} className={frame} />
          <circle cx={198} cy={51 + i * 38} r={2.5} className={i === 0 ? accent : rule} />
          <Bar x={206} y={49 + i * 38} w={46} />
        </g>
      ))}
      <path d="M122 90h64" className={hair} strokeDasharray="3 3" />
      <g className={cn(MOVES, "group-hover/card:-translate-y-1 group-hover/card:scale-110")}>
        <path d="M154 70l15 5.5v12c0 10-6.4 16.6-15 20-8.6-3.4-15-10-15-20v-12L154 70Z" className={accent} />
        <path
          d="m147.5 89 4.6 4.6 8.4-9"
          className="fill-none stroke-accent-foreground"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </>
  ),

  /* The app, and the loop of releases that keeps it current. It turns on hover. */
  "app-care": () => (
    <>
      <Phone x={70} y={28}>
        <Screen x={70} y={28} />
      </Phone>
      <g className={cn(MOVES, "group-hover/card:rotate-90")}>
        <path d="M188 60a30 30 0 0 1 49 12" className="fill-none stroke-accent" strokeWidth={3} strokeLinecap="round" />
        <path
          d="M242 62l-4 11-10-5"
          className="fill-none stroke-accent"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M240 90a30 30 0 0 1-49-12"
          className="fill-none stroke-border-strong"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d="M186 88l4-11 10 5"
          className="fill-none stroke-border-strong"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path d="M162 134h92" className={hair} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={170 + i * 26} cy={134} r={4.5} className={i === 3 ? accent : "fill-surface stroke-border-strong"} />
      ))}
    </>
  ),

  /* ── Search ─────────────────────────────────────────────────────────────── */

  /* A results page, with you in first place. */
  seo: () => (
    <Browser x={48} y={20} w={224} h={140}>
      <SearchBox x={60} y={42} w={168} />
      {[0, 1].map((i) => (
        <g key={i}>
          <circle cx={75} cy={118 + i * 21} r={5} className={pale} />
          <Bar x={90} y={112 + i * 21} w={78 - i * 16} className={rule} />
          <Bar x={90} y={120 + i * 21} w={132 - i * 24} className={pale} />
        </g>
      ))}
      <g className={cn(MOVES, "group-hover/card:-translate-y-1 group-hover/card:scale-[1.03]")}>
        <rect x={60} y={64} width={200} height={36} rx={6} className="fill-accent-soft stroke-accent/40" />
        <circle cx={76} cy={82} r={9} className={accent} />
        <Tick cx={76} cy={82} r={9} />
        <Bar x={93} y={74} w={94} h={5} className={ink} />
        <Bar x={93} y={85} w={150} />
      </g>
    </Browser>
  ),

  /* An AI assistant's answer, with your name in it. */
  "ai-search": () => (
    <>
      <rect x={128} y={22} width={136} height={24} rx={12} className={pale} />
      <Bar x={142} y={32} w={108} />
      <rect x={52} y={56} width={216} height={100} rx={12} className={frame} />
      <rect x={64} y={68} width={15} height={15} rx={5} className={ink} />
      <Bar x={86} y={73} w={58} h={5} className={rule} />
      <Bar x={66} y={94} w={188} />
      <Bar x={66} y={108} w={52} />
      <g className={cn(MOVES, "group-hover/card:scale-110")}>
        <rect x={124} y={102} width={72} height={16} rx={8} className={accent} />
        <Bar x={134} y={108} w={52} h={4} className="fill-accent-foreground/70" />
      </g>
      <Bar x={202} y={108} w={52} />
      <Bar x={66} y={126} w={172} />
      <Bar x={66} y={138} w={110} />
    </>
  ),

  /* Three disciplines that only pay off where they overlap. */
  "search-bundle": () => (
    <>
      <g className={cn(MOVES, "group-hover/card:translate-y-1")}>
        <circle cx={160} cy={62} r={42} className="fill-accent/20 stroke-border-strong" />
        <text x={160} y={46} textAnchor="middle" className="fill-foreground/70 font-mono text-[10px]">
          SEO
        </text>
      </g>
      <g className={cn(MOVES, "group-hover/card:translate-x-1 group-hover/card:-translate-y-0.5")}>
        <circle cx={126} cy={116} r={42} className="fill-accent/20 stroke-border-strong" />
        <text x={108} y={132} textAnchor="middle" className="fill-foreground/70 font-mono text-[10px]">
          AEO
        </text>
      </g>
      <g className={cn(MOVES, "group-hover/card:-translate-x-1 group-hover/card:-translate-y-0.5")}>
        <circle cx={194} cy={116} r={42} className="fill-accent/20 stroke-border-strong" />
        <text x={212} y={132} textAnchor="middle" className="fill-foreground/70 font-mono text-[10px]">
          GEO
        </text>
      </g>
      <circle cx={160} cy={97} r={13} className={accent} />
      <Tick cx={160} cy={97} r={13} />
    </>
  ),

  /* A store listing, and the words it is found by. */
  aso: () => (
    <>
      <g className={cn(MOVES, "group-hover/card:translate-x-1.5")}>
        <rect x={50} y={58} width={70} height={16} rx={8} className={frame} />
        <Bar x={60} y={64} w={46} />
        <rect x={66} y={82} width={54} height={16} rx={8} className="fill-accent-soft stroke-accent/40" />
        <Bar x={76} y={88} w={32} className="fill-accent-ink/60" />
        <rect x={58} y={106} width={62} height={16} rx={8} className={frame} />
        <Bar x={68} y={112} w={40} />
      </g>
      <Phone x={130} y={26}>
        <rect x={137} y={41} width={18} height={18} rx={5} className={accent} />
        <Bar x={159} y={44} w={24} h={4} className={ink} />
        <Bar x={159} y={53} w={18} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} cx={141 + i * 9.5} cy={69} r={3.8} />
        ))}
        <rect x={137} y={78} width={46} height={12} rx={6} className={accent} />
        <rect x={137} y={96} width={21} height={44} rx={3} className={tint} />
        <rect x={162} y={96} width={21} height={44} rx={3} className={pale} />
      </Phone>
      <g className={cn(MOVES, "group-hover/card:-translate-x-1.5")}>
        <rect x={200} y={70} width={66} height={16} rx={8} className={frame} />
        <Bar x={210} y={76} w={42} />
        <rect x={200} y={94} width={50} height={16} rx={8} className={frame} />
        <Bar x={210} y={100} w={28} />
      </g>
    </>
  ),

  /* ── Paid media ─────────────────────────────────────────────────────────── */

  /* The ad at the top of the search, aimed. */
  "google-ads": () => (
    <Browser x={48} y={20} w={224} h={140}>
      <SearchBox x={60} y={42} w={168} />
      <rect x={60} y={64} width={200} height={36} rx={6} className="fill-accent-soft stroke-accent/40" />
      <rect x={69} y={72} width={20} height={11} rx={3} className={accent} />
      <text x={79} y={80.5} textAnchor="middle" className="fill-accent-foreground font-mono text-[7.5px] font-semibold">
        Ad
      </text>
      <Bar x={95} y={75} w={112} h={5} className={ink} />
      <Bar x={69} y={89} w={174} />
      <Bar x={60} y={112} w={120} className={rule} />
      <Bar x={60} y={120} w={146} className={pale} />
      <Bar x={60} y={136} w={96} className={rule} />
      <Bar x={60} y={144} w={120} className={pale} />
      <g className={cn(MOVES, "group-hover/card:scale-115")}>
        <circle cx={238} cy={132} r={19} className="fill-surface stroke-border-strong" />
        <circle cx={238} cy={132} r={12} className={tint} />
        <circle cx={238} cy={132} r={5} className={accent} />
      </g>
    </Browser>
  ),

  /* A post in the feed, and the chat its button opens. */
  "meta-ads": () => (
    <>
      <Phone x={72} y={26}>
        <circle cx={85} cy={46} r={5} className={pale} />
        <Bar x={94} y={44} w={26} />
        <Picture x={78} y={56} w={48} h={46} />
        <Bar x={78} y={108} w={40} />
        <Bar x={78} y={115} w={30} />
        <rect x={78} y={125} width={48} height={15} rx={7.5} className={accent} />
      </Phone>
      <path d="M132 132C164 132 158 86 186 86" className={hair} strokeDasharray="3 3" />
      <g className={cn(MOVES, "group-hover/card:scale-105")}>
        <rect x={186} y={48} width={84} height={82} rx={12} className={frame} />
        <circle cx={201} cy={63} r={8} className="fill-whatsapp" />
        <Bar x={214} y={61} w={42} />
        <rect x={196} y={80} width={46} height={14} rx={7} className={pale} />
        <rect x={214} y={100} width={46} height={14} rx={7} className="fill-whatsapp/25" />
      </g>
    </>
  ),

  /* The people who sign, at the top of the people who do not. */
  "linkedin-ads": () => (
    <>
      <path d="M160 56v14M100 70h120M100 70v14M220 70v14M100 114v12M220 114v12M64 126h72M184 126h72" className={hair} />
      {[64, 136, 184, 256].map((x) => (
        <rect key={x} x={x - 24} y={126} width={48} height={24} rx={6} className={frame} />
      ))}
      {[100, 220].map((x) => (
        <g key={x}>
          <rect x={x - 34} y={84} width={68} height={30} rx={7} className={frame} />
          <circle cx={x - 20} cy={99} r={6} className={pale} />
          <Bar x={x - 10} y={97} w={34} />
        </g>
      ))}
      <g className={cn(MOVES, "group-hover/card:-translate-y-1.5 group-hover/card:scale-105")}>
        <rect x={120} y={22} width={80} height={34} rx={8} className={accent} />
        <circle cx={137} cy={39} r={7.5} className="fill-accent-foreground/75" />
        <Bar x={150} y={36} w={40} h={5} className="fill-accent-foreground/75" />
      </g>
    </>
  ),

  /* Spend in at the top, revenue out at the bottom, one dashboard on all of it. */
  "full-funnel": () => (
    <>
      <path d="M46 28h156l-17 28H63Z" className={rule} />
      <path d="M67 60h114l-15 28H82Z" className={tint} />
      <path d="M86 92h76l-13 28H99Z" className="fill-accent/55" />
      <g className={cn(MOVES, "group-hover/card:translate-y-1.5")}>
        <path d="M103 124h42l-8 28h-26Z" className={accent} />
      </g>
      <rect x={214} y={42} width={66} height={102} rx={8} className={frame} />
      <Bar x={224} y={54} w={36} h={4} className={ink} />
      <path
        d="M224 122c12-4 16-20 26-22s12-14 20-24"
        className="fill-none stroke-accent"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={270} cy={76} r={3.5} className={accent} />
      <Bar x={224} y={130} w={44} />
    </>
  ),

  /* ── Social ─────────────────────────────────────────────────────────────── */

  /* A calendar you can see, with a steady few posts on it. */
  "social-starter": () => (
    <>
      <rect x={62} y={20} width={196} height={142} rx={10} className={frame} />
      <path d="M62 44H258" className={hair} />
      <Bar x={76} y={30} w={58} h={5} className={ink} />
      <circle cx={244} cy={32} r={4} className={rule} />
      {Array.from({ length: 28 }, (_, i) => {
        const lit = [2, 5, 8, 11, 16, 19, 22, 26].includes(i);
        return (
          <rect
            key={i}
            x={72 + (i % 7) * 26}
            y={52 + Math.floor(i / 7) * 26}
            width={20}
            height={20}
            rx={4}
            className={cn(lit ? accent : pale, lit && MOVES, lit && "group-hover/card:scale-110")}
          />
        );
      })}
    </>
  ),

  /* A reel, and what it starts. */
  "social-growth": () => (
    <>
      <Phone x={104} y={26}>
        <rect x={110} y={40} width={48} height={72} rx={5} className={tint} />
        <Play cx={134} cy={76} />
        <Bar x={110} y={119} w={34} className={ink} />
        <Bar x={110} y={127} w={48} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={124 + i * 10} cy={139} r={2.2} className={i === 0 ? accent : rule} />
        ))}
      </Phone>
      <g className={cn(MOVES, "group-hover/card:-translate-y-2")}>
        <Heart x={196} y={52} s={1.5} />
        <Heart x={228} y={80} s={1} className="fill-accent/55" />
        <Heart x={186} y={92} s={0.8} className="fill-accent/35" />
      </g>
      <rect x={180} y={116} width={82} height={28} rx={14} className={frame} />
      <circle cx={196} cy={130} r={6} className={pale} />
      <Bar x={208} y={128} w={42} />
    </>
  ),

  /* Several platforms at once, with video leading. */
  "social-scale": () => (
    <>
      <g className={cn(MOVES, "group-hover/card:-translate-x-2")}>
        <g transform="rotate(-11 160 96)">
          <rect x={112} y={36} width={82} height={116} rx={9} className={frame} />
          <rect x={120} y={46} width={66} height={52} rx={4} className={pale} />
          <Bar x={120} y={106} w={50} />
        </g>
      </g>
      <g className={cn(MOVES, "group-hover/card:translate-x-2")}>
        <g transform="rotate(11 160 96)">
          <rect x={126} y={36} width={82} height={116} rx={9} className={frame} />
          <rect x={134} y={46} width={66} height={52} rx={4} className={pale} />
          <Bar x={134} y={106} w={50} />
        </g>
      </g>
      <rect x={116} y={26} width={88} height={130} rx={10} className={frame} />
      <rect x={124} y={36} width={72} height={74} rx={5} className={tint} />
      <Play cx={160} cy={73} r={13} />
      <Bar x={124} y={118} w={50} className={ink} />
      <Bar x={124} y={127} w={72} />
      <Bar x={124} y={136} w={58} />
    </>
  ),

  /* The studio behind the calendar. */
  "content-production": () => (
    <>
      <rect x={100} y={34} width={38} height={18} rx={4} className={frame} />
      <rect x={60} y={46} width={156} height={100} rx={13} className={frame} />
      <circle cx={138} cy={96} r={38} className="fill-surface-muted stroke-border-strong" />
      <g className={cn(MOVES, "group-hover/card:scale-110")}>
        <circle cx={138} cy={96} r={26} className={tint} />
        <circle cx={138} cy={96} r={15} className={ink} />
        <circle cx={144} cy={90} r={4.5} className={accent} />
      </g>
      <rect x={190} y={58} width={16} height={10} rx={3} className={accent} />
      <rect x={232} y={36} width={34} height={118} rx={5} className={frame} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={238} y={43 + i * 27} width={22} height={21} rx={2.5} className={i === 1 ? tint : pale} />
      ))}
    </>
  ),

  /* ── Creators ───────────────────────────────────────────────────────────── */

  /* Three profiles, and the one that holds up on inspection. */
  "creator-vetting": () => (
    <>
      {[50, 128, 206].map((x) => (
        <g key={x}>
          <rect x={x} y={40} width={64} height={100} rx={9} className={frame} />
          <circle cx={x + 32} cy={66} r={13} className={x === 128 ? tint : pale} />
          <Bar x={x + 13} y={88} w={38} h={4} className={x === 128 ? ink : rule} />
          <Bar x={x + 10} y={100} w={44} />
          <Bar x={x + 15} y={110} w={34} />
        </g>
      ))}
      <g className={cn(MOVES, "group-hover/card:-translate-x-1 group-hover/card:-translate-y-1")}>
        <path d="M193 133l15 15" className="fill-none stroke-foreground/75" strokeWidth={5} strokeLinecap="round" />
        <circle cx={172} cy={113} r={27} className="fill-surface/55 stroke-foreground/75" strokeWidth={3} />
        <circle cx={172} cy={113} r={12} className={accent} />
        <Tick cx={172} cy={113} r={12} />
      </g>
    </>
  ),

  /* Brief, content, approved: creators on time and on message. */
  "creator-campaign": () => (
    <>
      <path d="M112 90h16M194 90h16" className={hair} strokeDasharray="3 3" />
      <rect x={46} y={46} width={66} height={88} rx={9} className={frame} />
      <Bar x={56} y={60} w={32} h={4} className={ink} />
      <Bar x={56} y={74} w={46} />
      <Bar x={56} y={84} w={40} />
      <Bar x={56} y={94} w={46} />
      <Bar x={56} y={104} w={28} />
      <rect x={128} y={46} width={66} height={88} rx={9} className={frame} />
      <Picture x={136} y={55} w={50} h={44} />
      <Bar x={136} y={108} w={44} />
      <Bar x={136} y={118} w={30} />
      <g className={cn(MOVES, "group-hover/card:-translate-y-1.5 group-hover/card:scale-105")}>
        <rect x={210} y={46} width={66} height={88} rx={9} className="fill-accent-soft stroke-accent/40" />
        <circle cx={243} cy={80} r={17} className={accent} />
        <Tick cx={243} cy={80} r={17} />
        <Bar x={222} y={110} w={42} className="fill-accent-ink/60" />
      </g>
    </>
  ),

  /* A creator's post, carried over into your own ads. */
  "ugc-whitelist": () => (
    <>
      <rect x={46} y={36} width={92} height={112} rx={10} className={frame} />
      <circle cx={60} cy={50} r={6} className={tint} />
      <Bar x={71} y={48} w={44} />
      <Picture x={54} y={62} w={76} h={58} />
      <Heart x={62} y={131} s={0.6} />
      <Bar x={74} y={132} w={34} />
      <path d="M146 92h24" className={hair} strokeDasharray="3 3" />
      <path d="m166 87 6 5-6 5" className={hair} strokeLinecap="round" strokeLinejoin="round" />
      <g className={cn(MOVES, "group-hover/card:-translate-x-1")}>
        <Phone x={182} y={26}>
          <rect x={188} y={41} width={20} height={11} rx={3} className={accent} />
          <text x={198} y={49.5} textAnchor="middle" className="fill-accent-foreground font-mono text-[7.5px] font-semibold">
            Ad
          </text>
          <Picture x={188} y={58} w={48} h={46} />
          <Bar x={188} y={111} w={38} />
          <rect x={188} y={122} width={48} height={18} rx={9} className={accent} />
        </Phone>
      </g>
    </>
  ),

  /* Every collaboration, down to a number. */
  "creator-attribution": () => (
    <>
      <rect x={50} y={24} width={220} height={132} rx={10} className={frame} />
      <path d="M66 74H254M66 104H254M66 134H254" className="fill-none stroke-border" />
      <path d="M68 134c26-6 38-22 62-26s38-18 60-32 40-22 60-30V134Z" className="fill-accent/15" />
      <path
        d="M68 134c26-6 38-22 62-26s38-18 60-32 40-22 60-30"
        className="fill-none stroke-accent"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {[
        [130, 108],
        [190, 76],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={4} className="fill-surface stroke-accent" strokeWidth={2} />
      ))}
      <circle cx={250} cy={46} r={6} className={accent} />
      <g className={cn(MOVES, "group-hover/card:scale-110")}>
        <rect x={62} y={36} width={78} height={22} rx={11} className={tint} />
        <path
          d="M76 50.5l-1 1a3 3 0 0 1-4.2-4.2l2.4-2.4a3 3 0 0 1 4.2 0M75.6 42.5l1-1a3 3 0 0 1 4.2 4.2l-2.4 2.4a3 3 0 0 1-4.2 0"
          className="fill-none stroke-accent-ink"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Bar x={90} y={45} w={40} className="fill-accent-ink/60" />
      </g>
    </>
  ),
};

export function PackageArt({ name, className }: { name: PackageArtKey; className?: string }) {
  return (
    <svg viewBox="0 -18 320 198" aria-hidden="true" className={cn("block size-full", className)}>
      {DRAWINGS[name]()}
    </svg>
  );
}
