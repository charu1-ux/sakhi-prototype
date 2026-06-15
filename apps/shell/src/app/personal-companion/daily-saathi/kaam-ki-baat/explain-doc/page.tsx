"use client";

import { ScriptedChatStub } from "../../_components/ScriptedChatStub";
import { useLang } from "../../saathi-i18n";

// Explain a doc (scripted demo). The user shares a document, a summary card
// appears, then they ask follow-up questions across several turns (canned).
export default function ExplainDocChat() {
  const { t } = useLang();
  return (
    <ScriptedChatStub
      title={t.doc.title}
      subtitle={t.doc.sub}
      greet={t.doc.greet}
      turns={t.doc.story}
      placeholder={t.doc.placeholder}
      resultTurnIndex={0}
      resultCard={() => (
        <div className="bg-surface w-full rounded-xl border border-[rgba(12,13,16,0.08)] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <span className="text-primary-60 mb-2 block text-[10px] font-bold tracking-wide uppercase">
            {t.doc.summaryTag}
          </span>
          <ul className="flex flex-col gap-2">
            {t.doc.summary.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] leading-snug text-[#0c0d10]"
              >
                <span className="bg-primary-50 mt-1.5 size-1.5 shrink-0 rounded-full" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}
