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
import { stopSpeaking } from "./tts";
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

  // Quick chips greet the user on landing so the screen is never blank. They
  // stay until the user sends their first message, then make way for the chat.
  const userHasSent = messages.some((m) => m.sender === "user");
  const showChips = input.trim() === "" && !voiceOpen && !userHasSent;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f5f5f5]">
      <CompanionHeader
        uiLanguage={uiLanguage}
        onBack={goHome}
        onCall={() => {
          stopSpeaking();
          setCallOpen(true);
        }}
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
            void sendUserMessage(text, { voice: true });
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
