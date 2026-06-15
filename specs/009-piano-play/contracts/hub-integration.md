# Hub Integration Contract: Piano Play

**Feature**: 009-piano-play
**Date**: 2026-06-11

## Overview

This document defines the contract between the piano mini-app and the SproutPlay hub (AppRegistry + Router). It ensures the piano integrates seamlessly with the existing mini-app ecosystem.

## AppRegistry Contract

### Registration

The piano must be registered in `AppRegistry` with the following metadata:

| Field | Value | Required |
|-------|-------|----------|
| `id` | `"piano"` | Yes — unique identifier |
| `name` | `"Piano Play"` | Yes — displayed on hub card |
| `icon` | `"🎹"` | Yes — emoji icon for hub grid |
| `description` | `"Tap the keys and make music!"` | Yes — subtitle on hub card |
| `backgroundColor` | `"color-4"` | Yes — CSS variable class for card background |
| `placeholder` | `false` | Yes — marks as a real, playable app |
| `path` | `"piano/index.html"` | Yes — relative path to mini-app HTML |

### Registration Code Pattern

```javascript
// In AppRegistry.init(), after existing registrations:
register({
  id: 'piano',
  name: 'Piano Play',
  icon: '🎹',
  description: 'Tap the keys and make music!',
  backgroundColor: 'color-4',
  placeholder: false,
  path: 'piano/index.html'
});
```

## Router Contract

### Launch

When the user taps the piano card on the hub:
1. `AppRegistry.launch('piano')` returns the app metadata
2. Router navigates to `piano/index.html` (full-page navigation, replaces hub)
3. The piano page loads `../css/base.css`, `../css/piano.css`, and `../js/piano/piano.js`

### Back Navigation

When the user taps the back button in the piano app:
1. The piano page calls `mini-app-back.js` (standard back helper)
2. `mini-app-back.js` performs `window.history.back()` or direct location change to hub
3. The hub view is restored

**No custom router changes required** — the piano uses the existing `mini-app-back.js` pattern that all other mini-apps use.

## Sound Module Contract

### Integration with Global Sound Settings

The piano must respect the global sound toggle:
- On initialization, check `Settings.isSoundEnabled()` (or equivalent)
- If sound is disabled, the piano should still show visual key feedback but produce no audio
- The piano does NOT call `Sound.init()` — it manages its own AudioContext

### No Dependency on Sound Module Functions

The piano does NOT call any functions from `Sound` (no `Sound.tone()`, `Sound.init()`, etc.). It creates its own AudioContext and manages oscillators independently. This avoids conflicts with other mini-apps' audio state.

## HTML Page Contract

### Required Script Order

The piano `index.html` must load scripts in this order:

```html
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/piano.css">

<script src="../js/sound.js"></script>
<script src="../js/mini-app-back.js"></script>
<script src="../js/piano/piano.js"></script>
```

**Note**: `sound.js` is loaded for access to `Settings` state (if needed), but the piano does not call any Sound functions. `mini-app-back.js` is required for back navigation.

### Required Meta Tags

```html
<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
```

This prevents zoom and pinch-to-zoom, critical for touch-target integrity.

## Visual Contract

### CSS Variable Usage

The piano must use existing CSS variables from `base.css` where applicable:
- `--color-dark` for text
- `--touch-target-min` (48px) as minimum key width
- `--font-family` for any text labels
- `--radius-md` (16px) for key border radius

### New CSS Variables (in piano.css)

The piano may define its own CSS variables for piano-specific colors:
- `--piano-white-key` — white key background color
- `--piano-white-key-active` — white key pressed color
- `--piano-black-key` — black key background color
- `--piano-black-key-active` — black key pressed color

These should use bright, kid-friendly colors consistent with the existing palette.
