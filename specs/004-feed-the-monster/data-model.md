# Data Model: Feed the Monster Math Game

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-03

## Entities

### Level (persisted)

Stored in `localStorage` under key `sproutplay_monster`.

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `level` | integer | 1, 2, 3 | Current difficulty tier |
| `consecutiveWins` | integer | 0–4 | Resets to 0 on overfed round or app restart |

**State transitions**:
- `consecutiveWins` increments by 1 on each successful round
- When `consecutiveWins` reaches 5 → `level` increments (cap at 3), `consecutiveWins` resets to 0
- On overfed reset → `consecutiveWins` resets to 0 (level does not drop)

**Defaults** (first launch or corrupt storage): `{ level: 1, consecutiveWins: 0 }`

---

### Round (in-memory only, not persisted)

One round = one target problem presented to the child.

| Field | Type | Notes |
|-------|------|-------|
| `target` | integer | The number the child must feed (2–10 depending on level) |
| `displayA` | integer \| null | First addend (Level 3 only); null for Levels 1 & 2 |
| `displayB` | integer \| null | Second addend (Level 3 only); null for Levels 1 & 2 |
| `currentCount` | integer | Items fed so far; starts at 0 |
| `result` | string | `'in_progress'` \| `'success'` |

**Transitions**:
- `in_progress` → `success` when `currentCount === target`

---

### DraggableItem (in-memory, one per item div)

| Field | Type | Notes |
|-------|------|-------|
| `el` | HTMLElement | The DOM element for this item |
| `emoji` | string | The emoji character displayed |
| `originalX` | number | CSS `left` at scatter time (px relative to tray) |
| `originalY` | number | CSS `top` at scatter time (px relative to tray) |
| `fed` | boolean | True after successfully dragged into mouth |
| `offsetX` | number | Touch offset X from tile top-left (set on dragstart) |
| `offsetY` | number | Touch offset Y from tile top-left (set on dragstart) |

---

### MonsterState (in-memory, drives CSS class)

CSS class applied to `#monster-container` determines animation state:

| Class | Visual | Triggered by |
|-------|--------|-------------|
| `idle` | Default monster face, slight float | Round start |
| `chomping` | Mouth open, brief scale bounce | Item fed to mouth |
| `happy` | Stars/sparkle CSS, bigger scale | Round success |

**Transitions**: `idle` → `chomping` (150ms, then back to `idle`) → after all fed → `happy`

---

## Storage Layout

```
localStorage['sproutplay_monster'] = JSON string of:
{
  "level": 1,          // int: 1 | 2 | 3
  "consecutiveWins": 0 // int: 0–4
}
```

No other keys are written. The mini-app never reads or writes `sproutplay_settings`.

---

## Derived values at runtime

| Derived | Source | Formula |
|---------|--------|---------|
| Target range | `level` | L1: 1–5, L2: 1–10, L3: sum of addends from table |
| Item count | `round.target` | Always equals `target` |
| Win threshold | constant | 5 consecutive correct rounds |
| Level-up announcement | `consecutiveWins` after increment | If new value === 0 and level advanced |
