"use client";
import { useEffect } from "react";

export default function CommercePage() {
  useEffect(() => {
    window.location.replace("/commerce/");
  }, []);
  return null;
}
