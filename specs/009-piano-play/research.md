# Research: Piano Play

**Feature**: 009-piano-play
**Date**: 2026-06-11
**Status**: Complete — all NEEDS CLARIFICATION resolved

## Research Items

### 1. Web Audio API oscillator type for piano tones

**Question**: Which oscillator waveform best approximates a piano tone suitable for children ages 3–5?

**Finding**: The Web Audio API provides four oscillator types: `sine`, `square`, `triangle`, and `sawtooth`. For a children's piano:
- `sine` — pure tone, no harmonics. Sounds like a tuning fork. Too sterile for piano.
- `triangle` — soft harmonics (odd harmonics at 1/n² amplitude). Warm, flute-like quality. Best balance of musicality and gentleness.
- `square` — harsh odd harmonics (1/n amplitude). Retro game sound. Too aggressive.
- `sawtooth` — all harmonics (1/n amplitude). Bright, buzzy. Too harsh for young children.

**Decision**: `triangle` wave with exponential decay envelope (attack time ~5ms, decay to sustain ~200ms, release ~300ms). This matches the waveform already used successfully in `sound.js` for match/celebration sounds.

**Reference**: Existing `Sound.tone()` in `app/www/js/sound.js` uses configurable waveform type. Piano will use its own AudioContext for polyphony but can reference the same gain envelope pattern.

### 2. Polyphony and note management

**Question**: How to handle simultaneous notes (chords, rapid tapping) without audio dropout?

**Finding**: Each note requires its own OscillatorNode + GainNode pair. The Web Audio API supports hundreds of simultaneous oscillators on modern Android devices. Key pattern:
- On `touchstart`: create oscillator → connect to gain → connect to destination → start → store reference
- On `touchend`: ramp gain to 0 over 300ms → stop oscillator after 350ms → disconnect → remove from tracking map

**Decision**: Use a `Map<element, {oscillator, gain}>` to track active notes per key element. Each key gets independent oscillator/gain pairs. No shared oscillators. This ensures chords and rapid tapping work correctly.

### 3. CSS piano keyboard layout

**Question**: Best CSS approach for a responsive piano keyboard with white and black keys?

**Finding**: The established pattern is CSS Grid for white keys + negative margin positioning for black keys:
- White keys: `grid-template-columns: repeat(7, 1fr)` — equal width
- Black keys: positioned with `grid-column: N` spanning 2 white-key columns, with negative left margin to center on the grid line between white keys
- Black key width: ~60% of white key width
- Black key height: ~60% of white key height (shorter, raised above white keys)

**Decision**: CSS Grid approach. No JavaScript layout calculations needed. Responsive across all screen sizes. Black keys use `z-index: 2` to render above white keys.

**Reference**: Widely used pattern in web piano implementations (e.g., CSS Piano by various authors on CodePen).

### 4. Touch handling for immediate response

**Question**: `touchstart` vs `pointerdown` vs `click` for lowest-latency key response?

**Finding**:
- `touchstart` — fires ~100ms before `click`, no delay. Requires `preventDefault()` to prevent scroll/zoom. Best for immediate response.
- `pointerdown` — unified pointer events, works for touch + mouse. Slight delay on touch devices (~50ms). Good cross-platform but not fastest.
- `click` — fires after touch release on mobile (~300ms delay). Unacceptable for piano.

**Decision**: `touchstart`/`touchend` with `preventDefault()` on the keyboard container. Add `touch-action: none` in CSS to disable all touch gestures on the piano area. This is the fastest approach and matches patterns in existing mini-apps (memory, paint).

### 5. Orientation handling

**Question**: How to handle portrait vs landscape orientation?

**Finding**: Piano keyboards are inherently landscape. Options:
- Force landscape via CSS `@media (orientation: portrait)` warning screen
- Auto-rotate via `screen.orientation.lock('landscape-primary')` (requires user gesture, Capacitor Screen Orientation plugin)
- Force landscape via CSS transform — rotate the entire container 90° in portrait mode

**Decision**: Force landscape via CSS `@media (orientation: portrait)` — rotate `.app-container` 90° with a CSS transform so the keyboard fills the screen in landscape orientation regardless of device position. No warning overlay, no plugin needed. This is simpler and more kid-friendly than asking the child to rotate.

### 6. Note frequencies

**Question**: Which notes to include? One octave or two?

**Finding**:
- Fixed key count (12 keys) wastes screen real estate on tablets and risks violating 48dp minimum on narrow phones.
- Dynamic key count: compute how many white keys fit at ≥48dp each, starting from C4 upward.

**Decision**: Dynamic key range starting from C4. Compute `maxWhiteKeys = floor(screenWidth / 48)`, cap at 22 white keys (3 octaves). On an S22+ (~800px landscape) → ~16 white keys (just over one octave). On a 10" tablet (~1600px) → 22 white keys (3 octaves). This maximizes screen usage while respecting the Constitution's 48dp touch target rule.

## Unresolved Items

None. All technical decisions have been made.
