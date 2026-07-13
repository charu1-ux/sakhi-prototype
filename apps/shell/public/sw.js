/*
 * Self-destruct service worker.
 *
 * The app previously shipped a Serwist PWA worker that precached and runtime-
 * cached the build. On GitHub Pages this served STALE assets after every deploy
 * (users kept running old code), and its precache manifest missed the basePath.
 * PWA/offline support isn't needed for this prototype, so it's disabled.
 *
 * This tiny worker replaces the old one at the same URL. When a browser that
 * still has the old SW runs its periodic update check, it fetches this file,
 * sees it changed, installs it, and on activate it: clears every Cache Storage
 * entry, unregisters itself, and reloads open tabs — so the next load comes
 * straight from the network (the latest deploy). New visitors register no SW.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
