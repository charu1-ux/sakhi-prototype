"use client";
import { useEffect } from "react";

export default function AstroPage() {
  useEffect(() => {
    window.location.replace("/astro/");
  }, []);
  return null;
}
