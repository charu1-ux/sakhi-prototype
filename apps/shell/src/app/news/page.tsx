"use client";
import { useEffect } from "react";

export default function NewsPage() {
  useEffect(() => {
    window.location.replace("/news/");
  }, []);
  return null;
}
