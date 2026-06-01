import { redirect } from "next/navigation";

export default function HomePage() {
  // Use explicit index.html — Capacitor WKURLSchemeHandler does not resolve
  // trailing-slash directory URLs to index.html automatically.
  redirect("/jobs/design-prototype/index.html");
}
