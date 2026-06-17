// Inline JDS-style stroke icons for Daily Saathi (no emoji, no icon libs — per
// JDS rules). All inherit currentColor and take a className for sizing.

type IconProps = { className?: string };

// Saathi mark — a friendly four-point sparkle, used in the companion orb.
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2c.3 3.2 1.6 4.5 4.8 4.8-3.2.3-4.5 1.6-4.8 4.8-.3-3.2-1.6-4.5-4.8-4.8 3.2-.3 4.5-1.6 4.8-4.8Z"
        fill="currentColor"
      />
      <path
        d="M18.5 13.5c.18 1.8.92 2.55 2.7 2.73-1.78.18-2.52.92-2.7 2.72-.18-1.8-.92-2.54-2.7-2.72 1.78-.18 2.52-.93 2.7-2.73Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Dil Ki Baat — heart (talk to me).
export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-6.6-4.35-9.1-8.5C1.4 9 2.7 5.6 6 5.6c1.9 0 3.2 1.1 4 2.2.8-1.1 2.1-2.2 4-2.2 3.3 0 4.6 3.4 3.1 5.9C14.6 15.65 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Kaam Ki Baat — checklist (get my work done).
export function TasksIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 7h10M10 12h10M10 17h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 6.6l1 1 1.8-1.9M4 11.6l1 1 1.8-1.9M4 16.6l1 1 1.8-1.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Reminders — bell.
export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 4.5 1.8 5.5 1.8 5.5H4.7s1.8-1 1.8-5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Daily briefing — sun.
export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Today's diary — journal/book.
export function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6 18a2 2 0 0 1 2-2h10M9.5 8h5M9.5 11.5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 17l4.5-4.2c.7-.65 1.78-.64 2.47.02L16 17.5M14 14l2.2-2c.69-.63 1.74-.62 2.42.02L21 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3.5h8L19 8.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5A1.5 1.5 0 0 1 6 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 3.5V8.5H19M8.5 12.5h7M8.5 16h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="4.5"
        width="14"
        height="12.5"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 8.2h14M6.8 2.8v3M13.2 2.8v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 4.2v11.6M4.2 10h11.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="13.6" r="0.95" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6v4.2l2.8 1.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Attach / upload a document — paperclip (composer left button).
export function PaperclipIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18.4 11.8 12 18.2a4.2 4.2 0 0 1-5.94-5.94l6.9-6.9a2.8 2.8 0 0 1 3.96 3.96l-6.9 6.9a1.4 1.4 0 0 1-1.98-1.98l6.18-6.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Talk to me — microphone (opens the companion conversation).
export function MicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.5 4.167 13.577 10.244a.833.833 0 0 1 0 1.179L7.5 16.667"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
