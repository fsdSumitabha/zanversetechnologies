import { LogoLoop } from "@/components/ui/logo-loop";
import { Plate } from "@/components/zan/sections/Partners";
import { landingCopy } from "@/constants/landing";
import { clients } from "@/constants/zan";

/** The client marks, as the homepage shows them: on white plates, on the brand veil. */
export function ClientStrip() {
  return (
    <section
      aria-label={landingCopy.clients.label}
      className="relative overflow-clip border-brand-gradient-t bg-brand-veil py-[clamp(3rem,2.2rem+3vw,5rem)]"
    >
      <p className="container-zan text-center font-mono text-eyebrow text-brand-ink uppercase">
        {landingCopy.clients.label}
      </p>
      <LogoLoop
        className="mt-8 lg:mt-10"
        /* Three groups still cover the widest screen with one to spare, and each
           group left out is eleven images fewer to parse before the first paint. */
        copies={3}
        viewportClassName="py-5"
        ariaLabel="Clients"
        pauseLabel="Pause the client logos"
        itemClassName="px-2 sm:px-3 lg:px-4"
        items={clients.map((c) => (
          <Plate key={c.name} client={c} />
        ))}
        echo={clients.map((c) => (
          <Plate key={c.name} client={c} echo />
        ))}
      />
    </section>
  );
}
