"use client";
import React, { useState, useRef, useCallback } from "react";

const CHAT_PROXY = "https://jbiq-proxy.sunit3-sharma.workers.dev";
const SARVAM_KEY = "";

/* ── Markdown helper ── */
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;margin:8px 0 4px">$1</h3>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:16px">$1</li>')
    .split("\n\n")
    .map((p) => `<p style="margin-bottom:8px">${p}</p>`)
    .join("");
}

/* ══════════════════════════════════════════
   MENU DRAWER
══════════════════════════════════════════ */
interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onAstrologyClick: () => void;
}

export function MenuDrawer({ open, onClose, onAstrologyClick }: MenuDrawerProps) {
  const [page, setPage] = useState<"main" | "chats" | "assistants" | "tools" | "media">("main");

  if (!open) return null;

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    display: "flex",
  };
  const backdropStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
  };
  const drawerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: "85vw",
    maxWidth: 340,
    background: "var(--surface,#fff)",
    display: "flex",
    flexDirection: "column",
    paddingTop: "env(safe-area-inset-top)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
    overflowY: "auto",
    fontFamily: "'JioType', sans-serif",
  };
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid var(--stroke-subtle, rgba(36,38,43,.08))",
    cursor: "pointer",
    gap: 12,
  };
  const backBtn: React.CSSProperties = {
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: "var(--text-high,#141414)",
    borderBottom: "1px solid var(--stroke-subtle, rgba(36,38,43,.08))",
    cursor: "pointer",
  };

  const RECENT_CHATS = [
    { title: "Plan Goa trip for Dec", domain: "Travel" },
    { title: "IND vs AUS highlights", domain: "Cricket" },
    { title: "Translate this to Hindi", domain: "Translate" },
    { title: "Diwali poster ideas", domain: "Create" },
    { title: "December budget plan", domain: "Finance" },
  ];

  const ASSISTANTS = [
    {
      label: "Astrology",
      desc: "Kundli, Rashifal, Upay",
      action: () => {
        onClose();
        onAstrologyClick();
      },
    },
    { label: "Bollywood", desc: "Movies, Songs, Stars", action: onClose },
    { label: "Cricket", desc: "Scores, Teams, Players", action: onClose },
    { label: "Devotion", desc: "Temples, Prayers, Rituals", action: onClose },
    { label: "News", desc: "Breaking news, Updates", action: onClose },
    { label: "Finance", desc: "Markets, Stocks, Funds", action: onClose },
    { label: "Government", desc: "Schemes, Documents", action: onClose },
    { label: "Shopping", desc: "Grocery, Deals", action: onClose },
  ];

  return (
    <div style={menuStyle}>
      <div style={backdropStyle} onClick={onClose} />
      <div style={drawerStyle}>
        {/* ── MAIN PAGE ── */}
        {page === "main" && (
          <>
            <div
              style={{
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--text-high,#141414)" }}>
                Menu
              </span>
              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ✕
              </button>
            </div>
            {[
              { label: "Assistants", target: "assistants" },
              { label: "Tools", target: "tools" },
              { label: "Media", target: "media" },
              { label: "Chats", target: "chats" },
            ].map((item) => (
              <div key={item.label} style={rowStyle} onClick={() => setPage(item.target as any)}>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: "var(--text-disabled)", fontSize: 18 }}>›</span>
              </div>
            ))}
            <div
              style={{
                padding: "14px 18px 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-disabled,rgba(25,27,30,.38))",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Recent
            </div>
            {RECENT_CHATS.map((c, i) => (
              <div key={i} style={rowStyle} onClick={onClose}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--grey-20,#f5f5f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  💬
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 1 }}>
                    {c.domain}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div
              style={{
                padding: "12px 18px",
                borderTop: "1px solid var(--stroke-subtle, rgba(36,38,43,.08))",
                display: "flex",
                gap: 12,
                paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)",
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1px solid var(--stroke-subtle)",
                  borderRadius: 12,
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ⚙ Settings
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--primary-50,#3535f3)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + New Chat
              </button>
            </div>
          </>
        )}

        {/* ── ASSISTANTS PAGE ── */}
        {page === "assistants" && (
          <>
            <div style={backBtn} onClick={() => setPage("main")}>
              ← Assistants
            </div>
            {ASSISTANTS.map((a) => (
              <div key={a.label} style={rowStyle} onClick={a.action}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--surface-ghost-icon,#e7e9ff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🪐
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 1 }}>
                    {a.desc}
                  </div>
                </div>
                <span style={{ color: "var(--text-disabled)", fontSize: 18 }}>›</span>
              </div>
            ))}
          </>
        )}

        {/* ── CHATS PAGE ── */}
        {page === "chats" && (
          <>
            <div style={backBtn} onClick={() => setPage("main")}>
              ← Chats
            </div>
            {RECENT_CHATS.map((c, i) => (
              <div key={i} style={rowStyle} onClick={onClose}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--grey-20,#f5f5f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  💬
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-disabled)", marginTop: 1 }}>
                    {c.domain}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── TOOLS PAGE ── */}
        {page === "tools" && (
          <>
            <div style={backBtn} onClick={() => setPage("main")}>
              ← Tools
            </div>
            {[
              "Quick Translate",
              "Create image",
              "Generate videos",
              "Analyse docs",
              "Smart Shopping",
            ].map((t) => (
              <div key={t} style={rowStyle}>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{t}</span>
                <span style={{ fontSize: 11, color: "var(--primary-50,#3535f3)", fontWeight: 600 }}>
                  Coming soon
                </span>
              </div>
            ))}
          </>
        )}

        {/* ── MEDIA PAGE ── */}
        {page === "media" && (
          <>
            <div style={backBtn} onClick={() => setPage("main")}>
              ← Media
            </div>
            <div style={{ padding: "14px 18px 8px", fontSize: 13, fontWeight: 700 }}>
              Create image
            </div>
            <div style={{ display: "flex", gap: 10, padding: "0 18px", overflowX: "auto" }}>
              {["Sunset", "Mountains", "City", "Forest", "Ocean"].map((t) => (
                <div
                  key={t}
                  style={{
                    width: 100,
                    height: 70,
                    borderRadius: 12,
                    background: "var(--grey-20,#f5f5f5)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "var(--text-low)",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 18px 8px", fontSize: 13, fontWeight: 700 }}>Videos</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                padding: "0 18px",
              }}
            >
              {["🎬", "🎥", "📽️", "🎞️", "🎦", "📺"].map((e, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    background: "var(--grey-20,#f5f5f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CHAT OVERLAY
══════════════════════════════════════════ */
interface ChatOverlayProps {
  open: boolean;
  onClose: () => void;
  chatHistory: Array<{ role: string; content: string }>;
  onHistoryUpdate: (h: Array<{ role: string; content: string }>) => void;
}

export function ChatOverlay({ open, onClose, chatHistory, onHistoryUpdate }: ChatOverlayProps) {
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "ai" | "thinking"; text: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollBottom = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const sendChat = useCallback(async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const newHistory = [...chatHistory, { role: "user", content: text }];
    onHistoryUpdate(newHistory);
    setMessages((m) => [...m, { type: "user", text }]);
    scrollBottom();
    setLoading(true);
    setMessages((m) => [...m, { type: "thinking", text: "Thinking..." }]);
    try {
      const resp = await fetch(CHAT_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await resp.json();
      const aiText = data?.content?.[0]?.text || "Sorry, could not get a response.";
      const updatedHistory = [...newHistory, { role: "assistant", content: aiText }];
      onHistoryUpdate(updatedHistory);
      setMessages((m) => [...m.filter((x) => x.type !== "thinking"), { type: "ai", text: aiText }]);
    } catch (e) {
      setMessages((m) => [
        ...m.filter((x) => x.type !== "thinking"),
        { type: "ai", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollBottom();
    }
  }, [input, loading, chatHistory, onHistoryUpdate]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--surface,#fff)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JioType', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "calc(env(safe-area-inset-top) + 10px) 16px 10px",
          borderBottom: "1px solid var(--stroke-subtle)",
          gap: 8,
        }}
      >
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 22,
            padding: 4,
          }}
        >
          ←
        </button>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>New chat</span>
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
          }}
        >
          ✏️
        </button>
      </div>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-disabled)",
              padding: "40px 20px",
              fontSize: 14,
            }}
          >
            Ask anything — Jio AI is here to help
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              gap: 8,
            }}
          >
            {msg.type !== "user" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--surface-ghost-icon,#e7e9ff)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 16,
                }}
              >
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius: msg.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background:
                  msg.type === "user" ? "var(--primary-50,#3535f3)" : "var(--grey-20,#f5f5f5)",
                color: msg.type === "user" ? "#fff" : "var(--text-high,#141414)",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {msg.type === "thinking" ? (
                <span style={{ opacity: 0.6 }}>Thinking...</span>
              ) : msg.type === "ai" ? (
                <span dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
          borderTop: "1px solid var(--stroke-subtle)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendChat()}
          placeholder="Ask anything..."
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid var(--stroke-subtle)",
            borderRadius: 20,
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            background: "var(--grey-20,#f5f5f5)",
          }}
        />
        {input.trim() && (
          <button
            onClick={sendChat}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--primary-50,#3535f3)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
            }}
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   VOICE OVERLAY
══════════════════════════════════════════ */
type VState = "idle" | "listening" | "processing" | "thinking" | "speaking";

interface VoiceOverlayProps {
  open: boolean;
  onClose: () => void;
  chatHistory: Array<{ role: string; content: string }>;
  onHistoryUpdate: (h: Array<{ role: string; content: string }>) => void;
}

export function VoiceOverlay({ open, onClose, chatHistory, onHistoryUpdate }: VoiceOverlayProps) {
  const [vState, setVState] = useState<VState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const lastTtsBase64Ref = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = () => {
    if (!playbackCtxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC) playbackCtxRef.current = new AC();
    }
    if (playbackCtxRef.current?.state === "suspended") {
      playbackCtxRef.current.resume();
    }
  };

  const killRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      isRecordingRef.current = false;
    }
  };

  const encodeWav = (samples: Float32Array, sr: number): ArrayBuffer => {
    const buf = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buf);
    const writeStr = (off: number, s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);
    let off = 44;
    for (let i = 0; i < samples.length; i++, off += 2)
      view.setInt16(off, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
    return buf;
  };

  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AC();
    const arrayBuf = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuf);
    const sr = 16000;
    const oac = new OfflineAudioContext(1, decoded.duration * sr, sr);
    const src = oac.createBufferSource();
    src.buffer = decoded;
    src.connect(oac.destination);
    src.start();
    const rendered = await oac.startRendering();
    const wav = encodeWav(rendered.getChannelData(0), sr);
    return new Blob([wav], { type: "audio/wav" });
  };

  const speakWithSarvam = async (text: string) => {
    if (!SARVAM_KEY) return;
    try {
      const clean = text.replace(/\*\*/g, "").replace(/\*/g, "").substring(0, 500);
      const resp = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: { "api-subscription-key": SARVAM_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: [clean],
          target_language_code: "hi-IN",
          speaker: "anushka",
          model: "bulbul:v2",
          pitch: 0,
          pace: 1.0,
          loudness: 1.2,
          enable_preprocessing: true,
        }),
      });
      const data = await resp.json();
      if (!data.audios?.[0]) return;
      lastTtsBase64Ref.current = data.audios[0];
      setVState("speaking");
      const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);
      currentAudioRef.current = audio;
      audio.onended = () => setVState("idle");
      await audio.play();
    } catch (e) {
      setVState("idle");
    }
  };

  const processVoice = async (audioBlob: Blob) => {
    setVState("processing");
    try {
      const wavBlob = await convertToWav(audioBlob);
      const fd = new FormData();
      fd.append("file", wavBlob, "audio.wav");
      fd.append("model", "saaras:v3");
      fd.append("language_code", "unknown");
      fd.append("mode", "transcribe");
      setVState("thinking");
      const sttResp = await fetch("https://api.sarvam.ai/speech-to-text", {
        method: "POST",
        headers: SARVAM_KEY ? { "api-subscription-key": SARVAM_KEY } : {},
        body: fd,
      });
      const sttData = await sttResp.json();
      const tx = sttData.transcript || "";
      setTranscript(tx);
      if (!tx) {
        setVState("idle");
        return;
      }
      const newHistory = [...chatHistory, { role: "user", content: tx }];
      const chatResp = await fetch(CHAT_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const chatData = await chatResp.json();
      const aiText = chatData?.content?.[0]?.text || "";
      onHistoryUpdate([...newHistory, { role: "assistant", content: aiText }]);
      setResponse(aiText);
      await speakWithSarvam(aiText);
    } catch (e) {
      setVState("idle");
    }
  };

  const voiceTapMic = async () => {
    unlockAudio();
    currentAudioRef.current?.pause();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processVoice(blob);
      };
      mr.start();
      isRecordingRef.current = true;
      setVState("listening");
    } catch (e) {
      setVState("idle");
    }
  };

  const handleClose = () => {
    killRecording();
    currentAudioRef.current?.pause();
    setVState("idle");
    setTranscript("");
    setResponse("");
    onClose();
  };

  const stateLabel: Record<VState, string> = {
    idle: "Tap mic to speak",
    listening: "Listening...",
    processing: "Processing...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  };
  const dotBg: Record<VState, string> = {
    idle: "#e7e9ff",
    listening: "#ff6644",
    processing: "#f7ab20",
    thinking: "#3535f3",
    speaking: "#1eccb0",
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "var(--surface,#fff)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'JioType', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "calc(env(safe-area-inset-top) + 10px) 16px 10px",
          borderBottom: "1px solid var(--stroke-subtle)",
        }}
      >
        <button
          onClick={handleClose}
          style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 22 }}
        >
          ←
        </button>
        <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700 }}>Voice</span>
        <div style={{ width: 36 }} />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          padding: 24,
        }}
      >
        {/* Animated dot */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: dotBg[vState],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            transition: "background 300ms",
          }}
        >
          {vState === "listening" ? "🎤" : vState === "speaking" ? "🔊" : "💬"}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-high)" }}>
          {stateLabel[vState]}
        </div>
        {transcript && (
          <div
            style={{
              maxWidth: 320,
              textAlign: "center",
              fontSize: 14,
              color: "var(--text-low)",
              fontStyle: "italic",
            }}
          >
            "{transcript}"
          </div>
        )}
        {response && (
          <div
            style={{
              maxWidth: 320,
              background: "var(--grey-20,#f5f5f5)",
              borderRadius: 16,
              padding: "12px 16px",
              fontSize: 14,
              lineHeight: 1.5,
            }}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
          />
        )}
      </div>
      <div
        style={{
          padding: "20px",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {vState === "idle" || vState === "speaking" ? (
          <button
            onClick={voiceTapMic}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--primary-50,#3535f3)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🎤
          </button>
        ) : vState === "listening" ? (
          <button
            onClick={killRecording}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fa2f40",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⏹
          </button>
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--grey-20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              opacity: 0.5,
            }}
          >
            ⏳
          </div>
        )}
      </div>
    </div>
  );
}
