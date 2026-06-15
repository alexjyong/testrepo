# SproutPlay

A children's app hub; a bunch of fun mini-apps for kids ages 3–7, all in one place.

Pre-release version available here on GitHub!
[<img src="https://github.com/user-attachments/assets/b0218883-f6dd-4f9e-abc1-ed070c6107f2"
alt="Get it on GitHub"
height="80">](https://github.com/alexjyong/sproutplay/releases/latest/)

## What's Inside

### 🎨 Paint
A drawing canvas with 9 colors, 4 brush sizes (S/M/L/XL), an eraser, and undo/redo (up to 20 steps). Kids can save their artwork to the device gallery. A floating action button (FAB) expands to reveal Save, Clear, and Help options.

### 🧠 Memory
A 4×4 card matching game with 8 emoji pairs (chosen from 12 animals). Flip two cards at a time to find matching pairs, with synthesized sound effects for flips, matches, and misses. A celebration screen with stars appears when all pairs are found.

### 🔤 ABC Letters
A word-building game where kids drag scattered letter tiles into slots to spell words. Each word is read aloud, then each letter plays its phonics sound when tapped and dragged. There are 32 words of varying difficulty — three-letter words like CAT and DOG, four-letter words like FROG and BIRD, and five-letter words like APPLE and HORSE.

### 🚀 Space Hero
A breakout-style brick breaker with a paddle, ball, and colored blocks. Features ⭐ repair star powerups that restore lost hearts, a Zelda-style heart HUD (3 lives), and increasing difficulty with strong blocks that take two hits.

### 🐲 Feed the Monster
A drag-and-drop math game with three difficulty levels. A hungry monster displays a target number on its sign and speaks it aloud — kids drag the right amount of food into its mouth. Wrong food bounces back with a "Yuck!" shake. Level 1 targets 1–5, Level 2 targets 1–7, Level 3 is missing-addend mode ("3 + ? = 5 🍇") where some items are already eaten and the child feeds only the remainder. Win five rounds in a row to level up; progress persists across sessions.

### 🎹 Piano Play
A landscape-mode piano that fills the screen with dynamically-sized keys (from 1 to 3 octaves, depending on device width). Tap keys to hear synthesized musical notes — no audio files needed, everything runs on the Web Audio API. Slide your finger across keys for continuous glissando playing. Keys light up when pressed for visual feedback. Note labels (letter names) are optionally displayable via a toggle button. Designed for ages 3–5: no wrong answers, just explore and make music.

### 🏠 Hub
The main menu is a colorful grid of app icons. Tap one to launch that mini-app. Hit the back button to return. A ⚙️ Settings button in the top-right corner opens settings for the app:
* Toggle **Sound Effects** on/off  and toggle **Lock SproutPlay** on/off. 
* When Lock SproutPlay is enabled, a 🔒 lock button appears in the hub header — tap it to pin the screen using Android's Screen Pinning. To unlock, tap the 🔓 button 4 times quickly (within 1-second windows). 

More games are planned! Stay tuned!

## Global Features

### 🔒 Screen Lock (Parental Control)
Enable **Lock SproutPlay** in Settings to show a 🔒 lock button on the hub header. Tap it to pin the entire app using Android's `startLockTask` — kids can't leave or switch apps. To unlock, tap the 🔓 button 4 times quickly (within 1-second windows).

### 💾 Settings Persistence
All settings (Sound Effects, Lock SproutPlay) are saved to localStorage and restored on app launch.

## Build It Yourself

### Prerequisites
- Node.js 18+ and npm
- Java 21 (required by Capacitor 8)
- Android SDK with API 34 and Build Tools 34.0.0
- `lame` CLI (for phonics audio generation)
- Python 3 + `kokoro`, `soundfile`, `torch`, `numpy` (for phonics generation only)

> **Tip:** The `.devcontainer/devcontainer.json` sets everything up automatically on GitHub Codespaces or DevPod.

### Quick Start

```bash
# From the project root
npm install --prefix app
npx cap sync android
./build.sh
```

The APK will be at `app/android/app/build/outputs/apk/debug/app-debug.apk`.

### Manual Build Steps

```bash
cd app
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

### Install on Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

Or share the APK via USB, [magic wormhole](https://magic-wormhole.readthedocs.io/en/latest/), email, or any other method.

## Sound System

| What | How |
|------|-----|
| **Phonics (A–Z)** | Capacitor Native Audio plugin plays `.mp3` files from `sounds/phonics/` |
| **Game sounds** | Web Audio API generates tones in real-time (flips, matches, celebrations) |
| **Word speech** | Capacitor Text-to-Speech plugin reads words and meanings aloud |

The 26 phonics MP3 files are generated with [Kokoro TTS](https://github.com/hexgrad/kokoro):

```bash
cd scripts
python3 generate_phonics.py
```

## Architecture

```
sproutplay/
├── app/
│   ├── www/              # Frontend assets
│   │   ├── js/           # Shared modules (router, hub, sound, settings)
│   │   ├── js/<game>/    # Per-game logic (paint, memory, abc, space, monster)
│   │   ├── css/          # Per-app stylesheets
│   │   ├── sounds/       # Phonics MP3s (A–Z)
│   │   └── index.html    # Hub launcher
│   ├── android/          # Android native project (Capacitor)
│   ├── package.json      # Dependencies
│   └── capacitor.config.ts
├── scripts/
│   └── generate_phonics.py
├── build.sh
└── .github/workflows/build.yml
```

## License

GNU General Public License v3.0
