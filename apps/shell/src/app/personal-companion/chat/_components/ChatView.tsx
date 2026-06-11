"use client";

import { CompanionHeader } from "./CompanionHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { QuickChips } from "./QuickChips";
import { VoiceNoteRecorder } from "./VoiceNoteRecorder";
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
  onMenu: () => void;
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
  onMenu,
}: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader uiLanguage={uiLanguage} onBack={onBack} onCall={onCall} onMenu={onMenu} />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        pendingUserText={recording ? liveTranscript : null}
        pendingHint={UI[uiLanguage].recordingHint}
      />

      {showChips && !recording && (
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
