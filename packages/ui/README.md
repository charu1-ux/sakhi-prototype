# @intelligence/ui

Shared UI layer for the monorepo: design-system primitives, motion, and [HeroUI v3](https://www.heroui.com/).

## HeroUI

Styles are loaded in each app's `globals.css` (after `tailwindcss`; each app lists `@heroui/styles` as a dependency):

```css
@import "tailwindcss";
@import "@heroui/styles";
```

Components (no Provider required in v3):

```tsx
import { Button, Card } from "@intelligence/ui/heroui";

export function Example() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Title</Card.Title>
      </Card.Header>
      <Card.Content>
        <Button onPress={() => {}}>Action</Button>
      </Card.Content>
    </Card>
  );
}
```

Use `onPress` instead of `onClick` for interactive HeroUI components.

Radix-based primitives in this package remain the default for the intelligence design system; reach for HeroUI when you want pre-built compound components (forms, overlays, data display) without building from scratch.
