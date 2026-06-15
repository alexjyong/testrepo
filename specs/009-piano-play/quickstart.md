# Quickstart: Piano Play

**Feature**: 009-piano-play
**Date**: 2026-06-11

## Build and Install

### Prerequisites
- Node.js 18+ and npm installed
- Android SDK with API 34 and Build Tools 34.0.0
- Java 21 (Capacitor 8 requirement)

### Build Steps

```bash
# From repo root, on the 009-piano-play branch:
cd app && npm install && npx cap sync android && cd ..
./build.sh
```

APK output: `app/android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Manual Testing Scenarios

### Test 1: Launch from Hub
1. Open SproutPlay app
2. Tap the "Piano Play" 🎹 card on the hub grid
3. **Expected**: Piano app opens, keyboard fills the screen with as many keys as fit at ≥48dp each (dynamic count), no errors in console

### Test 2: Play Single Notes
1. Tap individual keys from left to right
2. **Expected**: Each key plays a distinct note ascending from C4 upward (number of keys depends on screen width)
3. **Expected**: Each key visually highlights (changes color) on press
4. **Expected**: Note stops when finger is lifted

### Test 3: Play Sharps/Flats
1. Tap the black keys (shorter keys between white keys)
2. **Expected**: Each black key plays its correct note (C#, D#, F#, G#, A#)
3. **Expected**: Black keys are visually distinct from white keys (darker color, shorter height)

### Test 4: Chords (Simultaneous Notes)
1. Press 2–3 keys simultaneously with different fingers
2. **Expected**: All pressed notes play at the same time
3. **Expected**: Each key maintains its visual highlight independently
4. **Expected**: Release one key — that note stops, others continue

### Test 5: Rapid Tapping
1. Tap keys rapidly (slap the screen) for 30+ seconds
2. **Expected**: No audio dropouts, no UI freezes, no crashes
3. **Expected**: Each tap produces a sound with no perceptible delay

### Test 6: Back Navigation
1. While in the piano app, tap the "← Back" button
2. **Expected**: Returns to the hub grid
3. **Expected**: Hub displays correctly, no stale state

### Test 7: Re-launch
1. From the hub, tap "Piano Play" again
2. **Expected**: Piano app opens cleanly (no duplicate audio contexts, no memory leaks)

### Test 8: Landscape Enforcement
1. Open Piano Play in portrait orientation (if device doesn't auto-rotate)
2. **Expected**: The piano keyboard fills the screen in landscape orientation via CSS rotation — no warning message, no prompt
3. **Expected**: All keys are accessible and functional

### Test 9: Sound Toggle
1. From the hub, go to Settings and disable sound
2. Return to hub, launch Piano Play
3. Tap keys
4. **Expected**: Keys still show visual feedback (color change) but produce no audio

### Test 10: Note Labels Toggle
1. In the piano header, tap the 🔤 button (right side)
2. **Expected**: Labels appear on all keys showing letter names (C, C#, D, etc.); button icon changes to 🏷️
3. Tap the 🏷️ button again
4. **Expected**: Labels disappear; button icon changes back to 🔤
5. Close and re-launch the piano app
6. **Expected**: Label state persists (remains on or off as last set)

## Known Limitations (MVP)

- Key count is dynamic: fills screen width with keys ≥48dp each (1–3 octaves depending on device).
- No game modes (copy melody, free play only). Game mechanics are out of scope for MVP.
- No recording or playback of played melodies.
- No volume control slider — uses fixed volume (0.5 gain).
- Portrait mode locks to landscape via Capacitor Screen Orientation plugin; no warning or prompt shown.

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `app/www/piano/index.html` | Created | Piano mini-app entry page |
| `app/www/css/piano.css` | Created | Piano-specific styles |
| `app/www/js/piano/piano.js` | Created | Piano logic (audio, touch, UI) |
| `app/www/js/registry.js` | Modified | Register piano in AppRegistry |
| `app/www/index.html` | May need update | If hub layout needs adjustment for new card |
| `README.md` | Modified | Document piano app in the list of mini-apps |
