"use client";

import { CompanionHeader } from "./CompanionHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { QuickChips } from "./QuickChips";
import { VoiceNoteRecorder } from "./VoiceNoteRecorder";
import { PrivacyIcon } from "../icons";
import { UI, type ChatMessage, type UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  messages: ChatMessage[];
  isTyping: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  recording: boolean;
  liveTranscript: string;
  onVoiceTranscript: (text: string) => void;
  onVoiceSend: (finalText: string) => void;
  onVoiceCancel: () => void;
  showChips: boolean;
  onChip: (label: string) => void;
  onBack: () => void;
  onCall: () => void;
  onTitleClick: () => void;
  privateMode: boolean;
  onTogglePrivate: () => void;
  canEnterPrivate: boolean;
};

// Presentational chat surface. State lives in CompanionExperience so the arrival
// screen and chat share a single companion instance. The mic opens an inline
// voice-note recorder whose live transcript streams into the chat.
export function ChatView({
  uiLanguage,
  messages,
  isTyping,
  input,
  onInputChange,
  onSend,
  onStartVoice,
  recording,
  liveTranscript,
  onVoiceTranscript,
  onVoiceSend,
  onVoiceCancel,
  showChips,
  onChip,
  onBack,
  onCall,
  onTitleClick,
  privateMode,
  onTogglePrivate,
  canEnterPrivate,
}: Props) {
  const t = UI[uiLanguage];

  const privateEmptyState = (
    <div className="mx-auto flex max-w-[320px] flex-col items-center gap-3 rounded-3xl border border-[#e4dbff] bg-white px-6 py-7 text-center shadow-[0_2px_12px_rgba(109,23,206,0.06)]">
      <span className="flex size-14 items-center justify-center rounded-full bg-[#ede7ff] text-[#6d17ce]">
        <PrivacyIcon className="size-8" filled />
      </span>
      <p className="text-[16px] font-bold text-[#0c0d10]">{t.privateChat}</p>
      <p className="text-[14px] leading-relaxed text-[rgba(12,13,16,0.6)]">{t.privateNotice}</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader
        uiLanguage={uiLanguage}
        onBack={onBack}
        onCall={onCall}
        onTitleClick={onTitleClick}
        privateMode={privateMode}
        onTogglePrivate={onTogglePrivate}
        canEnterPrivate={canEnterPrivate}
      />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        pendingUserText={recording ? liveTranscript : null}
        pendingHint={t.recordingHint}
        emptyState={privateMode ? privateEmptyState : undefined}
      />

      {showChips && !recording && !privateMode && (
        <QuickChips uiLanguage={uiLanguage} onPick={onChip} onCall={onCall} />
      )}

      {recording ? (
        <VoiceNoteRecorder
          uiLanguage={uiLanguage}
          onTranscript={onVoiceTranscript}
          onSend={onVoiceSend}
          onCancel={onVoiceCancel}
        />
      ) : (
        <Composer
          uiLanguage={uiLanguage}
          value={input}
          onChange={onInputChange}
          onSend={onSend}
          onStartVoice={onStartVoice}
        />
      )}
    </div>
  );
}
