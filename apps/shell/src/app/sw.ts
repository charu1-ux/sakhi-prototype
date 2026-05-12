import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope &
  typeof globalThis & {
    skipWaiting(): Promise<void>;
    clients: { claim(): Promise<void> };
  };

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Never cache the /health sub-app — always pass through to the Capacitor
    // file server so it can serve health/index.html fresh every time.
    // Must come before defaultCache so the "others" NetworkFirst rule
    // does not intercept these paths and serve a stale cached version.
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/health"),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
