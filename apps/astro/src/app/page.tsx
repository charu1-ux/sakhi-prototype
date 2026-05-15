"use client";
import { useEffect } from "react";

export default function AstroPage() {
  useEffect(() => {
    window.location.replace("/astro/jbiq-homepage.html");
  }, []);
  return <div style={{ position: "fixed", inset: 0, background: "#000" }} />;
}
