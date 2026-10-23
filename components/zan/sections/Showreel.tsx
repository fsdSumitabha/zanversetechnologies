import { ShowreelStage } from "@/components/zan/showreel/ShowreelStage";
import { office, site } from "@/constants/zan";

/**
 * SHOWREEL (#showreel) — the wordmark as a window onto Dubai.
 *
 * The section pins on the page ground with ZANVERSE set across the screen
 * (ZAN over VERSE on a phone) and the city's skyline at golden hour inside
 * the letters. Scrolling opens the letters: the word grows out of the stem of
 * its E until the ink has passed the edges of the screen and the picture is
 * full bleed. It holds there, then fades back to the page ground so the
 * metrics below arrive on continuous white.
 *
 * The word is drawn as a hole in a sheet of --color-bg rather than as type, so
 * it is invisible to a screen reader. The heading carries the section as real
 * text and names it, so the outline and the landmark list say what this is
 * rather than repeating the company name alone.
 *
 * No lead line: every short sentence in the content is already a heading or a
 * lead further down this page.
 *
 * The picture is the UAE skyline the About collage also uses (Burj Khalifa,
 * Burj Al Arab), kept moving by CSS. The previous site's brand film is not
 * used here: it carries the old name and other cities' landmarks.
 */
export function Showreel() {
  return (
    <section id="showreel" aria-labelledby="showreel-title" className="relative bg-bg">
      <h2 id="showreel-title" className="sr-only">
        {`${site.name} in ${office.city}`}
      </h2>
      <ShowreelStage eyebrow={`${office.city}, ${office.country}`} still="/images/uae/uae_landscape.webp" />
    </section>
  );
}
