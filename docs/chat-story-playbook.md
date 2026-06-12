# Chat Story Playbook

How to prototype an AI chat experience using the intelligence-prototype framework. Written for product managers — no code knowledge needed to write the script. Engineers use this document to build the prototype.

---

## What is a "chat story"?

A chat story is an interactive prototype that looks and feels like a real AI conversation. It auto-plays itself — user messages appear, AI responds, loaders spin, rich cards slide in — like a scripted demo. At key moments it pauses and waits for the user to tap a button before continuing.

The JioMart grocery purchase flow (`/commerce/jiomart`) is the reference implementation for this pattern.

---

## What you need to hand off (PM checklist)

### 1. The script

Write every turn of the conversation in order. For each turn, specify:

| Field                               | What to fill in                                        |
| ----------------------------------- | ------------------------------------------------------ |
| **Turn #**                          | Sequential number                                      |
| **Type**                            | `user` / `ai` / `loader` / `widget`                    |
| **Copy or label**                   | Exact text to display                                  |
| **Delay**                           | Seconds after the previous turn (leave blank if gated) |
| **Gated?**                          | Yes = waits for a button tap. No = auto-advances       |
| **Button label → what it triggers** | Only if gated. E.g. "Checkout → Turn 8"                |

#### Script template

| Turn | Type   | Copy / Label              | Delay (s) | Gated?  | Button → Turn          |
| ---- | ------ | ------------------------- | --------- | ------- | ---------------------- |
| 1    | user   | _What the user said_      | 0.5       | No      | —                      |
| 2    | loader | _What the AI is doing…_   | auto      | No      | —                      |
| 3    | widget | _(see widget spec below)_ | 2         | No      | —                      |
| 4    | ai     | _What the AI responded_   | 2         | No      | —                      |
| 5    | user   | _User's next message_     | 2         | No      | —                      |
| 6    | loader | _Working on it…_          | auto      | No      | —                      |
| 7    | ai     | _AI reply_ + widget       | 2         | **Yes** | "Primary CTA" → Turn 8 |
| 8    | user   | _User confirms_           | auto      | No      | —                      |
| …    | …      | …                         | …         | …       | …                      |

**Key rules for the script:**

- A `loader` always disappears and is replaced — by an `ai` message, a `widget`, or both.
- A `widget` can appear on its own or immediately after an `ai` message.
- A `gated` turn does not auto-advance. The story only continues after the user taps the button you specify.
- Multiple things can appear at the same turn (e.g. an `ai` message and a `widget` at the same time).

---

### 2. Widget specs

For each widget card in the story, describe:

| Field                  | Example                                              |
| ---------------------- | ---------------------------------------------------- |
| **Widget name**        | Cart summary                                         |
| **Title bar text**     | "Your Cart"                                          |
| **Content rows**       | Product image, name, qty, price; total; savings pill |
| **Primary CTA button** | "Checkout" — gated, triggers Turn 8                  |
| **Secondary elements** | Delete icon on cart items, stepper for qty           |

You do not need to design the layout — engineers reuse the standard card shell (white card, rounded corners, subtle border). You only specify what information goes inside and what the button does.

---

### 3. List content (products, addresses, flights etc.)

If a widget shows a list of items, provide a table:

**Example — products:**

| ID               | Name                      | Price | MRP | Badge | Image filename        | Initial state |
| ---------------- | ------------------------- | ----- | --- | ----- | --------------------- | ------------- |
| apple-shimla     | Apple Shimla Economy 1 kg | ₹220  | —   | —     | apple-shimla.webp     | Out of stock  |
| apple-royal-gala | Apple Royal Gala 4 pcs    | ₹220  | —   | —     | apple-royal-gala.webp | Already added |
| apple-washington | Washington Apple 1 kg     | ₹260  | —   | —     | washington-apple.webp | Add           |

**Initial state options:** `add` (show + ADD button) · `added` (show stepper) · `oos` (show "Out of stock", disabled)

**Images:** Provide studio cut-outs on a white or transparent background. `.webp` or `.png`. Name files with lowercase-kebab-case.

---

### 4. Static data

Anything that appears in a widget as pre-filled information:

| Item               | Example                                        |
| ------------------ | ---------------------------------------------- |
| Saved addresses    | Name, tags (Home / Default), full address line |
| Order confirmation | Order ID, ETA, payment method                  |
| Delivery location  | Name, tag, address line                        |
| Cart totals        | Subtotal, MRP, savings amount, item count      |

---

### 5. Timing preferences

Tell the engineer if you want the story to feel snappier or more deliberate. You can adjust just by naming the feel — or be specific:

| Setting            | What it controls                                    | Default |
| ------------------ | --------------------------------------------------- | ------- |
| Opening pause      | Before the first message appears                    | 0.5 s   |
| Beat               | Gap between most auto messages                      | 2 s     |
| Search loader hold | How long "Searching…" stays                         | 2 s     |
| Action loader hold | How long "Adding to cart…" / "Placing order…" stays | 2 s     |
| Address beat       | Longer pause before address follow-ups              | 3 s     |

---

## Spacing and visual rules (for reference)

These are fixed in the design system — you do not need to specify them:

- **32 px gap** before every new user message
- **24 px gap** from a user message down to the AI reply
- **12 px gap** between an AI message and the widget that follows it
- User bubbles are right-aligned, rounded pill shape, light gray background
- AI messages are left-aligned, bold, no bubble
- All CTA buttons inside widgets: full-width pill, light purple background, dark purple text

---

## Example: JioMart grocery purchase (reference implementation)

Route: `/commerce/jiomart`

| Turn | Type        | Copy                                                               | Delay | Gated?  | Button                            |
| ---- | ----------- | ------------------------------------------------------------------ | ----- | ------- | --------------------------------- |
| 1    | user        | Buy apples and ghee                                                | 0.5 s | No      | —                                 |
| 2    | loader      | Searching for apples and ghee on JioMart                           | auto  | No      | —                                 |
| 3    | widget      | Product swim lanes (Apples + Ghee)                                 | 2 s   | No      | —                                 |
| 4    | ai          | Want me to add any of these to your cart?                          | 2 s   | No      | —                                 |
| 5    | user        | Add the Royal Gala apples and the Milkfood ghee, then show my cart | 2 s   | No      | —                                 |
| 6    | loader      | Adding both to your JioMart cart                                   | auto  | No      | —                                 |
| 7    | ai + widget | Added both to your JioMart cart. Here it is. + Cart widget         | 2 s   | **Yes** | Checkout → Turn 8                 |
| 8    | user        | Which address is this being shipped to?                            | auto  | No      | —                                 |
| 9    | ai          | It's going to 37 Cunningham Rd, Bengaluru (Home)…                  | 2 s   | No      | —                                 |
| 10   | user        | Switch it — show my saved addresses                                | 3 s   | No      | —                                 |
| 11   | loader      | Searching your saved JioMart addresses                             | auto  | No      | —                                 |
| 12   | ai + widget | Here are your saved JioMart addresses. + Saved addresses widget    | 2 s   | No      | —                                 |
| 13   | user        | Use my Kanpur address                                              | 2 s   | No      | —                                 |
| 14   | ai + widget | Done — switched to Kanpur. + Delivery updated widget               | 2 s   | No      | —                                 |
| 15   | user        | Actually, add a new address instead                                | 2 s   | No      | —                                 |
| 16   | ai + widget | Sure — share your location. + New address widget                   | 2 s   | **Yes** | Use my current location → Turn 17 |
| 17   | user        | Use my current location                                            | auto  | No      | —                                 |
| 18   | ai + widget | Got your location. Add a few details. + Address form               | 2 s   | **Yes** | Save & use this address → Turn 19 |
| 19   | user        | Saved it — take me to checkout                                     | auto  | No      | —                                 |
| 20   | ai + widget | Saved and set as delivery address. + Confirm order widget          | 2 s   | **Yes** | Place Order → Turn 21             |
| 21   | user        | Place my order                                                     | auto  | No      | —                                 |
| 22   | loader      | Placing your order                                                 | auto  | No      | —                                 |
| 23   | widget      | Order placed! widget                                               | 2 s   | **Yes** | Track order (terminal)            |

---

## How to start a new experience

1. **PM fills out** the script table + widget specs + data tables above
2. **30-minute kickoff** with the engineer to walk through the script together
3. **Engineer scaffolds** a new folder under `apps/shell/src/app/<vertical>/<experience>/`
4. **PM reviews** on a local build — give feedback on copy and timing only
5. **Engineer merges** → Vercel deploys automatically
6. **PM shares** the live URL in Confluence / Slack

**Estimated effort for a new story:**

- PM script writing: 1–2 hours
- Engineer build (using the template): 4–8 hours
- Iteration / polish: 1–2 hours

---

## Files engineers work with

```
apps/shell/src/app/<vertical>/<experience>/
  story-data.ts        ← all content, copy, data, timing
  story-widgets.tsx    ← all UI cards and interactive components
  <Name>Story.tsx      ← the orchestrator (timer, phases, scroll)
  page.tsx             ← Next.js route — one line
apps/shell/public/<vertical>/<experience>/
  product-image.webp   ← static assets
```

No new infrastructure or dependencies are needed for any new story.
