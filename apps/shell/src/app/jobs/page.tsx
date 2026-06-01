/**
 * Dev-only jobs entry point.
 *
 * In dev, redirect to the design-prototype sub-route which is proxied
 * same-origin from the jobs dev server (port 3003) via shell rewrites.
 * This keeps everything on localhost:3000 and avoids cross-origin iframes.
 *
 * Production: the shell postbuild copies @intelligence/jobs static export
 * into out/jobs/. Capacitor loads that directly — this component is never
 * rendered in production.
 */
import { redirect } from "next/navigation";

export default function JobsPage() {
  redirect("/jobs/design-prototype/index.html");
}
