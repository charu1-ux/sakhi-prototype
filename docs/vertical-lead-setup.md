# Vertical Lead Setup — Follow Exactly What I Did

> Written by Shivali. These are the exact steps I took to set up the Astrology vertical. Follow them in order.

---

## Step 1 — Create a folder called intelligence-prototype

On your machine, create a folder where you want the project to live:

```bash
mkdir intelligence-prototype
cd intelligence-prototype
```

---

## Step 2 — Clone the repo into that folder

```bash
git clone https://github.com/akshayborhaderil/intelligence-prototype.git .
```

The `.` at the end clones directly into the folder you just created.

---

## Step 3 — Open Cowork and connect your repo folder

Open Cowork and connect it to your local `intelligence-prototype` folder. Claude can now read and edit files, run terminal commands, and handle git — you just talk to it.

---

## Step 4 — Tell Claude what you are and what you're doing

Tell Claude:

> _"This is the local prototype. I am the vertical lead for [your vertical]. I will be owning only the [vertical] items from the main homepage. I will also push things periodically to GitHub."_

This gives Claude context for everything that follows.

---

## Step 5 — Ask Claude about the branch strategy

Ask Claude:

> _"Should I create a different branch? Would you take care of the rest?"_

Claude will confirm: yes, create a separate branch. Claude handles all the git commands.

---

## Step 6 — Ask Claude to verify GitHub is set up

Ask:

> _"Is GitHub already set up on this repo? Can you check?"_

Claude will run `git remote -v` and confirm the remote is pointing to `github.com/akshayborhaderil/intelligence-prototype`.

---

## Step 7 — Give Claude the branch name and create it

Tell Claude:

> _"Branch name — vertical/[your-vertical]"_

Claude will create it and push it to GitHub:

```bash
git checkout -b vertical/[your-vertical]
git push -u origin vertical/[your-vertical]
```

Your branch is now live on GitHub.

---

## Step 8 — Brief Claude on the experience scope

Tell Claude:

> _"Inside the main homepage there is a [vertical] menu item. Whatever experience we create, we will do it inside the [vertical] menu item once the user clicks on it. From the local, take reference of the designs already done for Jobs — the Jobs landing page, second level navigation, and third level chat experience. Take reference of the pages, navigation, interaction and the experience. Do NOT take any reference of the styling — I'll give the style from the skill."_

---

## Step 9 — Invoke the design system skill and share the HTML

Trigger the `a2ui-design-system` skill in Cowork and attach the file **`atom-gallery-master.html`**. Tell Claude:

> _"Use this HTML only for UI reference — structure, navigation, interaction. Do not use it for styling."_

If Claude can't read the HTML, share screenshots of it instead.

---

## Step 10 — Create a minimal landing page to verify routing

Before building anything real, ask Claude to create a throwaway page just to confirm the route is wired up:

> _"Create a landing page for [vertical] and link it with the [vertical] tab on the main homepage. This is only for verification — create a very light/simple landing page. Only write '[vertical]' as an H1. Only for testing purposes."_

Claude will update `apps/shell/src/app/<slug>/page.tsx` with just an H1.

---

## Step 11 — Run locally to verify

```bash
npm run dev
```

Open **http://localhost:3000** → tap your vertical on the homepage → confirm it navigates to your page.

---

## Step 12 — Replace the placeholder with the real shell

Once routing is confirmed, tell Claude to remove the test H1 and build the proper page structure:

> _"Remove the H1. For the landing page — take the header, bottom chat input and surface background from Jobs."_

Claude will import `HubHeader` and `HubChatInput` from the Jobs design prototype and apply `bg-canvas-grey` as the page background.

---

## Step 13 — Git workflow going forward

- Claude makes all file edits — you just describe what you want
- **Only ask Claude to push when you're ready** — say _"push to git"_
- Commit format: `feat(<slug>): description of change`
- If you hit a git lock error, run this in your terminal then ask Claude to retry:
  ```bash
  rm /path/to/intelligence-prototype/.git/index.lock
  ```

---

## Assets you already have

| Asset                                       | What it is                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `atom-gallery-master.html`                  | UI reference HTML — share this with Claude for structure/interaction reference only (not styling)     |
| `a2ui-design-system` skill                  | Installed in Cowork — Claude uses this for all JDS tokens, components, dark mode, spacing, typography |
| `apps/shell/src/app/jobs/design-prototype/` | Jobs pages — reference for page structure, navigation, and interaction patterns                       |

---

## Your vertical's key files

| File                                                        | Purpose                                                |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| `apps/shell/src/app/<slug>/page.tsx`                        | Your landing page                                      |
| `apps/shell/src/app/jobs/design-prototype/HubHeader.tsx`    | Shared header component                                |
| `apps/shell/src/app/jobs/design-prototype/HubChatInput.tsx` | Shared bottom chat input                               |
| `apps/shell/src/components/molecules/VerticalList.tsx`      | Homepage nav — already links to your slug, don't touch |
