import { SectionHeading } from "@/components/zan/ui/SectionHeading";
import { landingCopy } from "@/constants/landing";
import { ProcessTrack } from "./ProcessTrack";

export function Process() {
  const { process } = landingCopy;
  return (
    <section id="process" className="scroll-mt-nav border-t border-line bg-paper py-[clamp(4rem,2.8rem+4.6vw,7rem)]">
      <div className="container-zan">
        <SectionHeading eyebrow={process.eyebrow} title={process.title} lead={process.lead} size="h1" accentLine={1} />
        <ProcessTrack />
      </div>
    </section>
  );
}
