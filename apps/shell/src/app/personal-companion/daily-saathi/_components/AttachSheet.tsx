"use client";

import { type ReactNode } from "react";

import { useLang } from "../saathi-i18n";
import { DocIcon, ImageIcon } from "../saathi-icons";

// Bottom sheet opened by the composer "+" — lets the user attach a photo or a
// document to analyse/summarize (mirrors the product attach sheet). No real
// upload in the prototype; each option routes into the analyse (explain-doc)
// flow. JDS surfaces + rows.
export type AttachKind = "camera" | "photo" | "document";

// Camera glyph (no camera icon in the set).
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l.7-1.2A1.5 1.5 0 0 1 9.7 4h4.6a1.5 1.5 0 0 1 1.3.8L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

type Row = { kind: AttachKind; icon: ReactNode; label: string; sub?: string };

export function AttachSheet({
  onPick,
  onClose,
}: {
  onPick: (kind: AttachKind) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const a = t.kaam.attach;

  const rows: Row[] = [
    { kind: "camera", icon: <CameraIcon className="size-5" />, label: a.camera },
    { kind: "photo", icon: <ImageIcon className="size-5" />, label: a.photo },
    {
      kind: "document",
      icon: <DocIcon className="size-5" />,
      label: a.document,
      sub: a.documentSub,
    },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label={a.cancel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/30"
      />

      {/* Sheet */}
      <div
        className="bg-surface relative z-10 flex flex-col rounded-t-[24px] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)]"
        style={{ animation: "sheet-up 0.28s cubic-bezier(0.05,0.7,0.1,1) both" }}
      >
        <span aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(12,13,16,0.14)]" />
        <p className="mb-2 px-1 text-[13px] font-bold text-[#0c0d10]">{a.title}</p>

        <div className="flex flex-col">
          {rows.map((row) => (
            <button
              key={row.kind}
              type="button"
              onClick={() => onPick(row.kind)}
              className="active:bg-surface-minimal focus-visible:ring-primary-60 flex items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors outline-none focus-visible:ring-2"
            >
              <span className="bg-surface-ghost-icon text-primary-50 flex size-11 shrink-0 items-center justify-center rounded-md">
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-[#0c0d10]">{row.label}</span>
                {row.sub && (
                  <span className="block text-[12px] text-[rgba(12,13,16,0.55)]">{row.sub}</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="bg-surface-ghost focus-visible:ring-primary-60 mt-2 w-full cursor-pointer rounded-full py-3 text-[14px] font-bold text-[#0c0d10] transition-transform duration-200 outline-none hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {a.cancel}
        </button>
      </div>

      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
