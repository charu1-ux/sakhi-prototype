"use client";

import { useState } from "react";

import { CallScreen } from "./CallScreen";
import { ChatView } from "./ChatView";
import { ProfileSheet } from "./ProfileSheet";
import { WelcomeArrival } from "./WelcomeArrival";
import { stopSpeaking } from "../tts";
import { useCompanion } from "../useCompanion";

type Phase = "welcome" | "chat";

// Owns a single companion instance and shared interaction state, then renders
// either the animated arrival or the chat over the same conversation — so the
// greeting the user sees on arrival becomes the first message of the chat.
export function CompanionExperience({ initialPhase = "welcome" }: { initialPhase?: Phase }) {
  const {
    uiLanguage,
    setUiLanguage,
    messages,
    isTyping,
    sendUserMessage,
    appendCallRecord,
    clearChat,
  } = useCompanion();

  const [phase, setPhase] = useState<Phase>(initialPhase);
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

  const enterChat = () => setPhase("chat");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    stopSpeaking();
    void sendUserMessage(text);
    enterChat();
  };

  const handleChip = (label: string) => {
    stopSpeaking();
    void sendUserMessage(label);
    enterChat();
  };

  const handleVoiceTranscribed = (text: string) => {
    setVoiceOpen(false);
    stopSpeaking();
    void sendUserMessage(text, { voice: true });
    enterChat();
  };

  const handleCall = () => {
    stopSpeaking();
    enterChat();
    setCallOpen(true);
  };

  // Greeting the companion has already said (drives the arrival headline).
  const greetingLines = messages
    .filter((m) => m.sender === "companion" && m.kind !== "call-record")
    .map((m) => m.text);

  const userHasSent = messages.some((m) => m.sender === "user");
  const showChips = input.trim() === "" && !voiceOpen && !userHasSent;

  return (
    <div className="relative h-full overflow-hidden">
      <div key={phase} className="h-full animate-[dkb-cross_320ms_ease-out]">
        {phase === "welcome" ? (
          <WelcomeArrival
            uiLanguage={uiLanguage}
            greetingLines={greetingLines}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStartVoice={() => setVoiceOpen(true)}
            voiceOpen={voiceOpen}
            onVoiceTranscribed={handleVoiceTranscribed}
            onVoiceCancel={() => setVoiceOpen(false)}
            onChip={handleChip}
            onCall={handleCall}
            onBack={goHome}
            onMenu={() => setProfileOpen(true)}
          />
        ) : (
          <ChatView
            uiLanguage={uiLanguage}
            messages={messages}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStartVoice={() => setVoiceOpen(true)}
            voiceOpen={voiceOpen}
            onVoiceTranscribed={handleVoiceTranscribed}
            onVoiceCancel={() => setVoiceOpen(false)}
            showChips={showChips}
            onChip={handleChip}
            onBack={goHome}
            onCall={handleCall}
            onMenu={() => setProfileOpen(true)}
          />
        )}
      </div>

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
            setPhase("welcome");
          }}
          onClose={() => setProfileOpen(false)}
        />
      )}

      <style>{`
        @keyframes dkb-cross { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
