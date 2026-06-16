// Lightweight natural-language reminder parser (English). Extracts the
// must-haves (what + when) plus inferred list/priority from a sentence like
// "Remind me to call Aarav tomorrow at 11am". No backend — heuristic only.
// Returns nulls for anything not found so the chat can ask a clarifying question
// or merge a follow-up answer into the draft.

import type { RList, RPriority } from "./reminders-data";

export type ParseResult = {
  title: string | null;
  date: Date | null; // local midnight of the target day
  time: { h: number; m: number } | null;
  list: RList | null;
  priority: RPriority | null;
};

const WD = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MO = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function atMidnight(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function parseReminder(text: string, now: Date = new Date()): ParseResult {
  const original = text.trim();
  const strip: string[] = []; // matched phrases removed from the title
  const push = (m: RegExpMatchArray | null) => {
    if (m) strip.push(m[0]);
    return m;
  };

  let date: Date | null = null;
  let time: { h: number; m: number } | null = null;

  // "in N hours / minutes" → exact datetime
  const rel = original.match(/\bin\s+(an?|\d+)\s+(hours?|hrs?|minutes?|mins?)\b/i);
  if (rel) {
    strip.push(rel[0]);
    const n = /^an?$/i.test(rel[1]) ? 1 : parseInt(rel[1], 10);
    const d = new Date(now);
    if (/^h/i.test(rel[2])) d.setHours(d.getHours() + n);
    else d.setMinutes(d.getMinutes() + n);
    date = atMidnight(d);
    time = { h: d.getHours(), m: d.getMinutes() };
  }

  // relative day words
  if (!date) {
    if (/\bday after tomorrow\b/i.test(original)) {
      const d = new Date(now);
      d.setDate(d.getDate() + 2);
      date = atMidnight(d);
      push(original.match(/\bday after tomorrow\b/i));
    } else if (/\btomorrow\b|\btmrw\b/i.test(original)) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      date = atMidnight(d);
      push(original.match(/\btomorrow\b|\btmrw\b/i));
    } else if (/\btoday\b/i.test(original)) {
      date = atMidnight(now);
      push(original.match(/\btoday\b/i));
    } else {
      const ind = original.match(/\bin\s+(\d+)\s+(days?|weeks?)\b/i);
      if (ind) {
        strip.push(ind[0]);
        const n = parseInt(ind[1], 10) * (/week/i.test(ind[2]) ? 7 : 1);
        const d = new Date(now);
        d.setDate(d.getDate() + n);
        date = atMidnight(d);
      }
    }
  }

  // weekday ("next friday", "this monday", "on friday", "friday")
  if (!date) {
    const wd = original.match(
      /\b(next\s+|this\s+|on\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|wed|thu|fri|sat)\b/i,
    );
    if (wd) {
      const target = WD.indexOf(wd[2].toLowerCase().slice(0, 3));
      if (target >= 0) {
        strip.push(wd[0]);
        let occ = (target - now.getDay() + 7) % 7;
        if (occ === 0) occ = 7; // same weekday → next week
        const d = new Date(now);
        d.setDate(d.getDate() + occ);
        date = atMidnight(d);
      }
    }
  }

  // explicit month-day ("jun 14", "june 14th", "14 june")
  if (!date) {
    let mo = -1;
    let day = -1;
    let md = original.match(
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
    );
    if (md) {
      mo = MO.indexOf(md[1].slice(0, 3).toLowerCase());
      day = parseInt(md[2], 10);
      strip.push(md[0]);
    } else {
      md = original.match(
        /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,
      );
      if (md) {
        day = parseInt(md[1], 10);
        mo = MO.indexOf(md[2].slice(0, 3).toLowerCase());
        strip.push(md[0]);
      }
    }
    if (mo >= 0 && day > 0) {
      const d = new Date(now);
      d.setMonth(mo, day);
      if (atMidnight(d).getTime() < atMidnight(now).getTime()) d.setFullYear(d.getFullYear() + 1);
      date = atMidnight(d);
    }
  }

  // time of day ("at 11am", "2:30 pm", "at 14:00", "noon", "evening")
  if (!time) {
    const t = original.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (t) {
      strip.push(t[0]);
      let h = parseInt(t[1], 10) % 12;
      if (/pm/i.test(t[3])) h += 12;
      time = { h, m: t[2] ? parseInt(t[2], 10) : 0 };
    } else {
      const t24 = original.match(/\bat\s+(\d{1,2}):(\d{2})\b/);
      if (t24) {
        strip.push(t24[0]);
        time = { h: parseInt(t24[1], 10) % 24, m: parseInt(t24[2], 10) };
      } else if (/\bnoon\b/i.test(original)) {
        time = { h: 12, m: 0 };
        push(original.match(/\bnoon\b/i));
      } else if (/\bmidnight\b/i.test(original)) {
        time = { h: 0, m: 0 };
        push(original.match(/\bmidnight\b/i));
      } else if (/\bmorning\b/i.test(original)) {
        time = { h: 9, m: 0 };
        push(original.match(/\bmorning\b/i));
      } else if (/\bafternoon\b/i.test(original)) {
        time = { h: 15, m: 0 };
        push(original.match(/\bafternoon\b/i));
      } else if (/\bevening\b/i.test(original)) {
        time = { h: 18, m: 0 };
        push(original.match(/\bevening\b/i));
      } else if (/\b(night|tonight)\b/i.test(original)) {
        time = { h: 20, m: 0 };
        push(original.match(/\b(night|tonight)\b/i));
      }
    }
  }

  // priority
  let priority: RPriority | null = null;
  if (/\b(urgent|asap|critical|high\s*priority)\b/i.test(original)) {
    priority = "high";
    ["urgent", "asap", "critical", "high\\s*priority"].forEach((w) =>
      push(original.match(new RegExp("\\b" + w + "\\b", "i"))),
    );
  }

  // list (inferred)
  let list: RList | null = null;
  if (
    /\b(work|office|client|meeting|email|report|deck|demo|project|deadline|invoice|follow[\s-]?up|stand[\s-]?up|sync|presentation|pitch)\b/i.test(
      original,
    )
  )
    list = "Work";
  else if (
    /\b(buy|shop|shopping|grocery|groceries|order|purchase|milk|vegetables|veggies)\b/i.test(
      original,
    )
  )
    list = "Shopping";

  // title — strip lead-ins + matched phrases, tidy up
  let title: string | null = original;
  for (const ph of strip) if (ph) title = (title as string).replace(ph, " ");
  title = (title as string)
    // reminder-management intent verbs ("Set a reminder", "Add a reminder to …")
    .replace(
      /^\s*(please\s+)?(set|add|create|make|new)\s+(a\s+|an\s+)?reminders?\s*(to|for|that|about)?\s*/i,
      "",
    )
    // companion lead-ins ("Remind me to …", "Remember to …")
    .replace(
      /^\s*(please\s+)?(can you\s+)?(remind me to|remind me|reminder to|reminder:|remember to|remember|i need to|i have to|i want to|note to|note:)\s*/i,
      "",
    )
    .replace(/\b(at|on|by|this|next|in|the)\s*$/i, "")
    .replace(/^\s*(to|at|on|by|for)\s+/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.])/g, "$1")
    .trim();
  // Pure intent with no actual task left ("set a reminder", "reminder") → no title.
  if (/^(a\s+|an\s+)?reminders?$/i.test(title)) title = "";
  title = title ? title.replace(/^\w/, (c) => c.toUpperCase()) : null;

  return { title, date, time, list, priority };
}
