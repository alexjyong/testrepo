# Implementation Plan: ABC Letters (SproutPlay Mini-App)

**Branch**: `002-abc-letters` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)

## Summary

Build ABC Letters — an Endless Alphabet-style mini-app where kids tap letters to hear phonics sounds and drag letters to build words. Simple, colorful, educational. No monsters or themes for now.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3
**Primary Dependencies**: Same as SproutPlay (Capacitor 6)
**Storage**: localStorage for last-visited word (optional, future)
**Testing**: Manual testing on Android devices
**Target Platform**: Android 5.0+ (API 21+)
**Project Type**: Mini-app within SproutPlay hub
**Performance Goals**: Phonics sounds play within 200ms, smooth drag-and-drop at 60fps
**Constraints**: Offline-capable, respects global Sound toggle
**Scale/Scope**: 26 letters + ~20 simple 3-letter words

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Simplicity First | ✅ Pass | Vanilla JS, no frameworks |
| Kid-First Design | ✅ Pass | 48dp+ touch targets, bright colors, simple interactions |
| Offline-Capable | ✅ Pass | All sounds and words bundled with app |
| Privacy by Default | ✅ Pass | No data collection, no tracking |
| Modular Mini-App | ✅ Pass | Self-contained, registered via AppRegistry |

**Gate Result**: PASS

## Project Structure

```
sproutplay/app/
├── www/
│   ├── abc/
│   │   └── index.html          # ABC mini-app HTML
│   ├── css/
│   │   └── abc.css             # ABC mini-app styles
│   └── js/
│       ├── abc/
│       │   └── abc.js          # ABC app logic (letter grid, drag-drop, word detection)
│       └── sound.js             # Reused from Memory game
```

## Phase 0: Research & Decisions

### Technical Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Phonics sounds | Synthesized via Web Audio API | Zero audio files, tiny code, customizable | Pre-recorded MP3s (adds ~100KB to APK) |
| Drag and drop | Touch events (touchstart/move/end) | Full control, works on mobile | HTML5 Drag API (doesn't work on mobile) |
| Word list | Hardcoded JS array | Simple, fast, offline | External JSON file (extra fetch, unnecessary complexity) |
| Animations | CSS animations + JS transforms | GPU-accelerated, smooth | Canvas/WebGL (overkill for this scope) |

## Phase 1: Design & Contracts

### Data Model

**Letter**: `{ letter: 'A', sound: [freq, duration], color: '#E74C3C', animation: 'bounce' }`
**Word**: `{ word: 'CAT', slots: ['C','A','T'], phonics: ['kuh','ah','tuh'], meaning: 'A furry animal that says meow!' }`

### Interface Contracts

N/A — standalone mini-app within SproutPlay hub.

### Quick Start Testing

See [quickstart.md](./quickstart.md) for test scenarios.
