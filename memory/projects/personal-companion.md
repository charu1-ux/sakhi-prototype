# Personal Companion

**Vertical lead:** Priyam Rajput
**Slug:** `personal-companion`
**Status:** Planning / build phase

## What It Is

A vertical on the JioBharatIQ homepage. Priyam owns the menu entry and the full feature area at `/personal-companion`.

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
