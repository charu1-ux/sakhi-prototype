## Compliance Review — Home Screen

❌ **FAIL** — Loading state: A spinner is shown while the page loads. This must be replaced with a **skeleton shimmer** — a shimmering placeholder that matches the shape of the content. Spinners are never used in this design system.

❌ **FAIL** — Button shape: The CTA button has slightly rounded corners instead of being fully pill-shaped. All buttons must use `rounded-full` (a complete pill shape with fully rounded ends). Slightly rounded corners are not allowed on interactive elements.

❌ **FAIL** — Gradient on hero banner: A gradient is applied to the hero banner surface. Gradients are **never used** on any surface in this design system. The banner background must be a flat, solid colour.

---

### Summary

Three issues need to be fixed before this screen is compliant:

1. **Replace the spinner with a skeleton shimmer.** The loading state should show shimmering placeholder shapes in the same layout as the content — not a spinning indicator.

2. **Make the button fully pill-shaped.** The CTA button needs fully rounded ends (pill shape), not just softly rounded corners.

3. **Remove the gradient from the hero banner.** Use a flat, solid colour background instead. If you need visual separation, use a different surface colour (e.g. switch from white to light grey or vice versa).

Once these three are fixed, share the updated screen and I'll review again.
