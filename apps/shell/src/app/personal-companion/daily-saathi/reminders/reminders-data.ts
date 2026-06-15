// Reminders — data model, JDS colour maps, seed data and date helpers.
// Per reminders-prd.md. Buckets (overdue / today / upcoming) are computed from
// the datetime vs. now (calendar-day comparison) so the demo stays stable
// regardless of time of day.

export type RList = "Work" | "Personal" | "Shopping";
export type RPriority = "none" | "high";
export type Bucket = "overdue" | "today" | "upcoming";
export type Filter = Bucket | "all";

export type Reminder = {
  id: string;
  title: string;
  datetime: string; // ISO
  list: RList;
  priority: RPriority;
  done: boolean;
  createdAt: string; // ISO
};

// List colour dot → JDS tokens (Work=sparkle, Personal=secondary, Shopping=warning).
export const LIST_DOT: Record<RList, string> = {
  Work: "bg-sparkle-50",
  Personal: "bg-secondary-50",
  Shopping: "bg-warning",
};

// ── date helpers ────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function bucketOf(r: Reminder, now: Date = new Date()): Bucket {
  const day = startOfDay(new Date(r.datetime));
  const today = startOfDay(now);
  if (day < today) return "overdue";
  if (day === today) return "today";
  return "upcoming";
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Per-row time chip: time for today, date for overdue/upcoming.
export function chipLabel(r: Reminder, now: Date = new Date()): string {
  return bucketOf(r, now) === "today" ? fmtTime(r.datetime) : fmtDate(r.datetime);
}

// Upcoming grouping key (by date).
export function dateKey(r: Reminder): string {
  return fmtDate(r.datetime);
}

// ── counts + default filter (PRD: open on Overdue, else Today, else Upcoming) ──
export function counts(list: Reminder[], now: Date = new Date()) {
  const active = list.filter((r) => !r.done);
  return {
    overdue: active.filter((r) => bucketOf(r, now) === "overdue").length,
    today: active.filter((r) => bucketOf(r, now) === "today").length,
    upcoming: active.filter((r) => bucketOf(r, now) === "upcoming").length,
    doneToday: list.filter((r) => r.done && bucketOf(r, now) === "today").length,
  };
}

export function defaultFilter(list: Reminder[], now: Date = new Date()): Filter {
  const c = counts(list, now);
  if (c.overdue > 0) return "overdue";
  if (c.today > 0) return "today";
  return "upcoming";
}

// Where a freshly-saved reminder lands (drives the widget auto-jump).
export function filterForDate(iso: string, now: Date = new Date()): Filter {
  const day = startOfDay(new Date(iso));
  const today = startOfDay(now);
  if (day < today) return "overdue";
  if (day === today) return "today";
  return "upcoming";
}

// ── seed data (relative to today so buckets always read correctly) ────────────
export function seedReminders(now: Date = new Date()): Reminder[] {
  const mk = (dayOffset: number, h: number, m: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const rows: Omit<Reminder, "id" | "createdAt">[] = [
    {
      title: "Reply to Ravi — DoxyHQ feedback",
      datetime: mk(-1, 14, 0),
      list: "Work",
      priority: "high",
      done: false,
    },
    {
      title: "Pay credit card bill",
      datetime: mk(-1, 10, 0),
      list: "Personal",
      priority: "high",
      done: false,
    },
    {
      title: "Morning run — 7km",
      datetime: mk(0, 6, 30),
      list: "Personal",
      priority: "none",
      done: true,
    },
    {
      title: "Send weekly update",
      datetime: mk(0, 9, 0),
      list: "Work",
      priority: "none",
      done: false,
    },
    {
      title: "Review pitch deck",
      datetime: mk(0, 15, 0),
      list: "Work",
      priority: "high",
      done: false,
    },
    {
      title: "Call dentist to reschedule",
      datetime: mk(0, 11, 0),
      list: "Personal",
      priority: "none",
      done: false,
    },
    {
      title: "Book Goa flights",
      datetime: mk(1, 9, 0),
      list: "Personal",
      priority: "none",
      done: false,
    },
    {
      title: "DoxyHQ beta outreach — 5 leads",
      datetime: mk(2, 9, 0),
      list: "Work",
      priority: "high",
      done: false,
    },
    {
      title: "Create Resume & Portfolio",
      datetime: mk(3, 9, 0),
      list: "Personal",
      priority: "none",
      done: false,
    },
    {
      title: "Pay gym membership",
      datetime: mk(4, 9, 0),
      list: "Personal",
      priority: "none",
      done: false,
    },
  ];
  return rows.map((r, i) => ({ ...r, id: `seed-${i}`, createdAt: now.toISOString() }));
}
