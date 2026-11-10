"use client";

import { useEffect } from "react";
import type { ModelContext } from "./tools";

/* ───────────────────────────────────────────────────────────────────────────
   WEBMCP: THE FEATURE CHECK

   WebMCP lets a page hand tools to an agent in the browser, so the agent does
   not have to read and click. Most browsers do not have it. This file is all
   that those browsers ever run: the check below, and then nothing. The tools
   themselves are in ./tools, behind import(), so no other code is downloaded
   unless the check passes. The type import above is erased at build.

   It renders nothing, so it cannot change how a page looks or moves. The site
   and landing layouts mount it. The staff console has its own root layout and
   does not, and crossing between root layouts is a full page load, so tools
   registered here can never still be there on /agent.

   document.modelContext is where the spec has it. navigator.modelContext is where
   Chrome's earlier builds had it, which can still matter during the origin trial.

   Aborting the signal unregisters every tool. In Strict Mode the first effect is
   cleaned up before its import resolves, so registerTools sees an aborted signal
   and registers nothing, and only the second effect's run registers.
   ─────────────────────────────────────────────────────────────────────────── */

type HasModelContext = { modelContext?: ModelContext };

export function WebMcpTools() {
  useEffect(() => {
    const modelContext =
      (document as Document & HasModelContext).modelContext ?? (navigator as Navigator & HasModelContext).modelContext;
    if (!modelContext) return;

    const unregister = new AbortController();
    import("./tools")
      .then(({ registerTools }) => registerTools(modelContext, unregister.signal))
      .catch(() => {
        // The chunk would not load, so this visit has no tools, like most visits.
      });
    return () => unregister.abort();
  }, []);

  return null;
}
