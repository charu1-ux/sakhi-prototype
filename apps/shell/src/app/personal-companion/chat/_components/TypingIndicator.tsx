import { CompanionAvatar } from "./CompanionAvatar";

// Three-dot "companion is typing" indicator, left-aligned like a companion bubble.
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <CompanionAvatar size={28} />
      <div className="flex items-center gap-1 rounded-3xl rounded-bl-md bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(12,13,16,0.06)]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-[rgba(12,13,16,0.4)]"
            style={{ animation: `dkb-bounce 1.2s ${i * 0.18}s infinite ease-in-out` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes dkb-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
