"use client";

import { useLayoutEffect } from "react";

import { initGSAP } from "./register";

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    initGSAP();
  }, []);

  return children;
}
