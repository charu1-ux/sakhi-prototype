"use client";

import { AssistantChatStub } from "../../_components/AssistantChatStub";
import { useLang } from "../../saathi-i18n";
import { ImageIcon } from "../../saathi-icons";

// Create an image (stub). On the user's prompt it shows a placeholder
// "generated image" card (no real generation in the prototype).
export default function CreateImageChat() {
  const { t } = useLang();
  return (
    <AssistantChatStub
      title={t.image.title}
      subtitle={t.image.sub}
      seededText={t.image.greet}
      ack={t.image.ack}
      placeholder={t.image.placeholder}
      replyCard={(prompt) => (
        <div className="bg-surface w-full overflow-hidden rounded-xl border border-[rgba(12,13,16,0.08)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="bg-surface-ghost-icon flex aspect-video items-center justify-center">
            <ImageIcon className="text-primary-50 size-9" />
          </div>
          <div className="flex flex-col gap-1 p-3">
            <span className="text-primary-60 text-[10px] font-bold tracking-wide uppercase">
              {t.image.resultTag}
            </span>
            <span className="text-[13px] text-[#0c0d10]">{prompt}</span>
            <span className="text-[11px] text-[rgba(12,13,16,0.55)]">{t.image.resultNote}</span>
          </div>
        </div>
      )}
    />
  );
}
