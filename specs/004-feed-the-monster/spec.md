# Feature Specification: Feed the Monster Math Game

**Feature Branch**: `004-feed-the-monster`
**Created**: 2026-05-03
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Count to the Target (Priority: P1)

A child (ages 3–6) sees a goofy cartoon monster holding a sign with a number on it (e.g. "4"). Fruit or star items sit at the bottom of the screen. The child drags items one at a time into the monster's mouth. Each item triggers a chomp animation and an audio cue. A counter below the monster's mouth shows how many have been fed. When the count exactly matches the sign, the monster does a happy dance and a celebration screen appears.

**Why this priority**: Core game loop. Everything else builds on this interaction.

**Independent Test**: Can be fully tested by launching the mini-app with Level 1 active and dragging items to reach the displayed number — delivers the complete learning experience for the youngest age group.

**Acceptance Scenarios**:

1. **Given** the game loads, **When** the child views the screen, **Then** a monster with a number sign (1–5) and draggable items are visible, and TTS reads the target aloud ("Feed me four!")
2. **Given** items are being dragged, **When** one item enters the monster's mouth, **Then** the monster chomps, the counter increments by 1, and an audio chomp plays
3. **Given** the counter matches the target, **When** the last item lands, **Then** a celebration overlay appears with confetti/stars and TTS says "You did it! You fed the monster [N]!"
4. **Given** a new round starts, **When** the celebration is dismissed, **Then** a new random target appears and items are reset

---

### User Story 2 — Overfed Feedback (Priority: P2)

A child drags more items than the target number. The monster's expression changes (belly rub, groan animation), a funny audio cue plays, TTS says "Oops, too many! Let's try again!", and the counter resets to zero so the child can try once more with the same target.

**Why this priority**: Critical to the learning loop — the overfed path teaches self-correction and counting discipline without shaming the child.

**Independent Test**: Drag items past the target count; verify reset behavior and friendly feedback are correct without impacting P1 flow.

**Acceptance Scenarios**:

1. **Given** the counter is at the target minus one, **When** the child drags one more item (reaching target), **Then** celebration triggers (not overfed path)
2. **Given** the counter equals the target, **When** the child drags one additional item, **Then** overfed animation plays, TTS says the "too many" message, and the counter resets to 0
3. **Given** the overfed reset occurs, **When** the reset completes, **Then** the same target number is still shown on the sign and all item slots are refilled

---

### User Story 3 — Difficulty Progression (Priority: P3)

The game automatically advances through three difficulty levels as the child succeeds. Level 1 uses targets 1–5; Level 2 uses targets 1–10; Level 3 presents simple addition problems ("3 + 2 = ?") where the child must feed the answer total (5). A level indicator is visible on screen. Progress is persisted so a returning child resumes at their achieved level.

**Why this priority**: Extends the game's life across the full 3–7 age range. Levels 1 and 2 are pure counting; Level 3 introduces early arithmetic.

**Independent Test**: Complete 5 consecutive rounds at Level 1; verify Level 2 unlocks automatically. Separately, start the app for the first time and verify it begins at Level 1.

**Acceptance Scenarios**:

1. **Given** a child completes 5 consecutive correct rounds at their current level, **When** the 5th celebration finishes, **Then** the game announces the level-up ("Level up! You're amazing!") and the next level begins
2. **Given** the child is on Level 3, **When** a round starts, **Then** the sign shows an addition expression (e.g. "3 + 2") and TTS reads "Three plus two — feed me five!"
3. **Given** the app is closed and reopened, **When** the game loads, **Then** it resumes at the level the child had last reached

---

### Edge Cases

- What happens if the child taps or drags very rapidly in succession? (Items should queue or debounce so the counter never skips)
- What happens if TTS is unavailable? (Chomp/celebrate SFX still play; game remains fully playable without audio)
- What happens if the child never drags anything? (No timeout; game waits indefinitely — no penalty for slow interaction)
- What happens at Level 3 if the addition answer is 0 or negative? (Addition pairs always produce answers ≥ 2; problem generator must enforce this)
- What if the sound effects toggle is off in Settings? (All audio suppressed, visuals carry the full experience)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST display a cartoon monster character holding a visible number sign indicating the current target count
- **FR-002**: The game MUST display a set of draggable item icons (fruit or stars) at the bottom of the screen
- **FR-003**: Dragging an item into the monster's mouth area MUST trigger a chomp animation on the monster and increment the on-screen counter by 1
- **FR-004**: When the counter exactly matches the target, the game MUST display a celebration overlay and play a celebration sound
- **FR-005**: When the counter exceeds the target, the game MUST display an "overfed" reaction, play a feedback sound, speak a friendly "too many" message via TTS, and reset the counter to 0
- **FR-006**: The game MUST use TTS to read the target aloud when each new round begins (e.g., "Feed me four!")
- **FR-007**: The game MUST support three difficulty levels: Level 1 (targets 1–5), Level 2 (targets 1–10), Level 3 (addition expressions with answers 2–10)
- **FR-008**: The game MUST automatically advance the child to the next level after 5 consecutive correct rounds at the current level
- **FR-009**: The child's current level MUST be persisted to local storage and restored on next launch
- **FR-010**: All draggable items and interactive targets MUST have touch areas of at least 48×48 dp
- **FR-011**: The game MUST function fully offline with no network dependency
- **FR-012**: The game MUST respect the global Sound Effects setting; if sounds are disabled, all audio is suppressed
- **FR-013**: The game MUST be accessible from the SproutPlay hub via a registered icon entry
- **FR-014**: The monster, items, and UI decorations MUST be built from emoji and CSS — no external image assets required
- **FR-015**: A "Back to Hub" button MUST be present and functional at all times

### Key Entities

- **Round**: A single counting challenge — has a target number, a current count, and a result (success / overfed / in-progress)
- **Level**: Tracks the child's progression (1, 2, or 3), the number of consecutive wins at that level, and the win threshold before advancing
- **DraggableItem**: An emoji icon the child drags to the monster; has a position and a fed/unfed state
- **MonsterState**: The monster's current animation state (idle / chomping / happy / overfed)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 3–7 can complete a full round (drag items to target, receive celebration) without adult assistance after one observed practice round
- **SC-002**: The counter update and chomp animation are perceived as instantaneous — no visible lag between releasing a drag and seeing the counter change
- **SC-003**: The overfed and celebration paths are each triggered correctly 100% of the time (no missed state transitions)
- **SC-004**: A child who closes and reopens the app always resumes at their previously achieved level, never drops back to Level 1 unintentionally
- **SC-005**: The game remains fully playable (all interactions functional) when the device is in airplane mode
- **SC-006**: All tap/drag targets are large enough that 95% of first-attempt touches from a child's finger land on the intended target

## Assumptions

- The mini-app targets Android devices running SproutPlay; no iOS or web-only behavior is assumed
- The drag mechanic follows the same touch event model as `abc.js` (touchstart / touchmove / touchend), using element coordinates for hit detection
- "Emoji + CSS only" means the monster face and food items are Unicode emoji rendered in large font-size elements — no SVG or raster image files
- Level advancement resets after the child reaches Level 3 (no Level 4); the game cycles new random problems within Level 3 indefinitely
- Addition problems at Level 3 use only single-digit addends (1–9) and always produce sums between 2 and 10
- The number of draggable items shown on screen at any time equals the target number (Level 1 & 2) or the sum (Level 3), so the child always has exactly the right count available — they cannot run out of items before reaching the target
- Consecutive win count resets to 0 on any overfed round, not just on app restart
- The celebration overlay auto-dismisses after 3 seconds or on tap, whichever comes first
