// Inline JDS-style stroke icons (no emoji, no third-party icon libs — per JDS rules).
// All icons inherit `currentColor` and accept a className for sizing.

type IconProps = { className?: string };

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.5 16.667 6.423 10.59a.833.833 0 0 1 0-1.179L12.5 3.333"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.06 3.34a1.1 1.1 0 0 0-1.32-.32c-.6.27-1.16.65-1.6 1.18-.5.6-.66 1.4-.5 2.16.5 2.32 1.78 4.6 3.6 6.42 1.82 1.82 4.1 3.1 6.42 3.6.76.16 1.56 0 2.16-.5.53-.44.9-1 1.18-1.6a1.1 1.1 0 0 0-.32-1.32l-1.9-1.42a1.1 1.1 0 0 0-1.27-.04l-1.1.73a.6.6 0 0 1-.66 0 9.3 9.3 0 0 1-2.02-2.02.6.6 0 0 1 0-.66l.73-1.1a1.1 1.1 0 0 0-.04-1.27L7.06 3.34Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MicIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" fill="currentColor" />
      <path
        d="M5 9.167a5 5 0 0 0 10 0M10 14.167V17.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.4 9.2 16.1 3.3c.7-.33 1.4.37 1.07 1.07L11.27 17a.83.83 0 0 1-1.55-.1l-1.3-4.36a.83.83 0 0 0-.55-.55L3.5 10.7a.83.83 0 0 1-.1-1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DotsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="10" r="1.4" fill="currentColor" />
      <circle cx="10" cy="10" r="1.4" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MuteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6 11a6 6 0 0 0 12 0M12 17v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MuteOffIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M6 11a6 6 0 0 0 12 0M12 17v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneEndIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9.5c-2.2 0-4.3.4-6.2 1.1-.7.27-1.2.95-1.2 1.7v1.6c0 .55.45 1 1 1h2.3c.55 0 1-.45 1-1v-1.1c0-.27.18-.5.43-.58A11.6 11.6 0 0 1 12 12.5c1.05 0 2.06.13 3 .37.25.06.43.3.43.58v1.05c0 .55.45 1 1 1h2.3c.55 0 1-.45 1-1v-1.6c0-.75-.5-1.43-1.2-1.7A18.3 18.3 0 0 0 12 9.5Z"
        fill="currentColor"
        transform="rotate(135 12 12)"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.333 7.5 9.41 13.577a.833.833 0 0 0 1.179 0L16.667 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.5 6.5A2.5 2.5 0 0 1 6 4h8a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 14 13H8l-3.2 2.7A.5.5 0 0 1 4 15.3V13a2.5 2.5 0 0 1-.5-1.5v-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 4.5l9 5.5-9 5.5v-11Z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5.5" y="4" width="3.2" height="12" rx="1.2" fill="currentColor" />
      <rect x="11.3" y="4" width="3.2" height="12" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M16.25 4.583v3.75H12.5M3.75 15.417v-3.75H7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.27 7.5a5 5 0 0 1 8.23-1.87l2.75 2.7M3.75 11.667l2.75 2.7a5 5 0 0 0 8.23-1.87"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
