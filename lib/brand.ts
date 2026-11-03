/* ───────────────────────────────────────────────────────────────────────────
   BRAND COLOURS FOR CODE THAT CANNOT USE var()

   WebGL shaders, canvas 2D and three.js materials cannot read a CSS custom
   property, so they take the palette from here as plain hex strings:
   `new Color(brandPalette.accent)`.

   These are app/globals.css's @theme values written out, in their light theme.
   The two must change together; nothing else in the codebase may hold a colour.
   Everything that CAN use the tokens (bg-accent, text-accent-ink, color-mix over
   var(--color-accent)) uses them instead.
   ─────────────────────────────────────────────────────────────────────────── */

export interface BrandPalette {
  canvas: string;
  surface: string;
  foreground: string;
  border: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  accentForeground: string;
  from: string;
  to: string;
  glow: string;
}

/** Navy and cyan, the logo's two colours, over a slate neutral. */
export const brandPalette: BrandPalette = {
  canvas: "#f8fafc",
  surface: "#ffffff",
  foreground: "#0f172a",
  border: "#e2e8f0",
  accent: "#44d9f8",
  accentInk: "#11677d",
  accentSoft: "#ecfcff",
  accentForeground: "#08204a",
  from: "#172554",
  to: "#44d9f8",
  glow: "#78e5fb",
};
