# Implementation Plan: Number/Letter Tracer Game

**Branch**: `010-number-letter-tracer` | **Date**: 2026-06-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-number-letter-tracer/spec.md`

## Summary

A kid-friendly tracing mini-app for SproutPlay where children ages 3-7 practice fine motor skills by tracing numbers (0-100) and letters (A-Z) with their finger. The game features multiple modes (Single Numbers, Single Letters, Multi-Digit Numbers, Word Building), three difficulty levels (Easy/Medium/Hard) with configurable tolerance and hints, stroke-order guidance with numbered start points, Canvas-based 60fps rendering, TTS pronunciation, and celebration screens. Built using the existing `_template/` structure, following SproutPlay conventions (IIFE singleton, `sound.js`, `Settings` module, Capacitor TTS plugin).

## Technical Context

**Language/Version**: JavaScript (ES6+) — IIFE singleton pattern, matching existing SproutPlay convention
**Primary Dependencies**: 
- Capacitor Core (`@capacitor/core` v8) — existing
- Capacitor Text-to-Speech (`@capacitor-community/text-to-speech`) — existing
- Capacitor Native Audio (`@capacitor-community/native-audio`) — existing for SFX
- HTML5 Canvas API — built-in browser API, no npm package needed
**Storage**: localStorage (existing Settings module) for progress persistence and configuration
**Testing**: Manual testing on Android devices (Samsung Galaxy A-series, Lenovo Tab M series) — matches existing SproutPlay QA process
**Target Platform**: Android 8+ via Capacitor WebView (debug APK)
**Performance Goals**: 60fps canvas rendering during active tracing, <2s load time from hub navigation
**Constraints**: 
- Must follow `_template/` structure exactly (copy folder, rename CSS/JS, register in `registry.js`)
- Canvas rendering is a departure from existing DOM-based mini-apps (paint, memory, abc) — requires path data creation and touch-to-canvas coordinate mapping
- Minimum character size 80px for traceability on small screens
- Must integrate with existing `sound.js` (Web Audio for SFX, TTS for pronunciation)
**Scale/Scope**: 26 letters (A-Z) + 101 numbers (0-100) + ~64 word entries (3-6 letters) with SVG path data for stroke-order tracing

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on SproutPlay Constitution (from `/workspaces/testrepo/.specify/memory/constitution.md`):

- ✅ **Kid-friendly UX**: Large touch targets (min 80px characters), bright colors, no text selection, no zoom, no scroll — matches existing conventions
- ✅ **IIFE modules only**: All code uses Revealing Module pattern (IIFE returning public API) — no ES modules, no imports
- ✅ **Script tag order**: Loads in correct order: `sound.js` → `mini-app-back.js` → `tracer.js`
- ✅ **CSS variables**: Uses `:root` variables from `base.css` for colors, spacing, typography
- ✅ **Graceful degradation**: TTS falls back to Web Audio tones if plugin unavailable
- ✅ **Template compliance**: Follows `_template/` structure exactly — copies to `app/www/tracer/`, registers in `registry.js`
- ⚠️ **Canvas vs DOM**: This is the first mini-app using Canvas rendering (others use DOM elements). Justification: Canvas provides smoother 60fps tracing with real-time glow effects that are difficult with DOM. Existing mini-apps (paint, memory) use DOM — this is a deliberate departure for better UX.

**Complexity Justification** (if needed):
| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Canvas rendering (vs DOM) | Smooth 60fps tracing with real-time glow trail effects, precise touch-to-path collision detection | DOM elements with SVG overlays would require complex event handling and wouldn't render glow trails as smoothly on Android WebView |

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# SproutPlay mini-app structure (following _template/)
app/www/
├── tracer/
│   ├── index.html              # Tracer mini-app entry point (copy from _template)
│   └── css/
│       └── tracer.css          # Tracer-specific styles (create new)
├── css/
│   └── base.css                # Shared styles (existing, imported)
├── js/
│   ├── sound.js                # Shared Sound module (existing, imported)
│   ├── mini-app-back.js        # Back button handler (existing, imported)
│   └── tracer/
│       └── tracer.js           # Tracer game logic (create new, IIFE singleton)
└── registry.js                 # AppRegistry (update: register tracer app)

tests/
└── manual/
    └── testing-checklist.md    # Manual QA checklist for testers
```

**Structure Decision**: Follows existing SproutPlay mini-app pattern exactly:
- Copy `_template/` folder to `app/www/tracer/`
- Rename template CSS → `css/tracer.css`
- Rename template JS → `js/tracer/tracer.js`
- Register in `registry.js` with metadata (id: "tracer", name: "Tracer", icon: "✏️")
- Uses existing `base.css`, `sound.js`, `mini-app-back.js`

## Implementation Phases

### Phase 0: Research & Path Data Creation

**Goal**: Resolve all technical unknowns and create SVG path data for all characters.

**Tasks**:
1. **Research**: Source or create SVG path data for numbers 0-9 and uppercase letters A-Z with stroke-order information
   - **Unknown**: Where to get stroke-order SVG paths? 
   - **Resolution**: Use open-source datasets (e.g., Google's "stroke-order" projects, or create custom paths). Each character needs: `paths` (array of SVG path strings), `strokeOrder` (numbered start points), `boundingBox` (x, y, width, height).
   - **Deliverable**: `js/tracer/paths.js` — IIFE singleton exporting path data for all 107 characters (10 numbers + 26 letters + multi-digit combinations)

2. **Research**: Determine optimal Canvas rendering approach for Android WebView
   - **Unknown**: Will HTML5 Canvas render smoothly at 60fps on target Android devices?
   - **Resolution**: Canvas is well-supported in Chrome/Android WebView. Use `requestAnimationFrame()` for smooth rendering. Test on target devices (Samsung Galaxy A-series, Lenovo Tab M series).
   - **Deliverable**: Canvas rendering module in `tracer.js` with `requestAnimationFrame` loop

3. **Research**: Touch coordinate mapping from touch events to Canvas coordinates
   - **Unknown**: How to map touch events (touchstart, touchmove, touchend) to Canvas drawing coordinates accurately?
   - **Resolution**: Use `getBoundingClientRect()` on the Canvas element to offset touch coordinates. Existing mini-apps (ABC letters) already use this pattern successfully.
   - **Deliverable**: Touch event handlers in `tracer.js` mapping to Canvas coordinates

4. **Research**: TTS pronunciation for numbers and letters
   - **Known**: Capacitor TTS plugin (`@capacitor-community/text-to-speech`) is already installed and used in ABC mini-app
   - **Resolution**: Reuse existing `Sound.speak()` method from `sound.js`. For letters: "A is for Apple! 🍎". For numbers: "fourty-two" (spelled out).
   - **Deliverable**: Integration with existing `Sound.speak()` in `tracer.js`

### Phase 1: Core Implementation

**Goal**: Implement core tracing mechanics, UI, and audio.

**Subtasks**:

1. **Create SVG Path Data Module** (`js/tracer/paths.js`)
   - Export path data for numbers 0-9 (10 characters)
   - Export path data for uppercase letters A-Z (26 characters)
   - Each character: `{ character, paths: ["M...", "L..."], strokeOrder: [1, 2, 3], boundingBox: {x, y, w, h} }`
   - Stroke order follows US preschool teaching conventions
   - **TODO**: Create paths for all 36 base characters (10 numbers + 26 letters)

2. **Create Tracer HTML** (`tracer/index.html`)
   - Copy from `_template/index.html`
   - Replace template content with Canvas element for tracing
   - Add UI controls: mode selector (Numbers/Letters/Multi-Digit/Words), difficulty selector (Easy/Medium/Hard)
   - Add celebration overlay (copy from template)
   - Add back button (copy from template, update IDs to `tracer-back`)
   - **TODO**: Design UI layout for mode/difficulty selectors (dropdowns or buttons)

3. **Create Tracer CSS** (`css/tracer.css`)
   - Copy from `_template/_template.css`
   - Style Canvas element (full-screen, responsive)
   - Style mode/difficulty selectors (large touch targets, min 48dp)
   - Style celebration overlay (copy from template, customize for tracer theme)
   - Use CSS variables from `base.css` for colors, spacing
   - **TODO**: Design visual theme (colors, animations, character styling)

4. **Create Tracer JS** (`js/tracer/tracer.js`) — IIFE Singleton
   - **Init**: Setup Canvas, register touch event handlers, load settings from `Settings` module
   - **Render Loop**: `requestAnimationFrame()` loop that:
     - Clears Canvas
     - Draws dashed character outline (from path data)
     - Draws glow trail following finger position
     - Fills character with color when trace is complete
   - **Touch Handling**: 
     - `touchstart`: Record start position, validate against path data
     - `touchmove`: Draw glow trail, check if touch is "on track" (within tolerance)
     - `touchend`: Validate completion, trigger success/failure state
   - **Path Validation**: Compare touch coordinates against predefined path points with configurable tolerance (20-50%)
   - **Game Modes**: 
     - Single Numbers: Random number 0-9, trace once
     - Single Letters: Random letter A-Z, trace once
     - Multi-Digit: 2-3 digit numbers, multiple slots (left to right)
     - Word Mode: 3-6 letter words, multiple letter slots (left to right)
   - **Difficulty System**: 
     - Easy: 50% tolerance, 3 per set, hints always visible
     - Medium: 35% tolerance, 5 per set, hints after 1 mistake
     - Hard: 20% tolerance, 8 per set, hints after 3 mistakes
   - **Audio Integration**: 
     - Use `Sound.init()` on first touch
     - Play tracing SFX (soft "whoosh" during trace)
     - Play success SFX ("ding!") when character completes
     - Call `Sound.speak()` for letter/number pronunciation
   - **Progress Tracking**: Save to localStorage via `Settings` module (current mode, difficulty, progress)
   - **Celebration**: Show overlay with animations, sounds, "Play Again" and "Back to Hub" buttons
   - **TODO**: Implement all game logic, integrate with existing modules

5. **Register App in Registry** (`js/registry.js`)
   - Add tracer app entry: `{ id: "tracer", name: "Tracer", icon: "✏️", path: "tracer/index.html" }`
   - **TODO**: Find existing `registry.js`, add entry in alphabetical order

6. **Update Settings Module** (optional, if needed)
   - Add tracer-specific settings: `defaultMode`, `defaultDifficulty`, `setSize`
   - Persist via existing `Settings` module (localStorage key: `sproutplay_settings`)
   - **TODO**: Check if existing Settings module supports custom mini-app settings

### Phase 2: Integration & Testing

**Goal**: Integrate with hub, test on devices, polish UI.

**Subtasks**:

1. **Sync Capacitor & Build APK**
   - Run `npx cap sync android`
   - Run `./build.sh` to produce debug APK
   - **TODO**: Verify build succeeds, APK generates correctly

2. **Install & Test on Android Device**
   - Run `adb install app/android/app/build/outputs/apk/debug/app-debug.apk`
   - Test all game modes (Numbers, Letters, Multi-Digit, Words)
   - Test all difficulty levels (Easy, Medium, Hard)
   - Test on target devices (Samsung Galaxy A-series, Lenovo Tab M series)
   - **TODO**: Create manual testing checklist (see `tests/manual/testing-checklist.md`)

3. **Performance Testing**
   - Verify 60fps canvas rendering on target devices
   - Verify <2s load time from hub navigation
   - Verify TTS plays within 300ms of character completion
   - **TODO**: Use Android Studio Profiler or Chrome DevTools to measure performance

4. **Responsive Scaling Testing**
   - Test on screens from 5" phones to 10" tablets
   - Verify characters scale from 80px to 200px width
   - Verify no clipping or off-screen rendering
   - **TODO**: Test on multiple device sizes

5. **Hub Integration**
   - Verify tracer app appears in hub grid (via `registry.js` registration)
   - Verify navigation from hub → tracer → back to hub works correctly
   - Verify back button (`mini-app-back.js`) returns to hub
   - **TODO**: Test hub navigation flow

6. **Polish & QA**
   - Test edge cases (rapid touches, device rotation, small screens)
   - Verify celebration animations and sounds
   - Verify progress persistence across app restarts
   - Verify settings persist via localStorage
   - **TODO**: Run through full testing checklist

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Canvas rendering (vs DOM) | Smooth 60fps tracing with real-time glow trail effects, precise touch-to-path collision detection | DOM elements with SVG overlays would require complex event handling and wouldn't render glow trails as smoothly on Android WebView. Existing mini-apps (paint, memory, abc) use DOM successfully, but Canvas is necessary for real-time stroke rendering with glow effects. |

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Canvas rendering performance on low-end Android devices | Medium | Test early on target devices; fallback to DOM if Canvas is too slow |
| SVG path data creation for 107 characters (numbers + letters + multi-digit) | High | Start with base 36 characters (0-9, A-Z); generate multi-digit by combining base paths |
| TTS pronunciation accuracy for numbers/letters | Low | Reuse existing `Sound.speak()` from ABC mini-app (proven working) |
| Stroke-order data accuracy for preschool teaching | Medium | Use established stroke-order datasets; validate with early childhood education resources |
| Touch coordinate mapping accuracy on Android WebView | Medium | Use existing pattern from ABC mini-app (proven working); test on target devices |

## Assumptions

- The existing `_template/` folder structure will be used as the foundation (copy to `app/www/tracer/`, create `css/tracer.css`, create `js/tracer/tracer.js`)
- Canvas-based rendering is acceptable for this mini-app (existing mini-apps use DOM elements; Canvas provides smoother tracing but is a different approach)
- The Capacitor TTS plugin (`@capacitor-community/text-to-speech`) is already installed and configured for word/letter pronunciation
- SVG path data for numbers 0-9 and letters A-Z can be sourced or created (open-source stroke-order datasets exist for this)
- The existing SproutPlay infrastructure is available: `sound.js` (Web Audio + TTS + NativeAudio), `Settings` module (localStorage persistence), `Router` (hub navigation)
- The game will be distributed as part of the existing SproutPlay debug APK — no separate distribution needed
- Children using this mini-app are ages 3-7, with developing fine motor skills — touch targets and character sizes must be large enough to trace successfully
