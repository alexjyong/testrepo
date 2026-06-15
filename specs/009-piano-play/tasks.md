---

description: "Task list for Piano Play mini-app implementation"
---

# Tasks: Piano Play

**Input**: Design documents from `/specs/009-piano-play/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hub-integration.md, quickstart.md

**Tests**: Not requested — manual testing via quickstart.md scenarios only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Mini-app source: `app/www/piano/`, `app/www/css/`, `app/www/js/piano/`
- Shared assets: `app/www/js/sound.js`, `app/www/js/mini-app-back.js`, `app/www/css/base.css`
- Registry: `app/www/js/registry.js`
- Template: `app/www/_template/` — copy structure to `piano/` as starting point
- Documentation: `specs/009-piano-play/`, `README.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Copy the `_template/` folder structure and adapt it for the piano mini-app.

- [x] T001 Copy `app/www/_template/index.html` to `app/www/piano/index.html` — rename all `_template`/`myapp` identifiers to `piano`, update title to "SproutPlay - Piano Play", change CSS link from `_template.css` to `piano.css`, change JS src from `_template/_template.js` to `piano/piano.js`, remove celebration overlay (not needed for free-play piano), add keyboard container `<div id="piano-keyboard" class="piano-keyboard">` and portrait warning overlay `<div id="portrait-warning" class="portrait-warning">`, remove TODO comments
- [x] T002 Copy `app/www/_template/js/_template.js` to `app/www/js/piano/piano.js` — rename IIFE from `MyApp` to `Piano`, update header comments, remove celebration/game-loop functions (startGame, endGame), remove playAgainBtn/celebrationBack wiring, keep backBtn/goToHub pattern, add Piano-specific DOM refs and state variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story can be tested.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Register piano in `app/www/js/registry.js` — add `register({ id: 'piano', name: 'Piano Play', icon: '🎹', description: 'Tap the keys and make music!', backgroundColor: 'color-4', placeholder: false, path: 'piano/index.html' })` to `AppRegistry.init()`
- [x] T004 Create `app/www/css/piano.css` — CSS variables for piano colors (`--piano-white-key`, `--piano-white-key-active`, `--piano-black-key`, `--piano-black-key-active`), forced landscape rotation via `@media (orientation: portrait)` (rotates `.app-container` 90° with CSS transform, no warning overlay), keyboard container with `touch-action: none` and flex layout, base key styles (white keys as flex items, black keys positioned with absolute + `left: calc()`), header and back button overrides (position:static for flex header), color-key mapping, key press animation

**Checkpoint**: Foundation ready — the piano can be launched from the hub, displays a keyboard layout (even if non-functional), and can navigate back. User story implementation can now begin.

---

## Phase 3: User Story 1 - Free Play Piano (Priority: P1) 🎯 MVP

**Goal**: A child can open the piano app and immediately tap keys to hear distinct musical notes with no perceptible delay. Every tap produces a sound — no wrong answers, no instructions needed.

**Independent Test**: A child can open the app from the hub, tap multiple keys across the keyboard, hear distinct notes play back (ascending C→B), and navigate back to the hub — with no other features required.

### Implementation for User Story 1

- [x] T006 [P] [US1] Define piano key data in `app/www/js/piano/piano.js` — dynamic key range computed from screen width (min 48dp per white key, up to 3 octaves / 22 white keys); starts from C4; follows data-model.md Key entity
- [x] T007 [US1] Implement `PianoAudio` module in `app/www/js/piano/piano.js` — IIFE singleton with `init()` (creates AudioContext), `playNote(frequency)` (creates oscillator+gain, triangle wave, exponential decay envelope), `stopNote(oscillator, gainNode)` (gain ramp to 0 over 300ms, stop after 350ms), active notes tracking via `Map`; follows research.md polyphony decision
- [x] T008 [US1] Implement keyboard rendering in `app/www/js/piano/piano.js` — function that builds DOM for N white keys + M black keys based on screen width; black keys positioned dynamically via JS `style.left` calc; calls from `Piano.init()`
- [x] T009 [US1] Wire touch handling in `app/www/js/piano/piano.js` — attach `touchstart`/`touchend` listeners to each key element; `touchstart` calls `PianoAudio.playNote()` and adds active CSS class; `touchend` calls `PianoAudio.stopNote()` and removes active class; `preventDefault()` on keyboard container
- [x] T010 [US1] Wire back button in `app/www/piano/index.html` — `#piano-back` button calls `miniAppBack.goBack()` on click; matches existing pattern in `memory/index.html`
- [x] T011 [US1] Use Capacitor Screen Orientation plugin to lock landscape orientation — `@capawesome/capacitor-screen-orientation` v8.0.1, called in `Piano.init()` with platform check; replaces CSS transform approach

**Checkpoint**: At this point, User Story 1 is fully functional. A child can launch the piano from the hub, tap keys and hear notes, play chords, and navigate back. Test against quickstart.md Tests 1–7.

---

## Phase 4: User Story 2 - Visual Key Feedback (Priority: P2)

**Goal**: Each key visually responds on press (color/brightness change) and reverts on release, giving immediate visual confirmation alongside the sound.

**Independent Test**: A child can tap keys and see each key visually highlight on press, then return to its normal state on release — verifiable by observation without audio.

### Implementation for User Story 2

- [x] T012 [P] [US2] Add key active/pressed styles in `app/www/css/piano.css` — `.key.active` class with brighter color, subtle scale transform (`transform: scale(0.97)`), and box-shadow change; applies to both white and black keys; uses CSS variables `--piano-white-key-active` and `--piano-black-key-active`
- [x] T013 [US2] Add key press animation in `app/www/css/piano.css` — `@keyframes keyPress` with 100ms scale-down + color change, applied on `:active` pseudo-class for instant visual feedback; matches kid-friendly design with large, obvious response
- [x] T014 [US2] Ensure visual feedback is independent of audio state in `app/www/js/piano/piano.js` — active class toggling on touchstart/touchend happens regardless of `Settings.isSoundEnabled()`; visual feedback always works even when sound is off

**Checkpoint**: User Stories 1 AND 2 are complete. Keys provide both audio and visual feedback. Test against quickstart.md Tests 1–5 and 9.

---

## Phase 5: User Story 3 - Note Labels for Early Learners (Priority: P3)

**Goal**: Letter names (C, D, E…) are optionally displayable on keys for children learning the alphabet. Controlled by a toggle — disabled by default to keep the interface clean for free play.

**Independent Test**: With labels enabled, a child can see letter names on each key and associate them with the sounds produced. With labels disabled, no text appears on keys.

### Implementation for User Story 3

- [x] T015 [P] [US3] Add note label text elements in keyboard rendering in `app/www/js/piano/piano.js` — each key element contains a `<span class="key-label">` with the letter name (e.g., "C", "C#", "D"); label is hidden by default via CSS (`display: none`); shown only when a `data-labels="true"` attribute is set on the keyboard container
- [x] T016 [US3] Add label toggle CSS in `app/www/css/piano.css` — `.key-label { display: none; }` by default; `.piano-keyboard[data-labels="true"] .key-label { display: flex; }` when labels enabled; label text uses `--font-size-base`, high-contrast color, centered in key; `.label-toggle-btn` styled as a header button
- [x] T017 [US3] Add label toggle logic in `app/www/js/piano/piano.js` — header button `#label-toggle` toggles labels on/off; persists state to `localStorage('piano_showLabels')`; icon switches between 🔤 (hidden) and 🏷️ (visible)

**Checkpoint**: All user stories are complete. Piano supports free play, visual feedback, and optional note labels. Test against quickstart.md Tests 1–10.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production quality.

- [x] T018 [P] Color-key mapping in `app/www/css/piano.css` — assign distinct bright colors to each white key (following the existing color palette: `--color-primary`, `--color-accent-1`, `--color-secondary`, etc.) so each key is visually unique and kid-friendly
- [x] T019 [P] Volume level tuning in `app/www/js/piano/piano.js` — set gain to 0.5 (balanced volume, not too loud for children's ears); verify triangle wave frequency response is pleasant across the full C4–B4 range
- [X] T020 Update `README.md` — add Piano Play to the list of implemented mini-apps with 🎹 icon and brief description
- [X] T021 Build and smoke test — run `./build.sh`, install APK on device, execute quickstart.md Tests 1–5 to verify MVP works end-to-end
- [X] T022 Clean up — remove any console.log debug statements, verify no JavaScript errors in browser DevTools, confirm touch targets meet 48dp minimum

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - US1 (P1) must complete before US2 and US3 (US2 builds on US1's keyboard, US3 builds on US1+US2)
  - Stories are sequential due to tight coupling (same files, layered features)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — delivers the MVP
- **User Story 2 (P2)**: Depends on US1 — adds visual feedback to the working keyboard
- **User Story 3 (P3)**: Depends on US1 — adds labels to the working keyboard

### Within Each User Story

- Models/data before rendering
- Rendering before touch handling
- Touch handling before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002 (Setup) — can run in parallel (different directories)
- T006 (key data), T012 (key styles), T015 (label elements) — different files, can run in parallel when their phase is active
- T018 (color mapping), T019 (volume tuning) — different files, can run in parallel in Polish phase

---

## Parallel Example: User Story 1

```bash
# Launch T006 (key data) and T007 (audio module) together — different sections of piano.js
Task: "Define piano key data in app/www/js/piano/piano.js"
Task: "Implement PianoAudio module in app/www/js/piano/piano.js"

# After T006+T007 complete, launch T008 (keyboard rendering) and T010 (back button)
Task: "Implement keyboard rendering in app/www/js/piano/piano.js"
Task: "Wire back button in app/www/piano/index.html"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently against quickstart.md Tests 1–7
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Polish phase last

### Notes

- T003 (index.html) and T005 (piano.css) in Foundational can start building the page structure while T004 (registry) is done
- The piano is registered in registry.js (T004) early so it can be launched from the hub for iterative testing as each phase completes
- Each phase produces a working, testable increment — no need to wait for all phases
