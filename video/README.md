# Agalist Commercial Video - Remotion Project

## Quick Start

```bash
cd video
npm install
npx remotion studio
```

## Render the Video

```bash
npx remotion render AgalistCommercial out/agalist-commercial.mp4
```

## Structure

- `src/Root.tsx` — Registers the composition (1080×1920, 30fps, 20s)
- `src/compositions/AgalistCommercial.tsx` — Main video composition with all scenes
- `src/components/UIComponents.tsx` — Reusable UI components (phone mockup, list items, logo, etc.)
- `src/styles.ts` — Design system constants & timeline

## Timeline

| Time | Frames | Scene |
|------|--------|-------|
| 0-3s | 0-90 | Phone enters from bottom with intro text |
| 3-8s | 90-240 | Typing items into the list |
| 8-13s | 240-390 | Shopping mode - checking items off |
| 13-16s | 390-480 | Finish flow with store modal |
| 16-20s | 480-600 | Logo reveal with pop animation |

## Audio Placeholders

Add `<Audio>` components in the composition for:
- Typing sounds during item entry
- Click sounds when checking items
- Whoosh/pop for logo reveal

Example:
```tsx
import { Audio } from "remotion";
<Audio src="/sfx/typing.mp3" startFrom={90} />
```
