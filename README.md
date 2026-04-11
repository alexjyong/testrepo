# SproutPlay

A kids app hub with fun mini-apps - coming soon!

SproutPlay is a collection of kid-friendly mini-apps in a simple, colorful interface designed for children ages 3-7. Built with Capacitor/Ionic following the BabbyPaint pattern.

## Features (Phase 1)

- 🎨 **Hub Launcher**: Colorful main menu with large, kid-friendly app icons
- 🚀 **Placeholder Apps**: Preview of upcoming mini-apps
- ⚙️ **Parent Settings**: Hidden settings accessed via long-press
- 🔒 **Parental Gate Framework**: Infrastructure for preventing accidental exits (full feature in Phase 2)

## Build It Yourself

### Prerequisites

- Node.js 18+
- npm
- Android Studio (for Android build)

### Setup

```bash
cd app

# Install dependencies
npm install

# Sync Capacitor
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

# Install dependencies
npm install

# Sync Capacitor
npx cap sync android

# Build for Android
cd android
./gradlew assembleDebug
```

The APK will be in `app/android/app/build/outputs/apk/debug/`

### Install on Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
sproutplay/
├── app/
│   ├── android/                # Android platform (Capacitor)
│   ├── resources/              # App icons and splash screens
│   ├── www/
│   │   ├── index.html          # Main entry point
│   │   ├── css/
│   │   │   ├── base.css        # Base styles
│   │   │   ├── hub.css         # Hub launcher styles
│   │   │   └── settings.css    # Settings screen styles
│   │   └── js/
│   │       ├── app.js          # Main app initialization
│   │       ├── hub.js          # Hub launcher logic
│   │       ├── router.js       # Navigation
│   │       ├── registry.js     # App registry
│   │       ├── settings.js     # Settings management
│   │       └── gesture.js      # Long-press gesture
│   ├── capacitor.config.ts     # Capacitor configuration
│   └── package.json            # Dependencies
├── build.sh                    # Build script
└── README.md                   # Documentation
```

## Development

### Running in Browser (for testing)

```bash
cd app
npx cap open
```

Or serve the www directory with a local server:

```bash
cd app/www
npx serve
```

### Debugging

Open Chrome DevTools for remote debugging:

```bash
chrome://inspect
```

## Roadmap

### Phase 1 (Current) - Framework & Main Menu
- ✅ Hub launcher with placeholder apps
- ✅ Settings screen with parental gate toggle
- ✅ Navigation framework

### Phase 2 - Parental Gate
- Hold-button challenge
- Back button protection

### Phase 3 - Paint Mini-App
- Drawing canvas
- Color palette
- Save to gallery

### Phase 4 - Memory Game
- Card matching game
- Kid-friendly images
- Victory celebration

### Phase 5 - Coloring Book
- Pre-drawn images
- Flood fill coloring
- Multiple pages

## Technology Stack

- **Framework**: Capacitor 6
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Storage**: localStorage
- **Target**: Android 5.0+ (API 21+)

## License

Apache-2.0

## Acknowledgements

Built following the [BabbyPaint](https://github.com/alexjyong/BabbyPaint) pattern by Alex Yong.
