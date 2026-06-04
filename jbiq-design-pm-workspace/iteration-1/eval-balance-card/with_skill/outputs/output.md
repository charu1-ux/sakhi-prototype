## Design Brief — Finance Balance Card

### What it is

A card showing the user's Jio account balance, account number, and a recharge action — used on the Finance vertical home screen.

### Surface context

This card sits on a screen. Confirm which surface the parent screen uses:

- If the screen is white (Surface 1) → card background is **neutral-100** (light grey)
- If the screen is light grey (Surface 2) → card background is **white**

Use the correct card surface token: `bg-surface-card-on-1` or `bg-surface-card-on-2`.

### Components

**Account number**

- Style: `text-body-s font-medium text-text-low`
- Plain, secondary prominence — this is supporting context

**Balance amount**

- Style: `text-headline-l font-black tracking-tight text-text-high`
- This is the hero number on the card — big, bold, compressed

**"Recharge" button**

- Shape: pill (`rounded-full`)
- Type: Primary — action colour background, white text
- Style: `text-button font-bold`
- The Finance vertical's confirmed action colour goes here as the background primitive
- 🚩 Flag: confirm the Finance vertical's action colour with the design team before implementing

**Card container**

- Shape: `rounded-xl` (standard card)
- No border unless explicitly asked
- No shadow — flat colour only
- Padding: `p-4` (16px inner padding)
- Layout: vertical stack, `gap-3` (12px) between account number and balance, `gap-5` (20px) between balance and button

### Colour intent

- Balance amount and account number: `text-text-high` and `text-text-low`
- Recharge button: Finance vertical's action colour (Tailwind primitive — confirm with design team)
- Card background: matches the inverse of the parent surface (see Surface context above)

### States

- **Loading**: show a skeleton shimmer — `animate-pulse` placeholder on the card surface colour. Never use a spinner.
- **Error** (balance unavailable): show error message in `text-error` colour
- **Disabled Recharge**: `opacity-40` on the button

### 🚩 Flags (needs confirmation)

- Finance vertical action colour not yet confirmed — use a `🚩 DEV FLAG` placeholder until design team provides the Tailwind primitive
- Confirm parent screen surface (Surface 1 or Surface 2) to select correct card background token
