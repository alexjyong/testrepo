# Feature Specification: ABC Letters (SproutPlay Mini-App)

**Feature Branch**: `002-abc-letters`
**Created**: 2026-04-10
**Status**: Draft
**Input**: A simple Endless Alphabet-style mini-app for SproutPlay with letter tap-to-hear phonics sounds, drag-and-drop word building, and celebration animations. Keep it simple — no monsters or themes yet, just colorful letters and sounds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tap Letters to Hear Sounds (Priority: P1)

A child sees the alphabet grid (A-Z) displayed in large, colorful letters. They tap a letter and hear its phonics sound (e.g., "ah" for A, "buh" for B) while the letter plays a fun animation (bounce, spin, or color change).

**Why this priority**: This is the core interaction — exploring and hearing letters. Without it, the app has no educational value.

**Independent Test**: Can be fully tested by opening the app, tapping any letter, hearing its phonics sound, and seeing the letter animate.

**Acceptance Scenarios**:

1. **Given** the letter grid is displayed, **When** the child taps a letter, **Then** the letter's phonics sound plays and the letter animates
2. **Given** a letter was tapped, **When** the child taps another letter, **Then** the new letter's sound plays (interrupting or queuing after the previous)
3. **Given** a letter is displayed, **When** the child taps the same letter multiple times, **Then** the sound replays each time

---

### User Story 2 - Build Words by Dragging Letters (Priority: P2)

A child can drag individual letters from the grid into a word-building area at the top of the screen. Letters snap into place as they spell out simple sight words (e.g., CAT, DOG, RUN, BIG).

**Why this priority**: This teaches spelling and word formation — the key educational mechanic beyond single-letter exploration.

**Independent Test**: Can be fully tested by dragging letters into the word area to form a complete word, hearing each letter's sound as it drops.

**Acceptance Scenarios**:

1. **Given** the letter grid and word area are displayed, **When** the child drags a letter to the word area, **Then** the letter snaps into place and its sound plays
2. **Given** a word area has letters in it, **When** the child completes a valid word, **Then** the word animates with celebration (stars, confetti) and the word's meaning is shown
3. **Given** letters are in the word area, **When** the child drags a letter back to the grid, **Then** it returns to the grid and the word area updates

---

### User Story 3 - See and Hear the Completed Word (Priority: P3)

When a word is completed, the app shows a simple animation or illustration of what the word means (e.g., a simple shape moves for "RUN", a circle grows big for "BIG"). The word also plays its full pronunciation ("k-ah-t" → "cat!").

**Why this priority**: This provides meaning and context to the letters, helping children connect spelling to real words.

**Independent Test**: Can be fully tested by completing a word and seeing the celebration animation and hearing the full word spoken.

**Acceptance Scenarios**:

1. **Given** a word is completed, **When** the celebration animation plays, **Then** the full word is spoken aloud with phonics breakdown
2. **Given** the celebration is playing, **When** the child taps the word, **Then** the word plays again
3. **Given** the celebration is done, **When** the child taps "Next Word" or "Clear", **Then** the word area resets

---

### Edge Cases

- What happens when child drags a letter outside the word area? Letter returns to grid
- How does system handle rapid tapping on multiple letters? Sounds queue or interrupt gracefully
- What happens on small screens? Grid scrolls, word area remains visible
- Can the app work without sound? Yes — visual feedback still works

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all 26 letters A-Z in a scrollable grid
- **FR-002**: System MUST play a phonics sound when any letter is tapped
- **FR-003**: System MUST animate the letter (bounce, spin, pulse) when tapped
- **FR-004**: System MUST support drag-and-drop of letters into a word area
- **FR-005**: System MUST snap dropped letters into position in the word area
- **FR-006**: System MUST play the letter sound when it drops into the word area
- **FR-007**: System MUST detect when a valid word is formed from a predefined list
- **FR-008**: System MUST play a celebration animation when a word is completed
- **FR-009**: System MUST speak the full word aloud after completion
- **FR-010**: System MUST allow clearing the word area to start a new word
- **FR-011**: System MUST respect the global Sound Effects toggle from settings
- **FR-012**: All letters MUST be minimum 48dp for touch targets

### Key Entities

- **Letter**: Represents a single letter A-Z with its phonics sound, display color, and animation type
- **Word**: A valid word from a predefined list with associated phonics breakdown and celebration message
- **WordSlot**: A position in the word area where a dropped letter snaps into place

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Phonics sounds play within 200ms of tapping a letter
- **SC-002**: All letters meet 48dp minimum touch target size
- **SC-003**: Drag-and-drop feels responsive with no noticeable lag on mid-range Android devices
- **SC-004**: Child can complete a 3-letter word independently in under 60 seconds

## Assumptions

- Phonics sounds will be generated via Web Audio API (synthesized tones) or bundled as small audio files
- Word list is hardcoded (not downloaded) for offline support
- App runs inside SproutPlay's hub (loaded via `abc/index.html`)
- Sound can be toggled off via hub settings
- No user accounts, progress tracking, or data persistence needed for v1
- Letters use bright, distinct colors (like Endless Alphabet but without character themes)
