"use client";

import { CompanionHeader } from "./CompanionHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { QuickChips } from "./QuickChips";
import { VoiceNoteMode } from "./VoiceNoteMode";
import type { ChatMessage, UiLanguage } from "../companion-data";

type Props = {
  uiLanguage: UiLanguage;
  messages: ChatMessage[];
  isTyping: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  voiceOpen: boolean;
  onVoiceTranscribed: (text: string) => void;
  onVoiceCancel: () => void;
  showChips: boolean;
  onChip: (label: string) => void;
  onBack: () => void;
  onCall: () => void;
  onMenu: () => void;
};

// Presentational chat surface. All state lives in CompanionExperience so the
// arrival screen and the chat share a single companion instance.
export function ChatView({
  uiLanguage,
  messages,
  isTyping,
  input,
  onInputChange,
  onSend,
  onStartVoice,
  voiceOpen,
  onVoiceTranscribed,
  onVoiceCancel,
  showChips,
  onChip,
  onBack,
  onCall,
  onMenu,
}: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader uiLanguage={uiLanguage} onBack={onBack} onCall={onCall} onMenu={onMenu} />

      <MessageList messages={messages} isTyping={isTyping} />

      {showChips && <QuickChips uiLanguage={uiLanguage} onPick={onChip} onCall={onCall} />}

      {voiceOpen ? (
        <VoiceNoteMode
          uiLanguage={uiLanguage}
          onTranscribed={onVoiceTranscribed}
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
