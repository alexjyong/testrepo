# Feature Specification: Number/Letter Tracer Game

**Feature Branch**: `010-number-letter-tracer`
**Created**: 2026-06-18
**Status**: Draft
**Input**: User description: "generate a plan for the number tracer game but expand it to be letters as well. i want varying levels, writing out multiple digit letter and words and stuff. keep the spec detailed since we are using a local qwen 3.6 model, and have to hand hold a bit more. be sure to use the app template files in the _template directory!"

## User Scenarios & Testing (mandatory)

### User Story 1 - Beginner Number Tracing (Priority: P1)

**User Journey**: A 3-4 year old child opens the game and sees large, friendly numbers (0-9) with animated dashed outlines. When they touch/drag their finger along the dashed path, a glowing trail follows their finger. If they stay roughly on track, the solid number fills in with color and a cheerful "ding!" sound plays. If they wander too far, the path gently guides them back. After completing 5 numbers, a celebration screen appears with stars and confetti.

**Why this priority**: This is the MVP — tracing single digits is the core mechanic and must work before any complexity is added. It delivers immediate value: a working mini-app that teaches number recognition and fine motor skills.

**Independent Test**: Can be fully tested by tracing numbers 0-9 with varying accuracy levels and verifying: (1) visual feedback during tracing, (2) success/failure states, (3) celebration screen appears after completing target count, (4) sounds play correctly.

**Acceptance Scenarios**:

1. **Given** the child has selected "Numbers" mode, **When** they drag their finger along a dashed number path with reasonable accuracy (within 40% tolerance), **Then** a glowing trail follows their finger and the number fills in with color when complete
2. **Given** the child is tracing a number, **When** they lift their finger before completing the path, **Then** the trail fades and they can try again
3. **Given** the child has successfully traced the target number of numbers (default: 5), **When** the last number completes, **Then** a celebration screen appears with animations and sounds
4. **Given** the child makes many mistakes, **When** they fail 3 numbers in a row, **Then** the game shows a helpful hint (e.g., the path animates automatically as a demo)

---

### User Story 2 - Beginner Letter Tracing (Priority: P1)

**User Journey**: The child selects "Letters" mode and sees uppercase letters A-Z with dashed outlines. They trace each letter with their finger, following the correct stroke order (top to bottom, left to right). The game provides visual cues: small numbered dots show where to start and which direction to move. When they complete the letter, it fills with color and a TTS voice says the letter name ("A is for Apple! 🍎").

**Why this priority**: Letters are equally important as numbers for preschoolers. This user story runs parallel to User Story 1 — both are core tracing mechanics, just with different character sets. Either can be tested independently.

**Independent Test**: Can be fully tested by tracing all 26 uppercase letters, verifying stroke-order hints work, letter sounds play, and visual feedback matches number tracing behavior.

**Acceptance Scenarios**:

1. **Given** the child has selected "Letters" mode, **When** they trace an uppercase letter with reasonable accuracy, **Then** the letter fills with color and a TTS voice says the letter name with a word example
2. **Given** the child is tracing a letter, **When** they start from the wrong position, **Then** a small animated arrow shows them where to begin (without blocking their touch)
3. **Given** the child completes a set of letters (default: 5), **When** the set finishes, **Then** a celebration screen appears with letter-themed animations (e.g., bouncing alphabet blocks)

---

### User Story 3 - Multi-Digit Number Challenges (Priority: P2)

**User Journey**: After mastering single digits, the child progresses to 2-digit and 3-digit numbers. Each digit gets its own tracing slot (e.g., "12" shows two number boxes side-by-side). The child traces each digit left-to-right. The game reads the full number aloud when complete ("twelve!"). Numbers increase in difficulty: start with 10-20, then 21-50, then 51-100.

**Why this priority**: This adds progression and replayability. It builds on the core mechanic but requires multi-slot management and number-reading logic. It's independently testable because you can trace any multi-digit number and verify each slot fills correctly.

**Independent Test**: Can be fully tested by tracing 2-digit and 3-digit numbers, verifying each digit slot fills independently, TTS reads the full number correctly, and difficulty scaling works.

**Acceptance Scenarios**:

1. **Given** the child is in "Multi-Digit" mode, **When** they trace a 2-digit number (e.g., "42"), **Then** each digit slot fills independently as they trace, and the full number is spoken when complete
2. **Given** the child is tracing a multi-digit number, **When** they complete all digit slots, **Then** the game reads the full number aloud (e.g., "forty-two") and shows the numeric form
3. **Given** the child has mastered 2-digit numbers, **When** they complete a set, **Then** the game offers 3-digit numbers as the next difficulty tier

---

### User Story 4 - Word Building with Letter Tracing (Priority: P2)

**User Journey**: The child sees a simple word broken into letter slots (e.g., "CAT" → [C][A][T]). Each letter has a dashed outline to trace. After tracing all letters, the game spells the word aloud ("C-A-T, cat! A furry animal that says meow! 🐱"). This combines letter tracing with early reading skills. Words are grouped by difficulty: 3-letter simple words first, then 4-5 letter words.

**Why this priority**: This extends letter tracing into reading preparation. It's independently testable because you can trace any word and verify each letter slot fills, TTS spells and reads the word, and celebration shows the word meaning.

**Acceptance Scenarios**:

1. **Given** the child is in "Word Mode", **When** they trace each letter of a word in order (left to right), **Then** each letter slot fills with color as they complete it
2. **Given** the child completes all letter slots for a word, **When** the word finishes, **Then** the game spells it aloud letter-by-letter, then says the full word with a fun fact and emoji
3. **Given** the child has completed several 3-letter words, **When** they succeed consistently, **Then** the game introduces 4-5 letter words with increasing complexity

---

### User Story 5 - Difficulty Selection & Progression (Priority: P3)

**User Journey**: Before starting, the child (or parent) selects a difficulty level: Easy, Medium, or Hard. This affects: (1) tracing tolerance (Easy: 50% tolerance, Hard: 20%), (2) number of numbers/letters per set (Easy: 3, Hard: 8), (3) hint frequency (Easy: hints after 1 mistake, Hard: hints after 3 mistakes), (4) presence of stroke-order hints (Easy: always visible, Hard: hidden). The game tracks progress and unlocks harder modes over time.

**Why this priority**: This provides long-term engagement and adapts to the child's skill level. It's independently testable because you can switch difficulties and verify all parameters change accordingly.

**Acceptance Scenarios**:

1. **Given** the child selects "Easy" difficulty, **When** they trace a character, **Then** the game allows 50% deviation from the path and shows stroke-order hints always
2. **Given** the child selects "Hard" difficulty, **When** they trace a character, **Then** the game requires 20% deviation or less and stroke-order hints are hidden (only appear after a mistake)
3. **Given** the child completes sets successfully at one difficulty, **When** they reach a milestone (e.g., 3 sets at Easy), **Then** the game suggests trying the next difficulty level

---

### Edge Cases

- **What happens when the child traces completely off-screen?** → The game ignores touches outside the tracing area and shows a gentle bounce animation on the character to redirect attention.
- **How does system handle rapid successive touches?** → The game debounces touch events (100ms cooldown) and only processes the first touch per character.
- **What happens on small screens (e.g., 5" phone)?** → Characters scale proportionally; minimum character size is 80px to ensure traceability.
- **What if the child rotates the device mid-game?** → The game pauses tracing, re-renders characters at the new dimensions, and resumes (with a brief "whoosh" sound to signal the change).
- **How does system handle very long words (6+ letters)?** → Words wrap to a second row; each row traces independently, and the game reads the full word when all rows complete.
- **What happens if the child exits mid-trace?** → The game saves progress to localStorage; when they return, they can continue from where they left off (within the same session).

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: System MUST display traceable characters (numbers 0-9, uppercase letters A-Z) as dashed outlines with animated stroke-order hints (numbered start dots and directional arrows)
- **FR-002**: System MUST track finger/mouse touch position in real-time and render a glowing trail that follows the child's finger along the character path
- **FR-003**: System MUST determine whether the child's trace is "on track" by comparing touch coordinates against predefined character path points (with configurable tolerance: 20%-50%)
- **FR-004**: System MUST fill in the character with color when the child completes a successful trace, accompanied by a cheerful sound effect
- **FR-005**: System MUST support multiple game modes: (1) Single Numbers (0-9), (2) Single Letters (A-Z), (3) Multi-Digit Numbers (10-100), (4) Word Mode (3-6 letter words)
- **FR-006**: System MUST provide three difficulty levels (Easy, Medium, Hard) that affect: tracing tolerance, set size, hint frequency, and stroke-order hint visibility
- **FR-007**: System MUST read characters/words aloud using Capacitor TTS plugin, with letter names ("A is for Apple! 🍎") and full number/word pronunciation
- **FR-008**: System MUST render character paths using HTML5 Canvas for smooth 60fps tracing performance on Android WebView
- **FR-009**: System MUST track progress per session (numbers/letters traced, successes, failures) and display a celebration screen after completing a set
- **FR-010**: System MUST save progress to localStorage so children can resume mid-session if they exit the mini-app
- **FR-011**: System MUST scale characters responsively to fit different screen sizes (minimum 80px width for traceability)
- **FR-012**: System MUST provide stroke-order hints: numbered start points (small circles with numbers 1, 2, 3 showing stroke sequence) and subtle directional arrows along the path
- **FR-013**: System MUST validate traces against predefined SVG path data for each character (numbers 0-9, letters A-Z) with configurable tolerance thresholds
- **FR-014**: System MUST provide visual feedback for incorrect traces: gentle red glow on the path and a soft "try again" sound, without discouraging the child
- **FR-015**: System MUST include a celebration overlay with animations (confetti, stars, bouncing characters), sounds, and a "Play Again" button after completing each set
- **FR-016**: System MUST allow parents to configure difficulty, set size, and game mode via the Settings screen (using existing Settings module)
- **FR-017**: System MUST follow SproutPlay template structure: copy from `_template/`, register in `registry.js`, use `base.css` + per-app CSS, use `sound.js` for audio

### Key Entities (include if feature involves data)

- **Character Path**: SVG path data defining the dashed outline and stroke order for each traceable character (numbers 0-9, letters A-Z). Contains: `character` (e.g., "A"), `paths` (array of SVG path strings for each stroke), `strokeOrder` (array of numbered start points), `exampleWord` (optional word example for letters).
- **Trace Session**: Tracks the child's current progress: `mode` (numbers/letters/multi-digit/words), `difficulty` (easy/medium/hard), `currentCharacterIndex`, `charactersTraced` (array of traced characters), `successCount`, `failureCount`, `hintsShown`.
- **Game Configuration**: Settings that control game behavior: `tracingTolerance` (percentage, 20-50), `setSize` (numbers/letters per celebration, 3-8), `hintFrequency` (when to show hints: 1-3 mistakes), `showStrokeHints` (boolean), `selectedMode` (string).
- **Word Entry**: For Word Mode, each word contains: `word` (e.g., "CAT"), `letters` (array of letter strings: ["C", "A", "T"]), `meaning` (fun fact with emoji), `category` (e.g., "animals", "colors").

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: Children aged 3-5 can successfully trace at least 70% of single numbers/letters on their first attempt at Easy difficulty (measured via test sessions with target age group)
- **SC-002**: The game maintains 60fps canvas rendering on Android devices (Samsung Galaxy A-series, Lenovo Tab M series) during active tracing
- **SC-003**: Characters render correctly and are traceable on screens from 5" phones to 10" tablets (responsive scaling from 80px to 200px character width)
- **SC-004**: TTS pronunciation plays within 300ms of character completion on all supported languages (English default)
- **SC-005**: Progress persists across app restarts — children can close and reopen the app and resume their current session within 1 second
- **SC-006**: The mini-app loads and becomes interactive within 2 seconds of navigation from the hub (matching SproutPlay performance goals)
- **SC-007**: Parents can configure all game settings (mode, difficulty, set size) via the Settings screen and have preferences persist across sessions

## Assumptions

- Children using this mini-app are ages 3-7, with developing fine motor skills — touch targets and character sizes must be large enough to trace successfully
- The existing SproutPlay infrastructure is available: `sound.js` (Web Audio + TTS + NativeAudio), `Settings` module (localStorage persistence), `Router` (hub navigation), `mini-app-back.js` (back button handling)
- The Capacitor TTS plugin (`@capacitor-community/text-to-speech`) is already installed and configured for word/letter pronunciation
- SVG path data for numbers 0-9 and letters A-Z can be sourced or created (open-source stroke-order datasets exist for this)
- The existing `_template/` folder structure will be used as the foundation (copy to `app/www/tracer/`, create `css/tracer.css`, create `js/tracer/tracer.js`)
- Canvas-based rendering is acceptable for this mini-app (existing mini-apps use DOM elements; Canvas provides smoother tracing but is a different approach)
- The game will be distributed as part of the existing SproutPlay debug APK — no separate distribution needed
- Stroke-order data for letters follows standard US preschool teaching conventions (e.g., "A" starts with left diagonal, then right diagonal, then crossbar)
