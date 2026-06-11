import { CompanionAvatar } from "./CompanionAvatar";
import { PhoneIcon } from "../icons";
import type { ChatMessage } from "../companion-data";

type Props = {
  message: ChatMessage;
  /** First in a grouped run from the same sender → show avatar (companion only). */
  showAvatar: boolean;
};

export function MessageBubble({ message, showAvatar }: Props) {
  // Call records render centred as a subtle system pill.
  if (message.kind === "call-record") {
    return (
      <div className="flex justify-center py-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(12,13,16,0.06)] px-3 py-1 text-[12px] font-medium text-[rgba(12,13,16,0.6)]">
          <PhoneIcon className="size-3.5" />
          {message.text}
        </span>
      </div>
    );
  }

  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] animate-[dkb-pop_240ms_ease-out] rounded-3xl rounded-br-md bg-[#6d17ce] px-4 py-2.5 text-[15px] leading-snug text-white">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-7 shrink-0">{showAvatar && <CompanionAvatar size={28} />}</div>
      <div
        className={`max-w-[80%] animate-[dkb-pop_240ms_ease-out] rounded-3xl rounded-bl-md px-4 py-2.5 text-[15px] leading-snug shadow-[0_1px_2px_rgba(12,13,16,0.06)] ${
          message.crisis ? "bg-[#fde8ea] text-[#0c0d10]" : "bg-white text-[#0c0d10]"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
