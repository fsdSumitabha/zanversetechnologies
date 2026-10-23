/* ───────────────────────────────────────────────────────────────────────────
   BRAND COLOURS FOR CODE THAT CANNOT USE var()

   WebGL shaders, canvas 2D and three.js materials cannot read a CSS custom
   property, so they take the palette from here as plain hex strings:
   `new Color(brandPalette.brand)`.

   These are app/globals.css's @theme values written out. The two must change
   together; nothing else in the codebase may hold a colour. Everything that CAN
   use the tokens (bg-brand, text-brand-ink, color-mix over var(--color-brand))
   uses them instead.
   ─────────────────────────────────────────────────────────────────────────── */

export interface BrandPalette {
  brand: string;
  brandInk: string;
  from: string;
  to: string;
  glow: string;
  soft: string;
  onBrand: string;
  ink: string;
  line: string;
  bg: string;
}

/** Gold: the palette the UAE pages of the previous build were already in. */
export const brandPalette: BrandPalette = {
  brand: "#ffc400",
  brandInk: "#8b6904",
  from: "#ffd60a",
  to: "#f59e0b",
  glow: "#ffd60a",
  soft: "#fff4cc",
  onBrand: "#17130a",
  ink: "#17130a",
  line: "#ece6d5",
  bg: "#ffffff",
};
