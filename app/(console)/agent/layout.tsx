import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/constants/zan";
import "../../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // The company in the tab, so an agent with more than one console open can
  // tell which site's leads this one is showing.
  title: `Agent Console · ${site.name}`,
  // Internal tooling must never be indexed, and this is the one place the site
  // deliberately opts out of the SEO work the rest of it does.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * A root layout of its own, not a child of the site's. The console shows lead
 * names, phone numbers and transcripts, and keeps the agent's token in
 * sessionStorage, so it must not share a document with anything a tag manager
 * can inject into: no navbar, no footer, no preloader, no scroll smoothing,
 * no consent banner and no tags. Import nothing from the marketing shell here.
 *
 * Crossing between this layout and the site's is a full page load, which is
 * fine: nothing links from one to the other.
 */
export default function AgentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-bg text-ink antialiased">
        <div className="min-h-svh bg-surface">{children}</div>
      </body>
    </html>
  );
}
