# Personal Companion

**Vertical lead:** Priyam Rajput
**Slug:** `personal-companion`
**Status:** V1 chat prototype built (Dil Ki Baat) — PC-01

## What It Is

A vertical on the JioBharatIQ homepage. Priyam owns the menu entry and the full feature area at `/personal-companion`.

The V1 feature is **Dil Ki Baat** — a voice-first, emotionally-warm Rogerian companion (PRD: `Feature_PC01_Dil_Ki_Baat_V2.docx`). Per the PRD there is **no landing page**: `/personal-companion` redirects straight to `/personal-companion/chat`.

## What's Built (June 2026)

Route `apps/shell/src/app/personal-companion/`:

- `page.tsx` — redirects to `/personal-companion/chat/`
- `chat/layout.tsx` — `data-personal-companion`, light color-scheme, metadata
- `chat/page.tsx` — assembles the chat window
- `chat/companion-data.ts` — copy/greetings/quick-chips per language (en/hi/hinglish), **deterministic Rogerian reply engine** with emotion + crisis classification and script-level language mirroring. Swap `generateReply` for `fetch('/api/chat')` to wire a real backend — bubble/timing contract already matches the PRD payload.
- `chat/useCompanion.ts` — state hook: first-message-on-load (first-time vs returning via `sessionStorage`), multi-bubble streaming with 250–700ms pauses, language persisted to `localStorage`, clear-chat.
- `chat/icons.tsx` — JDS stroke SVG icons (no emoji, no icon libs)
- `chat/_components/` — CompanionAvatar, CompanionHeader (prominent Call pill), MessageList, MessageBubble (WhatsApp grouping), TypingIndicator, QuickChips, Composer (text/send/speak), VoiceNoteMode (real mic RMS waveform + VAD; STT stubbed), CallScreen (full-screen zinc-950, amplitude rings, captions, mute/end, module-level `callActive` StrictMode guard), ProfileSheet (drag-to-dismiss, language selector).

### Stubs / not yet wired (V1 backend gaps)

- No `proxy.py` in this Next shell → replies are deterministic, not Claude Haiku.
- STT (Sarvam/ElevenLabs) and call TTS are **stubbed** — voice note returns a canned transcription; call turns show captions but play no audio.
- Memory layer is simulated (returning-greeting references a mood ~50% of the time); no persistence across sessions beyond `sessionStorage`.

### Scripted Happy-Flow demo (chat-story playbook)

A non-destructive scripted demo lives alongside the free-form chat, reachable at **`/personal-companion/chat?demo=happy`**. Follows the Chat Story Playbook (auto-playing turns, gated CTA):

- `chat/story-data.ts` — PRD §8 Happy Flow turns (returning → remembered → live call → resolved), 3 languages.
- `chat/_components/HappyFlowStory.tsx` — orchestrator: auto-plays turns, typing loader, one gated **Call** CTA that opens the real `CallScreen`, then a **Replay** CTA. Reuses CompanionHeader / MessageList / CallScreen.
- `chat/page.tsx` — branches on `?demo=happy` via `useSyncExternalStore`; default export renders `FreeFormChat` otherwise.

The free-form chat stays the product surface; this is purely a reliable stakeholder-demo rail. To remove: delete `story-data.ts` + `HappyFlowStory.tsx` and drop the `?demo` branch in `page.tsx`.

### Animated welcome arrival (default entry)

The companion now opens on an **animated arrival** screen, then transitions into the chat on the first reply — so the user never lands on a near-empty thread.

- `chat/_components/WelcomeArrival.tsx` — living-portrait avatar (breathing/float, pulsing aura rings, shimmer sweep), greeting spoken aloud via TTS (aura reacts), greeting text rises in, plus reply affordances right there: quick chips + composer (text + mic) + a Call pill.
- `chat/_components/ChatView.tsx` — the chat surface extracted as presentational (props-driven).
- `chat/_components/CompanionExperience.tsx` — orchestrator: holds ONE `useCompanion` instance + shared interaction state, renders `WelcomeArrival` or `ChatView` over the same conversation, and the greeting seen on arrival becomes the first chat message. Owns the Call/Profile overlays.
- `chat/page.tsx` modes (via `useSyncExternalStore`): default = arrival→chat; **`?intro=0`** = straight to chat (skip arrival); **`?demo=happy`** = scripted story.

Avatar liveliness is "living portrait" motion only — a still photo can't truly blink/wave; real facial animation would need a rigged Lottie/short video swapped into `CompanionAvatar`.

### Immersive Voice Chat (Grok-style, JBIQ language)

The mic/"voice chat" affordance now opens an immersive hands-free voice companion instead of the WhatsApp-style voice-note panel:

- `chat/_components/VoiceChatScreen.tsx` — full-screen, white-dominant with a soft purple glow (NOT the dark Call screen). Large living-portrait avatar with aura rings that **react to the user's voice** (mic RMS) while listening and pulse while the companion speaks. Continuous loop: listen (VAD) → stub STT → reply via `generateReply` → **TTS auto-plays** with a live caption (user line italic, companion line solid). Controls: a mic button (tap to pause/resume) + a "Text" pill to switch back to chat. Module-level `voiceChatActive` StrictMode guard.
- Each exchange is appended to the chat thread as voice bubbles via `useCompanion.appendVoiceExchange(...)` (companion bubble reuses the spoken id so chat doesn't re-autoplay it). Switching to "Text" lands in the chat with the transcript.
- `VoiceNoteMode.tsx` is now unused (kept in repo); the composer mic routes to `VoiceChatScreen` via `CompanionExperience` (`voiceChatOpen` overlay).

Distinct from **Call** (`CallScreen`, dark zinc, phone metaphor): Voice Chat is the bright, avatar-forward, captioned conversation.

### Verified

`tsc`, `eslint`, and `next build` all pass; `/personal-companion` + `/personal-companion/chat` in route manifest.

## Files to Create / Own

- `apps/shell/src/app/personal-companion/` — page and sub-routes
- Entry in `apps/shell/src/components/molecules/VerticalList.tsx` (add to `verticalsFeatured`)
- Icon: `/public/assets/shell/ico-personal-companion.svg` (needs to be created)
- Gradient token: `from-vertical-personal-companion` (needs to be added to Tailwind config)

## Pattern to Follow

Look at `apps/shell/src/app/jobs/design-prototype/` for the most complete example of a vertical with a hub layout, chat input, and sub-pages.

## Notes

- Homepage pulls verticals from hardcoded arrays in `VerticalList.tsx` — no CMS
- Capacitor-aware routing: check `window.location.protocol === "capacitor:"` for native links
