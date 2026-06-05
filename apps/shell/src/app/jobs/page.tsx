"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function JobsDevFrame() {
  const router = useRouter();
  const ready = useRef(false);

  useEffect(() => {
    ready.current = true;
    function handleMessage(e: MessageEvent) {
      if (ready.current && e.data?.type === "jobs:navigate" && typeof e.data.href === "string") {
        router.push(e.data.href);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => {
      ready.current = false;
      window.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return (
    <div className="flex h-full w-full flex-col">
      <iframe
        src="/jobs/design-prototype/"
        title="Jobs & Careers"
        className="block min-h-0 w-full flex-1 border-0"
        allow="microphone; camera"
      />
    </div>
  );
}
