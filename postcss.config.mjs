import { fileURLToPath } from "node:url";

/* After Tailwind: an agent's page (lib/agentMode.ts) gets every reduced-motion
   rule and none of the motion-only ones (postcss/agent-still.cjs). By absolute
   path, because Next resolves a plugin name from the project and Turbopack
   from its own worker; both accept a path. */
const agentStill = fileURLToPath(new URL("./postcss/agent-still.cjs", import.meta.url));

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    [agentStill]: {},
  },
};

export default config;
