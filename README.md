# SproutPlay

A children's app hub; a bunch of fun mini-apps for kids ages 3–7, all in one place.

Pre-release version available here on Github!
[<img src="https://github.com/user-attachments/assets/b0218883-f6dd-4f9e-abc1-ed070c6107f2"
alt="Get it on GitHub"
height="80">](https://github.com/alexjyong/sproutplay/releases/latest/)

## What's Inside

### 🎨 Paint
A drawing canvas with 9 colors, 4 brush sizes, an eraser, and undo/redo. Kids can save their artwork to the device gallery. There's also a screen lock mode so the drawing doesn't accidentally close.

### 🧠 Memory
A 4×4 card matching game with 8 emoji pairs. Flip two cards at a time to find matching pairs; with sound effects for flips, matches, and misses. When you match all 8 pairs, there's a celebration screen with stars. 

### 🔤 ABC Letters
A word-building game where kids drag scattered letter tiles into slots to spell words. Each word is read aloud, then each letter makes its phonics sound when tapped and dragged. There are 22 words of varying difficulty — three-letter words like CAT and DOG, four-letter words like FROG and BIRD, and five-letter words like APPLE and HORSE.

### 🏠 Hub
The main menu is a colorful grid of app icons. Tap one and you're in that mini-app. Hit the back button to return. There's a ⚙️ settings button in the top-right corner with toggles for sound effects and a parental gate option (framework is there, challenge not yet implemented).

More games are planned! Stay tuned!

## Build It Yourself

### Prerequisites
- Node.js 18+
- npm
- Java 21 (required by Capacitor 8)
- Android SDK (Android Studio)

(note, the devcontainer.json will set this up for you on codespaces/devpod.)

### Setup

```bash
cd app
npm install
npx cap sync android
```

### Build APK

From the project root:

```bash
./build.sh
```

Or manually:

```bash
cd app
npm install
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK ends up in `app/android/app/build/outputs/apk/debug/app-debug.apk`.

You can install on a device via

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

Or by sending the APK to your phone via USB, [magic wormhole](https://magic-wormhole.readthedocs.io/en/latest/), good ol' fashioned email it to yourself and open the email on your phone.

If you use the codespace ins

## Sound System

The app has three types of audio:

| What | How |
|------|-----|
| **Phonics (A–Z)** | Native audio plugin plays `.mp3` files from `sounds/phonics/` |
| **Game sounds** | Web Audio API generates tones for flips, matches, and celebrations |
| **Word speech** | Capacitor Text-to-Speech plugin reads words and meanings aloud |

The phonics files are 26 `.mp3` files generated with Kokoro TTS.

## License

GNU General Public License v3.0
