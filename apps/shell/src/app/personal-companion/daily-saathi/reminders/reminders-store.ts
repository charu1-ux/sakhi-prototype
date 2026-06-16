"use client";

import { useEffect, useState } from "react";

import { type Reminder, seedReminders } from "./reminders-data";

// localStorage-backed reminders store. Survives the (full-page) navigation
// between the home widget and the creation chat, and syncs across mounted
// components via a custom event. Seeded once on first load.

const KEY = "saathi_reminders";
const EVENT = "saathi-reminders-change";

function read(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Reminder[];
  } catch {
    /* ignore */
  }
  const seeded = seedReminders();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(seeded));
  } catch {
    /* ignore */
  }
  return seeded;
}

function write(list: Reminder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function addReminder(r: Omit<Reminder, "id" | "createdAt" | "done">): Reminder {
  const full: Reminder = {
    ...r,
    id: `r-${Date.now()}`,
    done: false,
    createdAt: new Date().toISOString(),
  };
  const list = read();
  write([...list, full]);
  return full;
}

export function toggleReminder(id: string) {
  const list = read().map((r) => (r.id === id ? { ...r, done: !r.done } : r));
  write(list);
}

// Reactive hook. Empty on first render (export-safe), hydrates on mount, and
// re-reads whenever the store changes (here or in another tab/component).
export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    setReminders(read());
    const sync = () => setReminders(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { reminders, toggle: toggleReminder, add: addReminder };
}
