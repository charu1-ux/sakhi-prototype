"use client";
import { useEffect } from "react";

export default function JobsPage() {
  useEffect(() => {
    window.location.replace("/jobs/design-prototype/");
  }, []);
  return null;
}
