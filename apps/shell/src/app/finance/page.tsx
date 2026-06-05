"use client";
import { useEffect } from "react";

export default function FinancePage() {
  useEffect(() => {
    window.location.replace("/finance/");
  }, []);
  return null;
}
