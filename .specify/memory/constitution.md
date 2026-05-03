<!--
SYNC IMPACT REPORT
==================
Version change: N/A (initial constitution) → 1.0.0
Added principles:
  - I. Simplicity First (YAGNI)
  - II. Kid-First Design
  - III. Offline-Capable
  - IV. Privacy by Default
  - V. Modular Mini-App Architecture
Added sections:
  - Technology Constraints
  - Quality Gates
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No changes needed (Constitution Check compatible)
  - .specify/templates/spec-template.md: ✅ No changes needed (privacy constraints align)
  - .specify/templates/tasks-template.md: ✅ No changes needed (manual testing approach documented)
Follow-up TODOs: None
-->

# SproutPlay Constitution

## Core Principles

### I. Simplicity First (YAGNI)

Every feature MUST start with the simplest possible implementation. Vanilla JavaScript MUST be preferred over frameworks unless a clear, demonstrated need exists. No build tools, bundlers, or complex toolchains unless the project outgrows vanilla approaches.

**Rationale**: SproutPlay follows the BabbyPaint pattern - a simple, maintainable codebase that any developer can understand in minutes. Complexity MUST be justified with documented trade-offs.

### II. Kid-First Design

All user interface elements MUST meet minimum accessibility standards for children ages 3-7:
- Touch targets MUST be at least 48dp
- Text MUST be minimum 16sp
- Colors MUST be high-contrast and bright
- Interactions MUST be simple (tap, swipe, hold)
- No time-limited actions or pressure-based mechanics

**Rationale**: The primary users are young children with developing motor skills and limited reading ability. Design decisions MUST prioritize their needs over developer convenience.

### III. Offline-Capable

The app MUST function fully without network connectivity after installation. No features MAY depend on internet access. All data (settings, artwork, progress) MUST be stored locally.

**Rationale**: Children use devices in cars, airplanes, and areas without reliable WiFi. The app MUST work everywhere.

### IV. Privacy by Default

The app MUST NOT collect, transmit, or store any personal data. No analytics, no tracking, no ads, no in-app purchases. The app MUST NOT require user accounts or authentication.

**Rationale**: COPPA compliance and ethical responsibility to protect children's privacy. Parents MUST trust that the app is safe.

### V. Modular Mini-App Architecture

Each mini-app MUST be self-contained and independently testable. The hub MUST not depend on any specific mini-app. Mini-apps MUST be registered through the AppRegistry and launched via the router.

**Rationale**: Enables incremental development, easy addition/removal of apps, and independent testing of each mini-app.

## Technology Constraints

**Approved Stack**:
- JavaScript (ES6+) - No TypeScript unless complexity demands it
- HTML5 + CSS3 - No CSS frameworks
- Capacitor 6 - For Android deployment
- localStorage - For settings and simple data persistence
- Capacitor Filesystem API - For saved artwork

**Prohibited**:
- React, Vue, Angular, or other UI frameworks
- Webpack, Rollup, or complex build tools
- Analytics libraries (Google Analytics, Mixpanel, etc.)
- Advertising SDKs
- Third-party tracking services

**Rationale**: Keep the codebase simple, auditable, and maintainable. Follow the BabbyPaint pattern.

## Quality Gates

**Before merging any feature**:
- App launches without errors in browser testing
- All touch targets meet 48dp minimum
- No console errors during normal use
- Back button behavior is correct (returns to hub or exits appropriately)
- Settings persist across app restarts
- APK builds successfully via `./build.sh`

**Testing approach**: Manual testing on Android devices following quickstart.md scenarios. Automated tests are optional and added only when they provide clear value.

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Documentation of the change and rationale
2. Review against existing principles for conflicts
3. Update to this file with version increment
4. Update to dependent templates if affected

**Versioning policy**: Semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: Principle removal or redefinition
- MINOR: New principle or section added
- PATCH: Clarifications, wording fixes, non-semantic changes

**Compliance review**: All features MUST be evaluated against this constitution during planning. Violations MUST be documented with justification in the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-04-01 | **Last Amended**: 2026-04-01
