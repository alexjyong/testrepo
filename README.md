# SproutPlay

A children's app hub — a bunch of fun mini-apps for kids ages 3–7, all in one place.

## What's Inside

### 🎨 Paint
A drawing canvas with 9 colors, 4 brush sizes, an eraser, and undo/redo. Kids can save their artwork to the device gallery. There's also a screen lock mode so the drawing doesn't accidentally close.

### 🧠 Memory
A 4×4 card matching game with 8 emoji pairs. Flip two cards at a time to find matching pairs — with sound effects for flips, matches, and misses. When you match all 8 pairs, there's a celebration screen with stars. Uses 10 simple sight words (CAT, DOG, RUN, BIG, SUN, HAT, CUP, BED, RED, FUN).

### 🔤 ABC Letters
A word-building game where kids drag scattered letter tiles into slots to spell words. Each word is read aloud, then each letter makes its phonics sound when tapped and dragged. There are 22 words of varying difficulty — three-letter words like CAT and DOG, four-letter words like FROG and BIRD, and five-letter words like APPLE and HORSE.

### 🏠 Hub
The main menu is a colorful grid of app icons. Tap one and you're in that mini-app. Hit the back button to return. There's a ⚙️ settings button in the top-right corner with toggles for sound effects and a parental gate option (framework is there, challenge not yet implemented).

## Build It Yourself

### Prerequisites
- Node.js 18+
- npm
- Java 21 (required by Capacitor 8)
- Android SDK (Android Studio)

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

### Install on a Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
sproutplay/
├── app/
│   ├── android/                    # Android platform (Capacitor)
│   ├── resources/                  # App icons, splash screens
│   ├── www/
│   │   ├── index.html              # Hub launcher
│   │   ├── abc/index.html          # ABC mini-app
│   │   ├── memory/index.html       # Memory game
│   │   ├── paint/index.html        # Paint app
│   │   ├── sounds/phonics/         # 26 letter phonics .mp3 files (A–Z)
│   │   ├── css/
│   │   │   ├── base.css            # Shared styles
│   │   │   ├── hub.css             # Hub + placeholder styles
│   │   │   └── settings.css        # Settings screen
│   │   │   ├── paint.css           # Paint app styles
│   │   │   ├── memory.css          # Memory game styles
│   │   │   └── abc.css             # ABC app styles
│   │   └── js/
│   │       ├── app.js              # Main entry + settings
│   │       ├── hub.js              # Hub launcher
│   │       ├── router.js           # Navigation between views
│   │       ├── registry.js         # App registry
│   │       ├── settings.js         # Settings persistence
│   │       ├── gesture.js          # Long-press gesture detector
│   │       ├── sound.js            # Sound effects (Web Audio + Native Audio + TTS)
│   │       ├── paint/paint.js      # Paint app logic
│   │       ├── memory/memory.js    # Memory game logic
│   │       └── abc/abc.js          # ABC app logic
│   ├── capacitor.config.ts
│   └── package.json
├── build.sh                        # Build script
└── README.md
```

## Sound System

The app has three types of audio:

| What | How |
|------|-----|
| **Phonics (A–Z)** | Native audio plugin plays `.mp3` files from `sounds/phonics/` |
| **Game sounds** | Web Audio API generates tones for flips, matches, and celebrations |
| **Word speech** | Capacitor Text-to-Speech plugin reads words and meanings aloud |

The phonics files are 26 `.mp3` files downloaded from Google TTS, about 150KB total.

## Technology

- **Capacitor 8** — wraps the web app in a native Android shell
- **Vanilla JavaScript** — no frameworks, no build tools, no npm dependencies beyond Capacitor
- **CSS3** — custom properties, flexbox, animations
- **localStorage** — persists settings (sound toggle, parental gate)
- **Android target**: API 22+

## License

Apache-2.0
