# Feature Specification: Piano Play

**Feature Branch**: `009-piano-play`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "Design and implement a landscape-mode interactive piano mini-app for SproutPlay kids"

## User Scenarios & Testing

### User Story 1 - Free Play Piano (Priority: P1)

A child (age 3–5) opens the piano app from the hub and immediately starts tapping keys to make sounds. There is no wrong way to play — every tap produces a satisfying musical note. The child explores the full range of notes, discovering that left keys sound lower and right keys sound higher.

**Why this priority**: This is the MVP. Without free play, there is no piano app at all. It delivers immediate value and lets us validate the core experience (touch response, sound quality, landscape layout) before adding any game mechanics.

**Independent Test**: A child can open the app from the hub, tap multiple keys across the keyboard, hear distinct notes play back, and navigate back to the hub — with no other features required.

**Acceptance Scenarios**:

1. **Given** the child is on the piano app screen, **When** they tap any key, **Then** a clear musical note plays immediately with no perceptible delay
2. **Given** the child taps multiple keys in sequence, **When** they tap faster, **Then** each note plays distinctly without cutting off previous notes
3. **Given** the child taps a key and holds their finger on it, **When** they lift their finger, **Then** the note stops playing
4. **Given** the child taps keys from left to right, **When** they listen, **Then** the notes clearly ascend in pitch
5. **Given** the child is done playing, **When** they tap the back button, **Then** they return to the hub screen

---

### User Story 2 - Visual Key Feedback (Priority: P2)

The child wants to see what they're doing. When they tap a key, it visually responds — lighting up or changing color — so they get immediate visual confirmation alongside the sound. This reinforces cause-and-effect learning for the youngest players.

**Why this priority**: Visual feedback is critical for the 3–4 age range who are still developing cause-and-effect understanding. It makes the experience more engaging and helps children who may have hearing differences fully participate.

**Independent Test**: A child can tap keys and see each key visually highlight on press, then return to its normal state on release — verifiable by observation without audio.

**Acceptance Scenarios**:

1. **Given** the child taps a key, **When** their finger makes contact, **Then** the key immediately changes color or brightness to show it is active
2. **Given** the child lifts their finger, **When** contact ends, **Then** the key returns to its normal (unpressed) appearance
3. **Given** the child taps rapidly across multiple keys, **When** they watch the screen, **Then** each key lights up independently and responsively

---

### User Story 3 - Note Labels for Early Learners (Priority: P3)

Some keys show letter names (C, D, E…) so that children who are learning the alphabet can connect musical notes to letters. Parents or educators can optionally enable note labels for a more structured learning experience.

**Why this priority**: This extends the piano's educational value beyond pure exploration, supporting early literacy and music education. It is optional and does not block the free-play experience.

**Independent Test**: With labels enabled, a child can see letter names on each key and associate them with the sounds produced.

**Acceptance Scenarios**:

1. **Given** note labels are enabled, **When** the child views the keyboard, **Then** each key displays its note name clearly
2. **Given** note labels are disabled, **When** the child views the keyboard, **Then** no text appears on the keys — only colors and shapes

---

### Edge Cases

- What happens when the device rotates from portrait to landscape? The piano should auto-detect orientation and reflow into a horizontal keyboard layout. If the child rotates mid-play, keys should reposition without losing sound state.
- How does the app handle rapid multi-touch? Young children often slap screens with multiple fingers. The piano should play all simultaneous notes without crashing or dropping audio.
- How does the app handle a call or notification interrupting play? Audio should pause gracefully and resume when the child returns to the app.
- What if the device has no speakers or headphones are unplugged mid-play? The app should not crash. Visual feedback continues even if audio is silent.

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be able to tap keys on a virtual piano keyboard and hear distinct musical notes play back with no perceptible latency
- **FR-002**: The keyboard MUST display at least 8 keys (one full octave: C through B) covering both white and black keys in correct piano layout
- **FR-003**: The app MUST auto-orient to landscape mode and fill the screen horizontally with keys arranged left-to-right by pitch
- **FR-004**: Each key MUST provide visual feedback on press (color/brightness change) and revert on release
- **FR-005**: Users MUST be able to play multiple notes simultaneously (chords) and in rapid succession
- **FR-006**: The app MUST integrate with the SproutPlay hub as a launchable mini-app with its own entry card
- **FR-007**: Users MUST be able to navigate back to the hub from the piano app using the standard back mechanism
- **FR-008**: The piano MUST use synthesized tones (Web Audio API) — no audio files required
- **FR-009**: Note labels (letter names) MUST be optionally displayable on keys, controlled by a toggle

### Key Entities

- **Piano Keyboard**: A set of at least 8 keys (7 white + 5 black for a full octave), each mapped to a specific musical frequency. Keys are arranged in standard piano layout with black keys raised above white keys.
- **Note**: A musical tone defined by its frequency (e.g., C4 = 261.63 Hz). Each key produces exactly one note.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A child can open the piano app from the hub and play their first note within 3 seconds of tapping
- **SC-002**: 95% of key taps produce audible notes with latency under 50ms (imperceptible to a young child)
- **SC-003**: Children ages 3–5 can independently discover that tapping different keys produces different sounds, without any instructions or prompts
- **SC-004**: The app handles simultaneous multi-touch input (3+ fingers) without audio dropouts or UI freezes for at least 30 seconds of continuous play

## Assumptions

- The target audience is children ages 3–5, so the interface must be entirely touch-based with no text instructions required for free play
- The existing Web Audio API infrastructure in `sound.js` can be leveraged or a dedicated audio context created within the piano mini-app
- The landscape orientation is guaranteed on the target Android devices (most tablets and phones rotate to landscape naturally)
- No internet connectivity is required — all audio is synthesized locally
- The piano app is a standalone mini-app following the existing SproutPlay pattern (separate HTML page, self-contained JS/CSS)
- Color choices for keys will use the existing CSS variable system from `base.css` for visual consistency with other mini-apps
