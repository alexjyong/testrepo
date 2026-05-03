# Quickstart & Test Scenarios: Feed the Monster

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-03

## Setup

1. Build and install: `./build.sh && adb install app/android/app/build/outputs/apk/debug/app-debug.apk`
2. Open SproutPlay hub on device
3. Tap the **Feed the Monster** icon (🐲)

Alternatively, open `app/www/monster/index.html` in a browser for basic layout testing (TTS and NativeAudio will not work in browser, Web Audio SFX will).

---

## Scenario 1 — Complete a Level 1 round (happy path)

**Precondition**: Fresh install, no saved progress (or clear `localStorage['sproutplay_monster']`)

1. Launch the game. The monster appears holding a number sign (1–5).
2. Verify TTS speaks "Feed me [N]!" within ~1 second of load.
3. Verify exactly N food emoji items appear in the tray at the bottom.
4. Drag one item into the monster's mouth zone.
   - **Expected**: Monster plays chomp animation, counter increments to 1, chomp sound plays.
5. Continue dragging items one at a time until counter reaches N.
   - **Expected**: On the final item, celebration overlay appears with confetti, TTS says "You did it! You fed the monster [N]!"
6. Tap "Play Again".
   - **Expected**: New round starts with a new random target; items reset.

---

## Scenario 2 — Item misses the mouth (drag to wrong area)

1. Start a round.
2. Drag an item and release it outside the monster's mouth zone.
   - **Expected**: Item smoothly animates back to its original position. Counter does not change.

---

## Scenario 3 — Level progression

1. Complete 5 correct rounds in a row without closing the app.
   - **Expected**: After the 5th celebration, a level-up overlay/message appears ("Level up! You're amazing!"). The sign numbers change to the Level 2 range (1–10).
2. Close the app and reopen it.
   - **Expected**: The game starts at Level 2, not Level 1.

---

## Scenario 4 — Level 3 addition round

1. Advance to Level 3 (or manually set `localStorage['sproutplay_monster'] = '{"level":3,"consecutiveWins":0}'` and reload).
2. Verify the sign shows an expression like "3 + 2".
3. Verify TTS says "Three plus two — feed me five!"
4. Verify exactly 5 items appear in the tray.
5. Feed all 5 → celebration triggers.

---

## Scenario 5 — Sound off

1. Go to hub Settings → disable Sound Effects.
2. Launch Feed the Monster.
3. Drag items, complete a round.
   - **Expected**: No audio plays at all (no chomp, no TTS, no celebration sound). Visuals and animations work normally.

---

## Scenario 6 — Back button

1. Launch Feed the Monster.
2. Tap "← Back".
   - **Expected**: Returns to SproutPlay hub (`index.html`).
3. Press the Android hardware back button.
   - **Expected**: Returns to hub (does not exit the app).

---

## Regression checks after implementation

- [ ] Hub loads without errors after adding the new registry entry
- [ ] No console errors during a full round on Chrome DevTools emulator
- [ ] All touch targets (items, mouth zone, back button) are visually large (≥ 48px)
- [ ] Game works in airplane mode
- [ ] `./build.sh` succeeds and APK installs
