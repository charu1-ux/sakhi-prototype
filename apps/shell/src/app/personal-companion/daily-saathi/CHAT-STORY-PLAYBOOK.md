# Daily Saathi — Chat Story Playbook

How the scripted, response-driven chat demos work inside **Daily Saathi** (the Personal Companion "PM Design" flow), and how a PM hands off a new one. Written so a PM can author a script with no code, and an engineer can build it from the same table.

Inspired by the generic _Chat Story Playbook_ (JioMart reference). Daily Saathi stories differ in one important way — read **"How Daily Saathi stories play"** below.

---

## What is a Daily Saathi chat story?

A chat story is an interactive prototype that looks and feels like a real conversation with the assistant. Daily Saathi has two chat surfaces, each with its own scripted stories:

| Surface          | Route                                            | What it is                                                                                            |
| ---------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Dil Ki Baat**  | `/personal-companion/chat/`                      | The emotional companion. Stories = one guided conversation per "feeling" pill.                        |
| **Kaam Ki Baat** | `/personal-companion/daily-saathi/kaam-ki-baat/` | The get-things-done assistant. Stories = reminders (3 widget states), explain-a-doc, create-an-image. |

Both ship in **English + Hindi** for Kaam Ki Baat (the Daily Saathi `EN / हिं` toggle), and **English + Hinglish** for Dil Ki Baat (Hindi mirrors Hinglish in V1).

---

## How Daily Saathi stories play (the key difference)

The JioMart reference **auto-plays** on a timer. Daily Saathi stories are **response-driven**: nothing advances until the user responds. Each turn presents **suggested-reply chips** above the composer; tapping one (or typing freely) plays the next scripted assistant turn.

```
assistant turn 0  →  [suggested replies]  →  user taps/types  →  assistant turn 1  →  [suggested replies]  →  …
```

- A turn never auto-fires; the user is always in control of pace.
- Suggested replies are optional shortcuts — free typing advances the same script.
- When the script is exhausted, Dil Ki Baat falls back to its live reply engine; Kaam Ki Baat leaves the composer open with no further auto-reply.

This makes every story safe to demo live without it "running away," and lets the presenter pause on any turn.

---

## Spacing & visual rules (fixed in the design system)

- User bubbles: right-aligned, `rounded-[18px_18px_4px_18px]`, primary purple, white text.
- Assistant bubbles: left-aligned, `rounded-[4px_18px_18px_18px]`, white surface, subtle border + shadow.
- Suggested-reply chips: outline pill, `border-primary-50/30`, primary text, press-scale on tap.
- Result cards (image / doc / reminder): white `rounded-xl` card with border + soft shadow.
- Loaders are a short typing beat (~0.4–0.6 s) before each assistant bubble — never spinners.

---

# Part 1 — Dil Ki Baat stories

**Mechanism:** `chat/companion-data.ts` → `CHIP_SCRIPTS`. Each "feeling" pill maps to an ordered list of assistant turns (each turn = 1–2 bubbles). Tapping the pill plays turn 0; each subsequent user message advances one turn. After the last turn, the live Rogerian engine takes over seamlessly.

**Tone rules:** warm acknowledgement + **at most one gentle question** per turn, no advice, soft arc `open → explore → deepen → validate → land`. Crisis input always overrides the script with the safety + helplines turn.

There are **6 stories**, one per pill, each **9 turns**. Full copy lives in `CHIP_SCRIPTS`; the English arc of each is summarised below.

### 1.1 "Just here to talk" (`talk`)

| Turn | Assistant (English)                                                                          |
| ---- | -------------------------------------------------------------------------------------------- |
| 0    | Honestly, that's my favourite kind of visit. / So how's your day treating you?               |
| 1    | Mmm, I'm with you. / What's been the best little moment of it so far?                        |
| 2    | I love that — the small ones count the most. / Did anything make you smile today?            |
| 3    | That's lovely. / Who do you usually share moments like that with?                            |
| 4    | Sounds like they matter to you. / And how have you been feeling in yourself lately?          |
| 5    | Thanks for being honest about that. / Is there anything you've been wanting to say out loud? |
| 6    | I'm really glad you said it here. / What would feel nice to do for yourself this evening?    |
| 7    | That sounds just right. / Want to stay and chat a bit more, or sit quietly together?         |
| 8    | Either way, I'm right here. / We can pick this up whenever you like.                         |

### 1.2 "Got a lot on my mind" (`mind`)

Arc: lay it out → one-big-or-many → hardest to switch off → when it filled up → set one down → why that one → do the rest need tonight → head feels lighter → sort the rest later.

### 1.3 "Something good happened" (`good`)

Arc: tell me everything → how it felt → surprise or hoped-for → who you told first → most proud of → celebrated yet → what a celebration looks like → what to remember about today → come tell me how it goes.

### 1.4 "Feeling overwhelmed" (`overwhelmed`)

Arc: slow down, one breath → heaviest thing → building or tipped today → where you feel it → last proper break → set one aside → who can take some off your plate → what would feel lighter → start with one thing, no rush.

### 1.5 "No reason, just felt like it" (`noreason`)

Arc: that's reason enough → quietly on your mind or just being → day so far → ordinary days favourite → small thing for yourself → what helps you settle → anything to get off your chest → no pressure → drop by anytime.

### 1.6 "Need to vent" (`vent`)

Arc: go for it, no judgment → what else → that's unfair → how long building → who's on the other end → say it to them → what you wish they understood → get it all out → how it feels now / I'm here when it builds again.

---

# Part 2 — Kaam Ki Baat stories

**Mechanism:** scripted turns live in `saathi-i18n.ts` (`image.story`, `doc.story` as `StoryTurn[]`; reminder examples in `kaam.examples`). Two reusable pieces:

- `_components/SuggestedReplies.tsx` — the tappable chip row.
- `_components/ScriptedChatStub.tsx` — the multi-turn scripted conversation shell (used by image + doc). Seeds a greeting, then plays one `StoryTurn` per user response, optionally injecting a result card after a chosen turn.

### 2.1 Reminders — three widget states

Reminders are created inline in the Kaam Ki Baat chat via the **ReminderWidget** (What · Date · Time + Set button). Three tappable example chips drop the widget into each state without relying on the parser (so both languages read correctly):

| Example chip (EN)          | User line shown                              | Resulting widget state                                                            |
| -------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| Set a reminder             | "Set a reminder"                             | **Empty** — all three fields blank; lead-in invites filling.                      |
| Remind me to call the bank | "Remind me to call the bank"                 | **Partial** — What = "Call the bank"; Date + Time highlighted as missing.         |
| Pay rent tomorrow 9 AM     | "Remind me to pay the rent tomorrow at 9 AM" | **Full** — What = "Pay the rent", Date = Tomorrow, Time = 9:00 AM; ready to save. |

Flow for each: chip → user bubble → reminder widget at that state → user completes any missing fields → **Set reminder** → success card appended → back to chat (chips reappear). Chaining all three in one session reads as a long (8–10 turn) reminders conversation that demonstrates every state.

> Hindi note: widget field values for partial/full are authored in `kaam.examples[*].what` per language; date/time are structural so they localise automatically.

### 2.2 Create an image (`image.story`, 6 turns)

Greeting: _"Describe the image you'd like and I'll create it."_ The generated-image card appears after **turn 0**.

| Turn | Suggested replies                                                       | Assistant reply                                                            |
| ---- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 0    | A Diwali greeting card · A poster for my shop · A birthday card for Mom | On it — give me a moment. / Here's a first version 👇 **+ image card**     |
| 1    | Make it warmer · Add 'Happy Diwali' text · More colourful               | Nice idea — tweaking it now. / How does this version feel?                 |
| 2    | Add my shop name · Make the diya bigger                                 | Done — added that in. / Want any other change?                             |
| 3    | That's perfect · Try a different style                                  | Glad you like it! / I can save it or make a few variations.                |
| 4    | Save it · Make 2 more variations                                        | Saved to your gallery. / Anything else you'd like to create?               |
| 5    | Resize for WhatsApp status · I'm done for now                           | Sure — resized for a WhatsApp status. / Ping me whenever you need another. |

### 2.3 Explain a doc (`doc.story`, 6 turns)

Greeting: _"Share a document or paste some text and I'll break it down for you."_ The summary card appears after **turn 0** (sample doc = an 11-month rent agreement).

| Turn | Suggested replies                                                                  | Assistant reply                                                                                             |
| ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 0    | Summarise my rent agreement · Explain this bank SMS · What does this form ask for? | Got it — reading through it now. / Here's the gist 👇 **+ summary card**                                    |
| 1    | What do I need to do? · Any important dates?                                       | Two things need you: sign page 3, and pay the deposit. / The deposit is due within 7 days of signing.       |
| 2    | Is anything unusual in it? · Explain the late-fee clause                           | One thing to note: there's a 2% monthly late fee on delayed rent. / Nothing else looks out of the ordinary. |
| 3    | Draft a reply to the landlord · Add the deadline to my reminders                   | Sure — I can do either. / Which would help more right now?                                                  |
| 4    | Add the deadline to reminders · Just save the summary                              | Done — I'll remind you before the deposit is due. / Anything else from the document?                        |
| 5    | No, that's all — thanks · Explain one more line                                    | Anytime. / Send me any document and I'll break it down just like this.                                      |

---

## Files engineers work with

```
apps/shell/src/app/personal-companion/
  chat/
    companion-data.ts            ← Dil Ki Baat CHIP_SCRIPTS (per-pill turn arrays)
    useCompanion.ts              ← advances chip scripts on each user message
  daily-saathi/
    saathi-i18n.ts               ← Kaam Ki Baat story copy: image.story, doc.story, kaam.examples
    _components/
      SuggestedReplies.tsx       ← tappable suggested-reply chip row
      ScriptedChatStub.tsx       ← multi-turn scripted shell (image + doc)
      ReminderWidget.tsx         ← the What/Date/Time reminder card
    kaam-ki-baat/page.tsx        ← reminder examples + live widget flow
    kaam-ki-baat/create-image/page.tsx
    kaam-ki-baat/explain-doc/page.tsx
```

## How to add a new Kaam Ki Baat story

1. **PM** writes the turn table (suggested replies + assistant reply per turn) in English + Hindi.
2. **Engineer** adds a `StoryTurn[]` to `saathi-i18n.ts` for both languages.
3. Render it with `<ScriptedChatStub greet=… turns=… resultCard=… resultTurnIndex=… />`.
4. If it needs a rich card (image, summary, table), pass `resultCard` and the turn index it appears after.
5. **PM** reviews on a local build — feedback on copy + timing only.

## How to extend a Dil Ki Baat pill

1. **PM** writes the 8–10 turn arc (1–2 bubbles per turn), one gentle question max.
2. **Engineer** edits the relevant entry in `CHIP_SCRIPTS` (Hinglish + English; `hi` mirrors Hinglish via the `mkScript` helper).
3. No component changes needed — `useCompanion` already advances any-length scripts.

## Timing

| Setting                               | Value                    |
| ------------------------------------- | ------------------------ |
| Beat before each assistant bubble     | ~0.45 s typing indicator |
| Gap after user message (Kaam Ki Baat) | ~0.55 s                  |
| Bubble-to-bubble within a turn        | ~0.12–0.42 s             |
| Reminder save → success card          | immediate                |
