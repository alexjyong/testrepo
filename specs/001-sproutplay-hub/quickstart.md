# Quick Start: SproutPlay Testing - Phase 1

**Feature**: SproutPlay Kids App Hub - Phase 1 (Framework & Main Menu)
**Branch**: `001-sproutplay-hub`

## Build & Run

```bash
# Navigate to app directory
cd sproutplay/app

# Install dependencies
npm install

# Sync Capacitor
npx cap sync android

# Build APK (using build.sh from repo root)
cd ../..
./sproutplay/build.sh

# Install on device or emulator
adb install sproutplay/app/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Test Scenarios - Phase 1

### Scenario 1: App Launches to Hub

**Steps**:
1. Launch SproutPlay app
2. Observe the launcher screen

**Expected**:
- App loads within 2 seconds
- Hub screen displays with colorful title "SproutPlay"
- App icons visible (placeholders for Phase 1)
- Icons are large (minimum 48dp touch targets)
- Bright, kid-friendly colors used throughout

---

### Scenario 2: Hub Displays App Icons

**Steps**:
1. From hub, observe the displayed apps
2. Count the number of app icons

**Expected**:
- At least 2-3 placeholder app icons displayed
- Each icon has an emoji or image
- Each icon has a name label
- Icons have different bright background colors
- Layout is grid or flexible for different screen sizes

---

### Scenario 3: Tap App Icon Loads Placeholder

**Steps**:
1. From hub, tap any app icon
2. Observe what happens

**Expected**:
- Placeholder view loads within 2 seconds
- Placeholder shows "Coming Soon" or similar message
- Back button or gesture returns to hub
- No crashes or errors

---

### Scenario 4: Return to Hub from Placeholder

**Steps**:
1. Tap an app icon to load placeholder
2. Press device back button or in-app back

**Expected**:
- Returns to hub launcher screen
- Hub state is preserved (same scroll position, etc.)
- No delays or flickering

---

### Scenario 5: Long-Press Opens Settings

**Steps**:
1. From hub, long-press a corner of the screen (or settings icon if visible)
2. Hold for 500ms+

**Expected**:
- Settings screen appears
- Settings screen is clearly different from hub (different styling)
- Parental gate toggle is visible
- Back button returns to hub

---

### Scenario 6: Settings Toggle Saves State

**Steps**:
1. Long-press to open settings
2. Toggle parental gate on
3. Return to hub
4. Long-press to open settings again

**Expected**:
- Parental gate toggle shows "on" state
- Setting persisted across navigation
- Setting persists after app restart

---

### Scenario 7: Rapid Tap Prevention

**Steps**:
1. From hub, rapidly tap the same app icon multiple times
2. From hub, rapidly tap different app icons in quick succession

**Expected**:
- Only the first tap registers
- Subsequent taps within 500ms are ignored
- No app crashes or confusion
- No multiple views loading

---

### Scenario 8: App Stability

**Steps**:
1. Open app to hub
2. Navigate to a placeholder view
3. Return to hub
4. Open settings
5. Return to hub
6. Force close and restart app

**Expected**:
- No crashes during normal use
- App returns to hub after force close
- Settings persist across restart

---

### Scenario 9: Screen Size Adaptation

**Steps**:
1. Run app on phone-sized screen (or emulator)
2. Run app on tablet-sized screen (or emulator)

**Expected**:
- UI scales appropriately
- Icons remain large enough to tap
- No horizontal scrolling on small screens
- Layout uses available space efficiently

---

## Accessibility Checklist

- [ ] All touch targets minimum 48dp
- [ ] High contrast colors used throughout
- [ ] No small text (minimum 16sp)
- [ ] Icons have descriptive labels
- [ ] No time-limited interactions

---

## Performance Checklist

- [ ] App loads in under 2 seconds
- [ ] Transitions are smooth (no visible lag)
- [ ] No jank when scrolling hub
- [ ] APK size under 50MB

---

## Definition of Done - Phase 1

- [ ] All test scenarios pass
- [ ] No crashes in 10-minute testing session
- [ ] Hub displays placeholder apps
- [ ] Settings accessible via long-press
- [ ] Settings persist across restarts
- [ ] APK builds successfully
- [ ] README updated with build instructions

---

## Future Phases (Not in Phase 1)

The following will be tested in future phases:

- **Phase 2**: Parental gate hold challenge
- **Phase 3**: Paint mini-app
- **Phase 4**: Memory game
- **Phase 5**: Coloring book
