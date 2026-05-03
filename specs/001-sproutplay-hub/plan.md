# Implementation Plan: SproutPlay Kids App Hub - Phase 1

**Branch**: `001-sproutplay-hub` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)

## Summary

Build SproutPlay Phase 1: A children's app hub framework with main menu/launcher. Technical approach follows BabbyPaint's Capacitor/Ionic framework pattern with vanilla JavaScript for simplicity. This phase establishes the foundation for mini-apps to be added in future phases.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3
**Primary Dependencies**: @capacitor/core, @capacitor/android, @capacitor/assets
**Storage**: localStorage for settings
**Testing**: Manual testing on Android devices (following BabbyPaint pattern)
**Target Platform**: Android 5.0+ (API 21+)
**Project Type**: Mobile app (Capacitor/Ionic)
**Performance Goals**: 60fps animations, <2 second app launch time
**Constraints**: Offline-capable, no network required
**Scale/Scope**: Hub framework only, extensible for future mini-apps

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Self-contained modules | ✅ Pass | Hub and future mini-apps will be isolated |
| Simple text I/O | N/A | Mobile app with touch UI, not CLI |
| Test-first | ⚠️ Advisory | Manual testing following BabbyPaint pattern |
| Observability | ✅ Pass | Console logging for debugging |
| Simplicity (YAGNI) | ✅ Pass | Vanilla JS, no framework overhead |

**Gate Result**: PASS - Proceed with implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-sproutplay-hub/
├── plan.md              # This file
├── spec.md              # Feature specification
├── data-model.md        # Entity definitions
├── quickstart.md        # Test scenarios
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
sproutplay/
├── app/
│   ├── android/                # Android platform (Capacitor)
│   ├── resources/              # App icons and splash screens
│   ├── www/
│   │   ├── index.html          # Main entry point (hub launcher)
│   │   ├── css/
│   │   │   ├── base.css        # Base styles
│   │   │   ├── hub.css         # Hub launcher styles
│   │   │   └── settings.css    # Settings screen styles
│   │   └── js/
│   │       ├── app.js          # Main app initialization
│   │       ├── hub.js          # Hub launcher logic
│   │       ├── router.js       # Navigation between views
│   │       ├── registry.js     # App registry
│   │       ├── settings.js     # Settings management
│   │       └── gesture.js      # Long-press gesture detector
│   ├── capacitor.config.ts     # Capacitor configuration
│   └── package.json            # Dependencies
├── build.sh                    # Build script (like BabbyPaint)
└── README.md                   # Project documentation
```

**Structure Decision**: Single Capacitor project structure following BabbyPaint pattern. Hub and settings as separate views, with infrastructure for future mini-apps.

## Phase 0: Research & Decisions

### Technical Decisions

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Framework | Capacitor/Ionic | Follows BabbyPaint pattern, simple deployment | React Native (overkill), Flutter (learning curve) |
| UI Framework | Vanilla JS + CSS | No framework overhead, simple UI | React/Vue (unnecessary complexity) |
| State Management | localStorage | Minimal complexity for settings | Redux/MobX (overkill for this scope) |
| Parent Gesture | Long-press (500ms+) | Simple for parents, impossible for toddlers | Hidden button (too discoverable), PIN (too complex) |

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for detailed entity definitions.

**Key Entities**:
- **MiniApp**: Metadata for each mini-app (id, name, icon, path)
- **AppRegistry**: Central registry of available mini-apps
- **UserSettings**: App-wide settings including parental gate configuration

### Interface Contracts

N/A - This is a standalone mobile app with no external API contracts.

### Quick Start Testing

See [quickstart.md](./quickstart.md) for test scenarios and validation steps.

## Phase 2: Task Generation

Tasks defined in tasks.md - 44 tasks across 5 phases.
