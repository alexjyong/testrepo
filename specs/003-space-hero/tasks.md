# Tasks: Star Bounce (Space Hero)

**Input**: `/specs/003-space-hero/` — spec.md + plan.md
**Branch**: `003-space-hero`

> Tasks marked `[x]` are already implemented in `app/www/js/space/space.js` as of branch audit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Foundation & Entry Point)

**Purpose**: Register the app and create the file scaffold.

- [x] T001 Enable 'space' app in `app/www/js/registry.js`
- [x] T002 Create folder `app/www/space/` and `app/www/js/space/`
- [x] T003 [P] Create `app/www/space/index.html` with canvas, overlays, and UI containers
- [x] T004 [P] Create `app/www/css/space.css` with space theme (dark purple/black, neon colors)

**Checkpoint**: App appears in hub and loads a blank canvas page.

---

## Phase 2: Foundational (Core Engine)

**Purpose**: The game loop and physics that all gameplay features depend on.

**⚠️ CRITICAL**: No story work can begin until this phase is complete.

- [x] T005 Initialize canvas, sizing, and `requestAnimationFrame` game loop in `app/www/js/space/space.js`
- [x] T006 Implement delta-time normalization (frame-rate independent speed) in `app/www/js/space/space.js`
- [x] T007 Implement paddle movement via touch events (with mouse fallback) in `app/www/js/space/space.js`
- [x] T008 Implement ball physics — constant velocity, wall/paddle bounce in `app/www/js/space/space.js`
- [x] T009 Implement block grid generation (standard / strong / powerup types) in `app/www/js/space/space.js`
- [x] T010 Implement block collision detection (AABB) in `app/www/js/space/space.js`
- [x] T011 Implement score tracking and score display on canvas in `app/www/js/space/space.js`
- [x] T012 Implement ball launch on first tap (ball starts attached to paddle) in `app/www/js/space/space.js`

**Checkpoint**: A full playable level — paddle, ball, blocks, scoring. No bumpers or power-ups yet.

---

## Phase 3: User Story 1 — Hearts System (Priority: P1) 🎯

**Goal**: Player has 3 hearts at the bottom; losing all causes game over.

**Independent Test**: Miss the paddle 3 times with no hearts remaining — game over overlay appears with score and Play Again button.

- [x] T013 [US1] Implement 3 heart bars — render and track `heartsActive` in `app/www/js/space/space.js`
- [x] T014 [US1] Implement heart hit: ball bounces up, heart breaks (decrement `heartsActive`) in `app/www/js/space/space.js`
- [x] T014b [US1] Add heart-break visual: brief flash/opacity fade on the heart bar that just broke in `app/www/js/space/space.js`
- [x] T015 [US1] Update hearts UI on change via `updateHeartsUI()` in `app/www/js/space/space.js`
- [x] T016 [US1] Implement game over condition (all hearts gone + ball falls) in `app/www/js/space/space.js`
- [x] T017 [US1] Implement game over overlay (show score, Play Again, Back to Hub) in `app/www/space/index.html` + `app/www/js/space/space.js`
- [x] T018 [US1] Wire "Play Again" to `resetGame()` and "Back to Hub" to `../index.html` in `app/www/js/space/space.js`

**Checkpoint**: Full hearts system functional end-to-end.

---

## Phase 4: User Story 2 — Power-ups & Win Condition (Priority: P2)

**Goal**: Power-up blocks drop Repair Stars; clearing all blocks triggers celebration.

**Independent Test**: Break a powerup block → star falls → catch it → bumper restores. Clear all blocks → celebration overlay appears.

- [x] T019 [US2] Implement Repair Star drop from powerup blocks in `app/www/js/space/space.js`
- [x] T020 [US2] Implement Repair Star falling animation and paddle catch logic in `app/www/js/space/space.js`
- [x] T021 [US2] Implement heart restoration on Repair Star catch (`heartsActive++`, max 3) in `app/www/js/space/space.js`
- [x] T022 [US2] Implement win condition (`checkWin`) — all blocks cleared → celebration in `app/www/js/space/space.js`
- [x] T023 [US2] Implement celebration overlay with Play Again / Back to Hub in `app/www/space/index.html` + `app/www/js/space/space.js`
- [x] T024 [US2] Implement Giant Ball power-up type — oversized ball (2× radius) that persists until the player loses a heart (NOT time-limited; Constitution II prohibits timed mechanics) in `app/www/js/space/space.js`

**Checkpoint**: Power-up system and win state both work.

---

## Phase 5: User Story 3 — Audio (Priority: P3)

**Goal**: All game events have matching sound effects via `Sound.js`.

**Independent Test**: Paddle hit, block hit, bumper hit, game over, repair star catch, and win all produce distinct tones.

- [x] T025 [P] [US3] Paddle hit → mid-range "boing" `Sound.tone()` in `app/www/js/space/space.js`
- [x] T026 [P] [US3] Block hit → high-pitched "pop" `Sound.tone()` in `app/www/js/space/space.js`
- [x] T027 [P] [US3] Heart hit → lower "thump" `Sound.tone()` in `app/www/js/space/space.js`
- [x] T028 [P] [US3] Game over → descending tone `Sound.tone()` in `app/www/js/space/space.js`
- [x] T029 [P] [US3] Repair Star catch → bright tone `Sound.tone()` in `app/www/js/space/space.js`
- [x] T030 [P] [US3] Win / celebration → `Sound.celebrate()` in `app/www/js/space/space.js`

**Checkpoint**: Every game event has audio feedback.

---

## Phase 6: User Story 4 — Visual Polish (Priority: P4)

**Goal**: Space theme visuals — twinkling star background, block pop effects, strong-block crack indicator.

**Independent Test**: Background has animated twinkling stars; breaking a block shows a brief particle burst; strong blocks visually show a cracked state after first hit.

- [x] T031 [US4] Add twinkling star background (canvas-rendered, animated) in `app/www/js/space/space.js`
- [x] T032 [US4] Add block "pop" particle burst on destroy in `app/www/js/space/space.js`
- [x] T033 [US4] Render strong blocks with distinct color and draw crack overlay on first hit in `app/www/js/space/space.js`
- [x] T034 [P] [US4] Add Repair Star visual distinction (glowing/spinning star shape) in `app/www/js/space/space.js`

**Checkpoint**: Game looks polished — space theme is cohesive and block destruction feels satisfying.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T035 Verify touch responsiveness and paddle feel on a real Android device
- [ ] T036 Verify "Play Again" and "Back to Hub" flows from both game over and celebration overlays
- [ ] T037 Confirm game speed feels right for ages 3–7 on both 60Hz and 120Hz devices (acceptance: ball speed ≤ 250px/s at default; visually trackable by a 3-year-old)
- [x] T038 [P] Confirm all `Sound.tone()` calls have non-null guard (already present; verify no regressions)
- [ ] T039 Manually verify all UI buttons (Start, Back to Hub, Play Again, celebration back) meet 48dp touch target minimum on device — **constitution quality gate**
- [ ] T040 Run `./build.sh` from repo root and confirm APK installs and launches cleanly — **constitution quality gate**

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: Scaffold must exist before engine code
- **Phase 2 → Phases 3–6**: Core engine blocks all stories
- **Phases 3–6**: Can proceed in any order after Phase 2; stories are independent
- **Phase 7**: After desired stories are complete

---

## Current Status Summary

| Phase | Status |
|-------|--------|
| Phase 1 — Setup | ✅ Complete |
| Phase 2 — Core Engine | ✅ Complete |
| Phase 3 — Hearts (US1) | ✅ Complete |
| Phase 4 — Power-ups & Win (US2) | ✅ Complete |
| Phase 5 — Audio (US3) | ✅ Complete |
| Phase 6 — Visual Polish (US4) | ✅ Complete |
| Phase 7 — QA / Polish | 🔴 Not started |

**Remaining work**: T035–T037, T039–T040 (5 tasks — all manual QA on device)
