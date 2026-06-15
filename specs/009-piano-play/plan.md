# Implementation Plan: Piano Play

**Branch**: `009-piano-play` | **Date**: 2026-06-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-piano-play/spec.md`

## Summary

A landscape-mode interactive piano mini-app for children ages 3–5. The app presents a full octave (C4–B4) of piano keys in horizontal landscape layout. Children tap keys to hear synthesized musical notes via the Web Audio API — no audio files needed. Keys provide visual feedback on press (color/brightness change). The app integrates with the SproutPlay hub as a launchable mini-app entry card and navigates back via the standard back mechanism. Note labels (letter names) are optionally displayable.

## Technical Context

**Language/Version**: JavaScript (ES6+) — IIFE singleton pattern, matching existing SproutPlay convention
**Primary Dependencies**: Web Audio API (built-in browser API, no npm packages) — follows FR-008 assumption
**Storage**: N/A (no data persistence required for free-play piano)
**Testing**: Manual testing on Android devices via debug APK, following quickstart.md scenarios
**Target Platform**: Android (Capacitor-wrapped), landscape orientation, touch input only
**Project Type**: Mini-app within a Capacitor children's app hub
**Performance Goals**: Key tap to sound latency under 50ms; handles 3+ simultaneous touches without audio dropout
**Constraints**: Must follow SproutPlay Constitution — vanilla JS only, no frameworks, no audio files, offline-capable, kid-first design (48dp+ touch targets), no data collection
**Scale/Scope**: Single mini-app, one octave (12 keys: 7 white + 5 black), ~300–500 lines of JS, ~200 lines of CSS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Constitution Principle | Compliance | Notes |
|---|---|---|
| I. Simplicity First (YAGNI) | ✅ Compliant | Uses Web Audio API oscillators — zero dependencies, no audio files. Simplest possible piano implementation. |
| II. Kid-First Design | ✅ Compliant | Keys are full-width touch targets (each key ≥ 48dp wide in landscape). No text instructions needed. No time limits. Bright colors from CSS variables. |
| III. Offline-Capable | ✅ Compliant | All audio synthesized locally. No network calls. Works fully offline. |
| IV. Privacy by Default | ✅ Compliant | No data collection, no analytics, no tracking, no accounts. |
| V. Modular Mini-App Architecture | ✅ Compliant | Self-contained HTML/CSS/JS in `piano/` directory. Registered via AppRegistry. Launched via router. |

**Result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/009-piano-play/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── hub-integration.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/www/
├── css/
│   ├── piano.css              # Piano mini-app styles (landscape keyboard, key colors)
├── js/
│   └── piano/
│       └── piano.js           # Piano mini-app logic (Web Audio, touch handling)
├── piano/
│   └── index.html             # Piano mini-app entry page
```

**Structure Decision**: Follows the existing SproutPlay mini-app pattern exactly (see `memory/`, `paint/`, `abc/`, `monster/`, `space/`). Piano gets its own directory with self-contained HTML, CSS loaded from shared `css/` folder, and JS loaded from shared `js/` folder. No new top-level directories needed.

## Phase 0: Research

### Research Findings

**Decision 1: Web Audio API oscillator type for piano tones**
- **Chosen**: `triangle` wave with exponential decay envelope — closest sine-like waveform available in Web Audio API that has a warm, musical quality suitable for children
- **Rationale**: `sine` is too pure/flat for piano-like tones. `triangle` has harmonics that give warmth without the harshness of `square` or `sawtooth`. The existing `sound.js` already uses `triangle` for match/celebration sounds, confirming it works well in this project.
- **Alternatives considered**: `sine` (too sterile), `square` (too retro-game), `sawtooth` (too harsh). Custom additive synthesis (combining multiple oscillators) was rejected as over-engineering for a free-play piano.

**Decision 2: Audio context management — shared vs. independent**
- **Chosen**: Independent `AudioContext` created within the piano mini-app, separate from the global `Sound` module's context
- **Rationale**: The piano needs to play multiple simultaneous notes (chords, rapid tapping) with independent gain envelopes. The shared `Sound` module's `tone()` function creates short-lived oscillators that are not designed for sustained note playback. An independent context gives the piano full control over note-on/note-off timing, polyphony, and gain shaping without interfering with other mini-apps' audio.
- **Alternatives considered**: Reusing `Sound.tone()` (rejected — no sustain control, no chord support), creating a `PianoSound` module that wraps `Sound.init()` (rejected — unnecessary coupling).

**Decision 3: Key layout — CSS Grid vs. Flexbox vs. absolute positioning**
- **Chosen**: CSS Grid for white keys (equal-width columns), with black keys positioned using negative margins and percentage offsets within the grid flow
- **Rationale**: Grid gives clean equal-width white keys. Black keys sit between white keys and can be positioned with `grid-column` spanning and negative margins — a well-established CSS piano pattern. This approach is responsive and works across screen widths without JavaScript layout calculations.
- **Alternatives considered**: Flexbox (black key positioning is awkward), absolute positioning (requires JS recalculation on resize/orientation change), pure percentage widths (black key alignment is imprecise).

**Decision 4: Touch handling — touchstart vs. pointer events**
- **Chosen**: `touchstart`/`touchend` with `preventDefault()` for immediate response, plus `touch-action: none` on the keyboard container
- **Rationale**: `touchstart` fires immediately on contact (faster than `click`). `preventDefault()` prevents browser zoom/scroll behaviors. `touch-action: none` in CSS is the modern approach to disable all touch gestures on the piano area. This matches the pattern used in existing mini-apps (memory, paint).
- **Alternatives considered**: Pointer events (good for cross-platform but slightly more complex for multi-touch), `mousedown`/`mouseup` (no touch support on mobile).

**Decision 5: Note frequencies — equal temperament C4–B4**
- **Chosen**: Standard 12-tone equal temperament frequencies for C4 through B4 (C4=261.63, C#4=277.18, D4=293.66, D#4=311.13, E4=329.63, F4=349.23, F#4=369.99, G4=392.00, G#4=415.30, A4=440.00, A#4=466.16, B4=493.88)
- **Rationale**: Standard frequencies ensure the piano sounds correct when played with other instruments or reference tones. One octave is sufficient for free-play exploration by young children.
- **Alternatives considered**: Two octaves (rejected — keys would be too narrow on small screens, violating 48dp touch target requirement).

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` (generated below).

### Interface Contracts

See `contracts/hub-integration.md` (generated below).

### Quickstart

See `quickstart.md` (generated below).

## Complexity Tracking

No complexity violations. The implementation stays within Constitution principles — vanilla JS, Web Audio API only, no frameworks, no build tools.

## Phase 2: Implementation Tasks (outline for `/speckit.tasks`)

The task generation phase will break this down into executable tasks:

1. **Scaffold**: Create `piano/index.html`, `css/piano.css`, `js/piano/piano.js`
2. **Hub integration**: Register piano in `AppRegistry`, add entry card to hub grid
3. **Keyboard layout**: Build responsive piano keyboard — dynamic key count computed from screen width (≥48dp per white key, 1–3 octaves), flex layout for white keys, absolute-positioned black keys with JS-calculated positions
4. **Audio engine**: Implement Web Audio API note playback with triangle wave + decay envelope
5. **Touch handling**: Wire up touchstart/touchend for key press/release with visual feedback
6. **Visual feedback**: Key press animation (color change + subtle scale)
7. **Landscape enforcement**: CSS `@media` rules for landscape-first layout, forced rotation via CSS transform in portrait mode (no warning overlay)
8. **Multi-touch support**: Ensure simultaneous chord playback works
9. **Note labels (P3)**: Optional letter name display on keys, toggle in settings
10. **Back navigation**: Wire up back button to return to hub
11. **Polish & QA**: Color consistency, touch target sizes, latency testing
