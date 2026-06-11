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
