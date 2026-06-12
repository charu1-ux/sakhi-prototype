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
    enterPrivateMode,
    exitPrivateMode,
    clearChat,
  } = useCompanion();

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);

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

  // Mic → voice note recorder (live transcription streams into the chat).
  const handleStartVoice = () => {
    stopSpeaking();
    setLiveTranscript("");
    setRecording(true);
    enterChat();
  };

  const handleVoiceSend = (finalText: string) => {
    setRecording(false);
    setLiveTranscript("");
    void sendUserMessage(finalText, { voice: true });
  };

  const handleVoiceCancel = () => {
    setRecording(false);
    setLiveTranscript("");
  };

  const handleCall = () => {
    stopSpeaking();
    setRecording(false);
    enterChat();
    setCallOpen(true);
  };

  // Private mode toggle — enter from welcome/chat, exit back to normal chat.
  const handleTogglePrivate = () => {
    stopSpeaking();
    setRecording(false);
    setInput("");
    if (privateMode) {
      setPrivateMode(false);
      exitPrivateMode();
    } else {
      setPrivateMode(true);
      enterPrivateMode();
      enterChat();
    }
  };

  // Greeting the companion has already said (drives the arrival headline).
  const greetingLines = messages
    .filter((m) => m.sender === "companion" && m.kind !== "call-record")
    .map((m) => m.text);

  // "Chat started" = the USER has sent at least one message (text / chip / voice).
  // The companion's greeting does NOT count — so private mode stays available
  // right up until the user's own first message.
  const userStartedChat = messages.some((m) => m.sender === "user");
  const canEnterPrivate = !userStartedChat;
  const showChips = input.trim() === "" && !userStartedChat;

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
            onStartVoice={handleStartVoice}
            onChip={handleChip}
            onCall={handleCall}
            onBack={goHome}
            onPrivate={handleTogglePrivate}
            canPrivate={canEnterPrivate}
          />
        ) : (
          <ChatView
            uiLanguage={uiLanguage}
            messages={messages}
            isTyping={isTyping}
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStartVoice={handleStartVoice}
            recording={recording}
            liveTranscript={liveTranscript}
            onVoiceTranscript={setLiveTranscript}
            onVoiceSend={handleVoiceSend}
            onVoiceCancel={handleVoiceCancel}
            showChips={showChips}
            onChip={handleChip}
            onBack={goHome}
            onCall={handleCall}
            onTitleClick={() => setProfileOpen(true)}
            privateMode={privateMode}
            onTogglePrivate={handleTogglePrivate}
            canEnterPrivate={canEnterPrivate}
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
            setPrivateMode(false);
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
