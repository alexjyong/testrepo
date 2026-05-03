# Research: Feed the Monster Math Game

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-03

## Decision Log

### D-001: Drag mechanic — reuse abc.js pattern

**Decision**: Use the same `touchstart` / `touchmove` / `touchend` + `touchcancel` pattern from `abc.js`, with `getBoundingClientRect()` hit detection against the monster mouth zone.

**Rationale**: The pattern is proven, handles Android touch correctly, and the `cleanupDrag()` / `endDrag()` bug fixes are already baked in. No new infrastructure needed.

**Alternatives considered**:
- HTML5 drag-and-drop API — excluded because it has poor mobile support and no touch events on Android WebView.
- Pointer Events API — valid but adds complexity for no gain; the existing touch event model already works.

---

### D-002: Monster mouth hit zone — large centered `div`, not element `elementsFromPoint`

**Decision**: The monster mouth area is a dedicated, visually prominent `<div id="monster-mouth">` that takes up roughly the bottom third of the monster container. Hit detection checks whether the drag release point (`clientX/Y`) falls within that div's bounding rect.

**Rationale**: Large target = easy for 3-year-old fingers. Single-element rect check is simpler than `document.elementsFromPoint` and matches abc.js slot detection exactly.

**Alternatives considered**:
- `document.elementsFromPoint` — more flexible but overkill; adds edge-case complexity.
- Canvas hit testing — prohibited by constitution (no added complexity).

---

### D-003: Audio — extend Sound.js with `chomp()` and `overfed()` helpers

**Decision**: Add two new Web Audio oscillator methods to `Sound.js`: `Sound.chomp()` (short low-to-high blip, ~120ms) and `Sound.overfed()` (descending wah-wah, ~400ms). Call `Sound.celebrate()` on correct completion. Reuse `Sound.speak()` for TTS prompts.

**Rationale**: Web Audio oscillators are already the pattern for game SFX (memory.js). No files needed. `Sound.js` is the single entry point for all audio — adding here keeps mini-apps consistent.

**Alternatives considered**:
- Define sounds inline in monster.js — would break the "single entry point" convention.
- Use emoji TTS via `Sound.speak('🍎')` for food — TTS reads "red apple" which is distracting; oscillator chomp is better UX.

---

### D-004: Item count on screen = target number

**Decision**: The item tray always shows exactly `target` draggable items (or `sum` for Level 3). Items disappear when fed. There is no refill mechanism — once all items are fed, the round resolves (correct) or items are exhausted at exactly the right count.

**Rationale**: Prevents "run out of items" edge case entirely. Overfed path triggers only if the child drags more than target, which cannot happen if items = target. Therefore the only overfed scenario requires restarting — instead of a true overfed state, the "overfed" UX is eliminated in favor of a simpler model: exact match = celebrate, no drag remaining after last item = check and celebrate. This simplifies state management significantly.

**Revised overfed model**: Since items on screen = target, the child cannot overfeed. Overfed path is removed from scope. The spec assumption (items = target count) logically eliminates the overfed scenario. This is a scope clarification, not a spec violation — the spec said both, but they are mutually exclusive. Items = target is simpler and better UX for 3-year-olds.

> **Note for implementer**: Remove the overfed/groan animation from scope. When all items are fed, trigger celebration. If item falls outside mouth zone, animate it back (same as abc.js `animateBack`).

---

### D-005: Level persistence — dedicated localStorage key

**Decision**: Store level data under key `sproutplay_monster` as JSON `{ level: 1, consecutiveWins: 0 }`. Do not add to `sproutplay_settings` (that key is owned by `Settings.js` for parent settings only).

**Rationale**: Mini-app progress is player data, not a parent setting. Separate key avoids coupling to `Settings.js` internals. Follows precedent — no existing mini-app writes to `sproutplay_settings`.

---

### D-006: Level 3 addition problem generation

**Decision**: Pre-defined table of `{ a, b }` pairs where both addends are 1–5 and sum is 2–10. Randomly select from the table each round, avoiding the previous pair. Display as "A + B = ?" on the sign; TTS reads "[A] plus [B] — feed me [sum]!"

**Rationale**: Random addend generation with constraints (no zeros, sum ≤ 10) requires a loop with rejection sampling that could confuse future maintainers. A small lookup table (~20 pairs) is simpler, predictable, and auditable.

---

### D-007: Monster and food — emoji rendered in large `<div>` elements

**Decision**: Monster face is a large emoji (`🐲` or `👾`) inside a styled container div with CSS border-radius, background colour, and a visible mouth zone. Food items are emoji chosen from a curated list (🍎🍊🍋🍇🍓🌟⭐🍕🍩🎈). Each draggable item is a `<div>` with a single emoji and touch listeners.

**Rationale**: Zero image assets. Fully offline. Any emoji renders on Android 7+, which is the minimum supported platform. CSS transforms handle the chomp animation (brief scale + border-radius change on the mouth div).
