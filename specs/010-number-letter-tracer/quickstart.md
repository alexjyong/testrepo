# Quickstart Guide: Number/Letter Tracer Game

**Feature**: 010-number-letter-tracer
**Date**: 2026-06-18
**Audience**: Developers implementing the mini-app, testers verifying functionality

---

## Prerequisites

Before starting implementation or testing, ensure you have:

1. **Node.js 18+** and **npm** installed
2. **Java 21** (Capacitor 8 requirement)
3. **Android SDK** with API 34 and Build Tools 34.0.0
4. **Git** for version control
5. **Android device or emulator** for testing (Samsung Galaxy A-series, Lenovo Tab M series recommended)

> **DevContainer**: The `.devcontainer/devcontainer.json` sets everything up automatically on GitHub Codespaces or DevPod.

---

## Implementation Steps

### Step 1: Create Feature Branch (Already Done)

```bash
cd /workspaces/testrepo
git checkout -b 010-number-letter-tracer
```

**Expected**: New branch `010-number-letter-tracer` created from `main`.

---

### Step 2: Copy Template Folder

```bash
cp -r app/www/_template app/www/tracer
```

**Expected**: New folder `app/www/tracer/` created with `index.html` and `js/_template/` subfolder.

---

### Step 3: Rename Template Files

```bash
# Rename CSS file
mv app/www/tracer/css/_template.css app/www/tracer/css/tracer.css

# Rename JS folder and file
mkdir -p app/www/js/tracer
mv app/www/tracer/js/_template.js app/www/js/tracer/tracer.js
rmdir app/www/tracer/js
```

**Expected**: 
- CSS file: `app/www/tracer/css/tracer.css`
- JS file: `app/www/js/tracer/tracer.js`

---

### Step 4: Update HTML (tracer/index.html)

Open `app/www/tracer/index.html` and make these changes:

1. **Change title** (line ~15):
   ```html
   <title>SproutPlay - Tracer!</title>
   ```

2. **Change CSS link** (line ~13):
   ```html
   <link rel="stylesheet" href="../css/tracer.css" type="text/css" media="screen">
   ```

3. **Change JS script src** (line ~70):
   ```html
   <script src="../js/tracer/tracer.js"></script>
   ```

4. **Update back button ID** (line ~30):
   ```html
   <button id="tracer-back" class="back-button" aria-label="Back to hub">← Back</button>
   ```

5. **Update header class and title** (lines ~28-31):
   ```html
   <header class="tracer-header">
       <button id="tracer-back" class="back-button" aria-label="Back to hub">← Back</button>
       <h1 class="tracer-title">Tracer</h1>
   </header>
   ```

6. **Replace game-area content** with Canvas element:
   ```html
   <div id="game-area" class="game-area">
       <!-- Mode/Difficulty Selectors -->
       <div id="controls" class="tracer-controls">
           <select id="mode-select" class="control-select">
               <option value="numbers">Numbers ✏️</option>
               <option value="letters">Letters 🔤</option>
               <option value="multi-digit">Multi-Digit 🔢</option>
               <option value="words">Words 📝</option>
           </select>
           <select id="difficulty-select" class="control-select">
               <option value="easy">Easy ⭐</option>
               <option value="medium">Medium ⭐⭐</option>
               <option value="hard">Hard ⭐⭐⭐</option>
           </select>
       </div>
       
       <!-- Canvas for Tracing -->
       <canvas id="tracer-canvas" class="tracer-canvas"></canvas>
   </div>
   ```

7. **Update celebration overlay** (customize for tracer theme):
   ```html
   <div id="celebration" class="celebration-overlay" style="display:none">
       <div class="celebration-card">
           <div class="celebration-emoji">🎉</div>
           <h2 id="celebration-title">Great Tracing!</h2>
           <p id="celebration-msg">You did it!</p>
           <button id="play-again-btn" class="play-again-button">Play Again 🎮</button>
           <button id="celebration-back" class="play-again-button secondary">Back to Hub</button>
       </div>
   </div>
   ```

**Expected**: HTML file loads correct CSS/JS, displays Canvas element and controls.

---

### Step 5: Create Tracer CSS (css/tracer.css)

Create `app/www/tracer/css/tracer.css` with these sections:

1. **Header styles** (copy from template, update class names):
   ```css
   .tracer-header {
       display: flex;
       align-items: center;
       justify-content: center;
       position: relative;
       padding: 16px;
   }
   
   .tracer-title {
       font-size: var(--font-size-xl);
       color: var(--color-primary);
       margin: 0;
   }
   ```

2. **Controls styles** (mode/difficulty selectors):
   ```css
   .tracer-controls {
       display: flex;
       gap: var(--spacing-md);
       justify-content: center;
       padding: var(--spacing-md);
   }
   
   .control-select {
       min-width: 120px;
       min-height: 48px; /* Touch target comfort */
       font-size: var(--font-size-md);
       padding: var(--spacing-sm) var(--spacing-md);
       border-radius: var(--radius-lg);
       background: var(--color-surface);
       color: var(--color-text);
       border: 2px solid var(--color-primary);
   }
   ```

3. **Canvas styles**:
   ```css
   .tracer-canvas {
       display: block;
       width: 100%;
       height: calc(100vh - 200px); /* Header + controls space */
       touch-action: none; /* Prevent scrolling */
       background: var(--color-surface-light);
   }
   ```

4. **Celebration overlay** (customize for tracer theme):
   ```css
   .celebration-overlay {
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgba(0, 0, 0, 0.7);
       display: none;
       justify-content: center;
       align-items: center;
       z-index: 1000;
   }
   
   .celebration-card {
       background: var(--color-surface);
       padding: var(--spacing-xl);
       border-radius: var(--radius-xl);
       text-align: center;
       max-width: 80%;
   }
   
   .celebration-emoji {
       font-size: 64px;
       animation: bounce 1s infinite;
   }
   
   @keyframes bounce {
       0%, 100% { transform: translateY(0); }
       50% { transform: translateY(-20px); }
   }
   ```

**Expected**: CSS file styles Canvas, controls, and celebration overlay correctly.

---

### Step 6: Create Tracer JS (js/tracer/tracer.js)

Create `app/www/js/tracer/tracer.js` as an IIFE singleton with these sections:

1. **Path Data Module** (create `js/tracer/paths.js` first):
   ```javascript
   // js/tracer/paths.js — IIFE singleton exporting SVG path data
   const Paths = (function() {
       const PATH_DATA = {
           "0": { paths: ["M 50 10 C 20 10, 10 40, 50 90 C 90 90, 90 40, 50 10"], strokeOrder: [1], boundingBox: {x: 0, y: 0, width: 100, height: 100} },
           "1": { paths: ["M 40 10 L 50 90"], strokeOrder: [1], boundingBox: {x: 0, y: 0, width: 100, height: 100} },
           // ... add all 10 numbers and 26 letters
       };
       
       return {
           getPath: function(character) { return PATH_DATA[character.toUpperCase()]; },
           getAllCharacters: function() { return Object.keys(PATH_DATA); }
       };
   })();
   ```

2. **Main Tracer Module**:
   ```javascript
   // js/tracer/tracer.js — IIFE singleton
   document.addEventListener('DOMContentLoaded', function() {
       
       // State
       var canvas, ctx;
       var currentCharacter = null;
       var isTracing = false;
       var tracePoints = [];
       var settings = null;
       
       // Init
       function init() {
           canvas = document.getElementById('tracer-canvas');
           ctx = canvas.getContext('2d');
           
           // Load settings
           if (typeof Settings !== 'undefined') {
               settings = Settings.getSettings('tracer');
           }
           
           // Setup Canvas dimensions
           resizeCanvas();
           
           // Register touch handlers
           canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
           canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
           canvas.addEventListener('touchend', handleTouchEnd);
           
           // Setup controls
           document.getElementById('mode-select').addEventListener('change', function(e) {
               settings.selectedMode = e.target.value;
               Settings.saveSettings('tracer', settings);
               loadNewCharacter();
           });
           
           document.getElementById('difficulty-select').addEventListener('change', function(e) {
               settings.selectedDifficulty = e.target.value;
               Settings.saveSettings('tracer', settings);
               loadNewCharacter();
           });
           
           // Back button
           document.getElementById('tracer-back').addEventListener('click', function() {
               window.location.href = '../index.html';
           });
           
           // Celebration buttons
           document.getElementById('play-again-btn').addEventListener('click', function() {
               hideCelebration();
               loadNewCharacter();
           });
           document.getElementById('celebration-back').addEventListener('click', function() {
               window.location.href = '../index.html';
           });
           
           // Start game loop
           loadNewCharacter();
       }
       
       // ... (implement all functions: resizeCanvas, handleTouchStart, handleTouchMove, 
       //      handleTouchEnd, loadNewCharacter, drawDashedOutline, drawGlowTrail, etc.)
       
       init();
   });
   ```

**Expected**: JS file initializes Canvas, registers touch handlers, loads characters, and handles tracing.

---

### Step 7: Register App in Registry

Open `app/www/js/registry.js` and add tracer app entry (in alphabetical order):

```javascript
var APP_REGISTRY = [
    // ... existing apps ...
    { id: "tracer", name: "Tracer", icon: "✏️", path: "tracer/index.html" },
    // ... rest of apps ...
];
```

**Expected**: Tracer app appears in hub grid after sync.

---

### Step 8: Sync and Build

```bash
cd app && npx cap sync android && cd .. && ./build.sh
```

**Expected**: 
- `npx cap sync android` copies web assets to Android project
- `./build.sh` produces debug APK at `app/android/app/build/outputs/apk/debug/app-debug.apk`

---

### Step 9: Install and Test on Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

**Expected**: Tracer app installs on device, appears in SproutPlay hub.

---

## Testing Checklist

### Manual QA Tests (run on Android device)

1. **Single Numbers Mode**
   - [ ] Select "Numbers" mode
   - [ ] Trace numbers 0-9 with varying accuracy (Easy, Medium, Hard)
   - [ ] Verify glow trail follows finger
   - [ ] Verify numbers fill with color on successful trace
   - [ ] Verify TTS says number name ("fourty-two")
   - [ ] Verify celebration appears after completing set (default: 3 numbers)

2. **Single Letters Mode**
   - [ ] Select "Letters" mode
   - [ ] Trace letters A-Z with varying accuracy
   - [ ] Verify stroke-order hints appear (numbered start points, directional arrows)
   - [ ] Verify TTS says letter name with word example ("A is for Apple! 🍎")
   - [ ] Verify celebration appears after completing set

3. **Multi-Digit Mode**
   - [ ] Select "Multi-Digit" mode
   - [ ] Trace 2-digit numbers (10-99)
   - [ ] Verify each digit slot fills independently
   - [ ] Verify TTS says full number ("fourty-two")
   - [ ] Test 3-digit numbers (100)

4. **Word Mode**
   - [ ] Select "Words" mode
   - [ ] Trace 3-6 letter words (e.g., "CAT", "DOG")
   - [ ] Verify each letter slot fills independently
   - [ ] Verify TTS spells word then says full word with meaning ("C-A-T, cat! A furry animal that says meow! 🐱")
   - [ ] Test words across categories (animals, colors, fruits)

5. **Difficulty Levels**
   - [ ] Test Easy: 50% tolerance, 3 per set, hints always visible
   - [ ] Test Medium: 35% tolerance, 5 per set, hints after 1 mistake
   - [ ] Test Hard: 20% tolerance, 8 per set, hints after 3 mistakes

6. **Settings Integration**
   - [ ] Change mode/difficulty via selectors
   - [ ] Verify settings persist across app restarts (localStorage)
   - [ ] Verify settings appear in main Settings screen

7. **Hub Integration**
   - [ ] Navigate from hub → Tracer → back to hub
   - [ ] Verify back button returns to hub
   - [ ] Verify Tracer app appears in hub grid

8. **Performance**
   - [ ] Verify 60fps canvas rendering on target devices
   - [ ] Verify <2s load time from hub navigation
   - [ ] Verify TTS plays within 300ms of character completion

9. **Responsive Scaling**
   - [ ] Test on screens from 5" phones to 10" tablets
   - [ ] Verify characters scale from 80px to 200px width
   - [ ] Verify no clipping or off-screen rendering

10. **Edge Cases**
    - [ ] Test rapid successive touches (debounce works)
    - [ ] Test device rotation mid-game (re-renders correctly)
    - [ ] Test small screens (5" phone, characters still traceable)
    - [ ] Test exiting mid-session and resuming (progress persists)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Canvas not rendering | Verify `<canvas>` element exists in HTML; check browser console for errors |
| Touch events not firing | Verify `{ passive: false }` is set on touch handlers; check `touch-action: none` in CSS |
| TTS not playing | Verify `@capacitor-community/text-to-speech` plugin is installed; check `Sound.init()` is called on first touch |
| Characters not scaling | Verify Canvas `width` and `height` attributes are set dynamically in `resizeCanvas()` |
| Build fails | Verify all template files are renamed correctly; check `registry.js` has valid JSON syntax |
| APK installs but app crashes | Check Android logcat for JavaScript errors; verify all script tags load in correct order |

---

## Next Steps After Implementation

1. **Run full testing checklist** (see above)
2. **Commit changes** to feature branch:
   ```bash
   git add app/www/tracer/ app/www/js/tracer/ app/www/css/tracer.css app/www/js/registry.js
   git commit -m "feat: add Number/Letter Tracer mini-app"
   ```
3. **Create pull request** to `main` branch
4. **CI build** (GitHub Actions) will produce debug APK artifact
5. **Manual QA** on target devices (Samsung Galaxy A-series, Lenovo Tab M series)
6. **Merge to main** after all tests pass

---

## References

- **Feature Spec**: [spec.md](spec.md)
- **Implementation Plan**: [plan.md](plan.md)
- **Research**: [research.md](research.md)
- **Data Model**: [data-model.md](data-model.md)
- **Template**: `app/www/_template/` (copy for new mini-apps)
- **Existing Mini-Apps**: `app/www/abc/`, `app/www/paint/`, `app/www/memory/` (reference for patterns)
