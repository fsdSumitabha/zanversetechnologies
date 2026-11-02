"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/components/zan/shell/shellStore";
import { MQ } from "@/lib/gsap";

/**
 * Dubai at the close of the page, in the brand's gold: the Burj Khalifa to the
 * centre, the Burj Al Arab to the right, open sky above them to rise out of the
 * section's ground. It rises a little further as the reader arrives, which is
 * the only movement on it.
 *
 * The artwork is the site's own skyline (/images/uae/uae_landscape.webp): its
 * baked-in map pin retouched out, its uneven sky flattened and the whole mapped
 * onto the gold ramp. On a phone `object-cover` keeps the two landmarks in the
 * frame rather than a slice of water, by anchoring to the right of centre.
 */
export function Skyline() {
  const root = useRef<HTMLDivElement>(null);
  const still = useMediaQuery(MQ.reduce);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["9%", "0%"]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="zan-lp-skyline pointer-events-none relative -mt-6 h-[18rem] overflow-hidden sm:-mt-10 sm:h-[24rem] lg:-mt-24 lg:aspect-[3/1] lg:h-auto lg:max-h-[42rem] lg:w-full"
    >
      <motion.div className="absolute inset-0" style={{ y: still ? 0 : y }}>
        <Image
          src="/images/landing/dubai-golden-hour.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[76%_bottom] lg:object-bottom"
        />
      </motion.div>
    </div>
  );
}
