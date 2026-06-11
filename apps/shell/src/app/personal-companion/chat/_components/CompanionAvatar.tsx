// Dil Ki Baat avatar — a warm purple gradient orb with a soft "heart/listening"
// glyph. Used in the header, message list, profile sheet, and call screen.

type Props = {
  size?: number;
  className?: string;
  showActiveDot?: boolean;
};

export function CompanionAvatar({ size = 40, className, showActiveDot = false }: Props) {
  const dot = Math.max(8, Math.round(size * 0.26));
  return (
    <span
      className={`relative inline-flex shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span
        className="flex size-full items-center justify-center overflow-hidden rounded-full"
        style={{ background: "linear-gradient(140deg, #8B2FE8 0%, #6d17ce 60%, #4a0e93 100%)" }}
      >
        <svg
          viewBox="0 0 24 24"
          width={size * 0.56}
          height={size * 0.56}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 20s-6.5-4.35-8.5-8.2C2.2 9.1 3.4 6 6.4 6c1.8 0 2.9 1.1 3.6 2.2C10.7 7.1 11.8 6 13.6 6c3 0 4.2 3.1 2.9 5.8C14.5 15.65 12 20 12 20Z"
            fill="#ffffff"
            fillOpacity="0.95"
          />
        </svg>
      </span>
      {showActiveDot && (
        <span
          className="absolute right-0 bottom-0 rounded-full border-2 border-white bg-[#25ab21]"
          style={{ width: dot, height: dot }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
