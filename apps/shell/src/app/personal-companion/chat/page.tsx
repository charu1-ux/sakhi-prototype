"use client";

import { useState, useSyncExternalStore } from "react";

import { CallScreen } from "./_components/CallScreen";
import { CompanionHeader } from "./_components/CompanionHeader";
import { Composer } from "./_components/Composer";
import { HappyFlowStory } from "./_components/HappyFlowStory";
import { MessageList } from "./_components/MessageList";
import { ProfileSheet } from "./_components/ProfileSheet";
import { QuickChips } from "./_components/QuickChips";
import { VoiceNoteMode } from "./_components/VoiceNoteMode";
import { useCompanion } from "./useCompanion";

// Route entry: ?demo=happy plays the scripted Happy-Flow story; otherwise the
// free-form interactive chat. Read via useSyncExternalStore (the blessed pattern
// for browser state) so it works with static export without a hydration mismatch.
const subscribe = () => () => {};
const getDemoSnapshot = () => new URLSearchParams(window.location.search).get("demo") === "happy";
const getServerSnapshot = () => false;

export default function PersonalCompanionChat() {
  const isDemo = useSyncExternalStore(subscribe, getDemoSnapshot, getServerSnapshot);
  return isDemo ? <HappyFlowStory /> : <FreeFormChat />;
}

function FreeFormChat() {
  const {
    uiLanguage,
    setUiLanguage,
    messages,
    isTyping,
    sessionCount,
    sendUserMessage,
    appendCallRecord,
    clearChat,
  } = useCompanion();

  const [input, setInput] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const goHome = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "jobs:navigate", href: "/" }, "*");
    } else {
      window.location.href = "/";
    }
  };

  const handleSend = () => {
    const text = input;
    setInput("");
    void sendUserMessage(text);
  };

  const handleChip = (label: string) => {
    void sendUserMessage(label);
  };

  // Quick chips show while the input is empty, voice is closed, and the user
  // hasn't yet established their own pattern (hidden after session 3 — per PRD).
  const showChips = input.trim() === "" && !voiceOpen && sessionCount < 3;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader
        uiLanguage={uiLanguage}
        onBack={goHome}
        onCall={() => setCallOpen(true)}
        onMenu={() => setProfileOpen(true)}
      />

      <MessageList messages={messages} isTyping={isTyping} />

      {showChips && (
        <QuickChips uiLanguage={uiLanguage} onPick={handleChip} onCall={() => setCallOpen(true)} />
      )}

      {voiceOpen ? (
        <VoiceNoteMode
          uiLanguage={uiLanguage}
          onTranscribed={(text) => {
            setVoiceOpen(false);
            void sendUserMessage(text);
          }}
          onCancel={() => setVoiceOpen(false)}
        />
      ) : (
        <Composer
          uiLanguage={uiLanguage}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStartVoice={() => setVoiceOpen(true)}
        />
      )}

      {callOpen && (
        <CallScreen
          uiLanguage={uiLanguage}
          onEnd={(label) => {
            setCallOpen(false);
            appendCallRecord(label);
          }}
        />
      )}

      {profileOpen && (
        <ProfileSheet
          uiLanguage={uiLanguage}
          messageCount={messages.filter((m) => m.kind !== "call-record").length}
          onSelectLanguage={(lang) => setUiLanguage(lang)}
          onClearChat={() => {
            setProfileOpen(false);
            clearChat();
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
