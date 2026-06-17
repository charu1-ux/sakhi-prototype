# Daily Saathi — Chat Stories

Per-pill chat scripts for the **current** Daily Saathi design, written in the Chat Story Playbook format and split into **Dil Ki Baat (DKB)** and **Kaam Ki Baat (KKB)**.

> **How these stories play (important):** unlike the JioMart reference (which auto-plays on a timer), Daily Saathi stories are **response-driven** — the assistant's turn only appears after the user responds (taps a suggested reply or types). So every `ai` turn below implicitly waits for the preceding `user` turn. "Delay" = the typing beat before the assistant's bubbles (~0.4–0.7 s); none of these turns are button-gated.

Routes: DKB = `/personal-companion/chat/` · KKB = `/personal-companion/daily-saathi/kaam-ki-baat/`
Languages: KKB ships EN + Hindi (the `EN / हिं` toggle); DKB copy is English/Hinglish. `{Name}` = the user's first name (e.g. "Priyam").

---

# Part 1 — Dil Ki Baat (DKB)

The emotional companion. Presented as an **assistant, not a person** — no invented persona or interests. Composer: text + a **mic (dictation → speech-to-text)** + a **voice-chat** orb. No "+" attach. Header has a **Private chat** toggle.

DKB shows **6 feeling pills**. Only **"Just here to talk"** runs a scripted arc (it gently gets to know the user); the other five open the chat seeded with the pill text and reply warmly, then continue free-form.

## 1.1 "Just here to talk" — scripted getting-to-know-you

| Turn | Type | Copy                                                                                           | Delay  | Gated? |
| ---- | ---- | ---------------------------------------------------------------------------------------------- | ------ | ------ |
| 1    | user | Just here to talk                                                                              | tap    | No     |
| 2    | ai   | Hi {Name}, I'm your Daily Saathi. I'm glad you're here. · How are you doing today?             | 0.5 s  | No     |
| 3    | user | _(free reply)_                                                                                 | —      | No     |
| 4    | ai   | Thank you for sharing that. · What's been on your mind the most lately?                        | 0.45 s | No     |
| 5    | user | _(free reply)_                                                                                 | —      | No     |
| 6    | ai   | I hear you. · When you get a little time for yourself, what do you like to do?                 | 0.45 s | No     |
| 7    | user | _(free reply)_                                                                                 | —      | No     |
| 8    | ai   | That's good to know about you. · Is there something you've been wanting to make more time for? | 0.45 s | No     |
| 9    | user | _(free reply)_                                                                                 | —      | No     |
| 10   | ai   | Got it — I'll keep that in mind for you. · Who or what usually lifts your mood on a tough day? | 0.45 s | No     |
| 11   | user | _(free reply)_                                                                                 | —      | No     |
| 12   | ai   | Thank you for letting me get to know you a little. · I'm here whenever you'd like to talk.     | 0.45 s | No     |
| 13+  | —    | _Generic warm engine takes over (see 1.2)._                                                    | —      | No     |

> Intent: learn the user's context (interests, what lifts their mood) — later persisted to **memory**. "I'll keep that in mind for you" hints at memory without implying the AI is human.

## 1.2 The other five feeling pills

`Got a lot on my mind` · `Something good happened` · `Feeling overwhelmed` · `No reason, just felt like it` · `Need to vent`

| Turn | Type    | Copy                                                                                                                                                         | Delay  | Gated? |
| ---- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ |
| 1    | user    | _(the pill label, e.g. "Need to vent")_                                                                                                                      | tap    | No     |
| 2    | ai      | _One warm line, cycled:_ "Sun rahi hoon… bata, kya chal raha hai?" / "Hmm, samajh sakti hoon. Aur batao." / "Main yahin hoon. Jo bhi mann mein hai, keh do." | 0.65 s | No     |
| 3+   | user/ai | _Free-form; each user message gets the next warm line._                                                                                                      | —      | No     |

## 1.3 Input modes (not pills)

| Mode                | Trigger                       | Behaviour                                                                                                                                                                                 |
| ------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mic (dictation)** | mic button left of voice-chat | Composer becomes a listening waveform (✕ / send). On send, the recognised speech posts as the user's message → the chat continues. Speech-to-text for typing-free chatting.               |
| **Voice chat**      | the filled orb button         | Full-screen voice mode: breathing avatar orb + status (Connecting… → Say something → Listening… → Thinking…). Spoken turns transcribe into the chat; the keyboard button returns to text. |
| **Private chat**    | lock icon in the header       | Resets to a fresh thread fronted by a centred notice: a lock chip, **"Private chat"**, and _"This chat won't appear in history and will be erased from memory."_                          |

> Crisis-safety routing (e.g. self-harm language → helpline response) is **not** in this prototype build; it's planned for the AI phase.

---

# Part 2 — Kaam Ki Baat (KKB)

The get-things-done assistant. Same chat + header throughout (no route hops). Opens with: _"Namaste! I can help you get things done. What would you like to do?"_ Composer: text + **"+" attach** + voice-chat. Pills: **Today's Briefing** (placeholder) · **Create an image** · **Explain a doc**. (Reminders are parked while Briefing is WIP.)

## 2.1 "Today's Briefing" — placeholder (WIP)

| Turn | Type | Copy                       | Delay           | Gated? |
| ---- | ---- | -------------------------- | --------------- | ------ |
| 1    | user | Today's Briefing           | tap (grey pill) | No     |
| 2    | ai   | Daily Briefing coming soon | 0.4 s           | No     |

## 2.2 "Create an image" — inline, with a generated-image card

Greeting after tap: _"Describe the image you'd like and I'll create it."_ The result card appears after Turn 0.

| Turn | Type    | Suggested replies (user)                                                | AI reply                                                                   | Card                     |
| ---- | ------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| 0    | user→ai | A Diwali greeting card · A poster for my shop · A birthday card for Mom | On it — give me a moment. · Here's a first version 👇                      | **Generated image** card |
| 1    | user→ai | Make it warmer · Add 'Happy Diwali' text · More colourful               | Nice idea — tweaking it now. · How does this version feel?                 | —                        |
| 2    | user→ai | Add my shop name · Make the diya bigger                                 | Done — added that in. · Want any other change?                             | —                        |
| 3    | user→ai | That's perfect · Try a different style                                  | Glad you like it! · I can save it or make a few variations.                | —                        |
| 4    | user→ai | Save it · Make 2 more variations                                        | Saved to your gallery. · Anything else you'd like to create?               | —                        |
| 5    | user→ai | Resize for WhatsApp status · I'm done for now                           | Sure — resized for a WhatsApp status. · Ping me whenever you need another. | —                        |

**Image card:** white `rounded-xl` card — image placeholder (aspect-video, image icon) · "GENERATED IMAGE" tag · the user's prompt · "Tap to save or regenerate".

## 2.3 "Explain a doc" — inline, with upload + summary card

Greeting after tap: _"Share a document or paste some text and I'll break it down for you."_ The user can tap **"+" → Add a document** (drops `Rent agreement.pdf` into the chat) or pick a suggestion; either produces the summary card at Turn 0.

| Turn | Type    | Suggested replies (user)                                                           | AI reply                                                                                                    | Card             |
| ---- | ------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------- |
| 0    | user→ai | Summarise my rent agreement · Explain this bank SMS · What does this form ask for? | Got it — reading through it now. · Here's the gist 👇                                                       | **Summary** card |
| 1    | user→ai | What do I need to do? · Any important dates?                                       | Two things need you: sign page 3, and pay the deposit. · The deposit is due within 7 days of signing.       | —                |
| 2    | user→ai | Is anything unusual in it? · Explain the late-fee clause                           | One thing to note: there's a 2% monthly late fee on delayed rent. · Nothing else looks out of the ordinary. | —                |
| 3    | user→ai | Draft a reply to the landlord · Add the deadline to my reminders                   | Sure — I can do either. · Which would help more right now?                                                  | —                |
| 4    | user→ai | Add the deadline to reminders · Just save the summary                              | Done — I'll remind you before the deposit is due. · Anything else from the document?                        | —                |
| 5    | user→ai | No, that's all — thanks · Explain one more line                                    | Anytime. · Send me any document and I'll break it down just like this.                                      | —                |

**Summary card:** white `rounded-xl` card — "SUMMARY" tag · 3 bullets (sample = an 11-month ₹18,000/month rent agreement; ₹54,000 deposit due in 7 days; sign page 3, 2% monthly late fee).

## 2.4 "+" attach sheet

| Trigger             | Sheet options                                                                      | Result                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| "+" in the composer | Take a photo · Choose a photo · **Add a document — Analyse or summarize** · Cancel | Picking any option drops the file into the chat and runs the **Explain a doc** summary flow (2.3) inline. |

## 2.5 Voice chat (KKB)

Same shared voice mode as DKB — breathing **Kaam Ki Baat** avatar orb + status. Spoken turns post into the chat; keyboard returns to text.

---

## Entry points → these stories

| From              | Action                        | Lands in                          |
| ----------------- | ----------------------------- | --------------------------------- |
| Daily Saathi home | "Dil Ki Baat" card            | DKB (Part 1)                      |
| Daily Saathi home | "Kaam Ki Baat" card           | KKB (Part 2), chat greeting       |
| Daily Saathi home | quick pill "Create an image"  | KKB → `?intent=image` (story 2.2) |
| Daily Saathi home | quick pill "Explain a doc"    | KKB → `?intent=doc` (story 2.3)   |
| Daily Saathi home | quick pill "Today's Briefing" | grey placeholder (no flow)        |

---

## Where the copy lives (for engineers)

- **DKB:** `_shared/DilKiBaatExperience.tsx` — `TALK_REPLIES`, `COMPANION_REPLIES`, `DICTATION_STUBS`, the private-chat notice, the talk intro.
- **KKB:** `daily-saathi/saathi-i18n.ts` — `image.story`, `doc.story`, `kaam.attach`, `briefing.pill` / `briefing.comingSoon`; rendered by `kaam-ki-baat/page.tsx` with the shared `SuggestedReplies` + result cards.
- All stubbed/deterministic (no backend); EN + Hindi for KKB.
