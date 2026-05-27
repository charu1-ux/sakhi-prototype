/**
 * Navigate to the shell home (verticals list).
 *
 * - Inside shell iframe (dev cross-origin): postMessage so the shell router handles it.
 * - Standalone / same-origin: hard-navigate to the shell root.
 */
export function navigateToShellHome() {
  if (typeof window === "undefined") return;

  if (window !== window.parent) {
    // Running inside the shell's cross-origin iframe
    window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
  } else {
    // Standalone or same-origin — go to shell root
    window.location.href = "/";
  }
}
