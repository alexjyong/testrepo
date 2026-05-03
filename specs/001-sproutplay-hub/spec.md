# Feature Specification: SproutPlay Kids App Hub - Phase 1

**Feature Branch**: `001-sproutplay-hub`
**Created**: 2026-04-01
**Status**: Draft
**Input**: SproutPlay - a childrens app hub framework with main menu/launcher. Large buttons, bright colors, simple interactions for ages 3-7. Package: dev.alexjyong.sproutplay

**Scope**: This phase focuses on the app framework and main menu only. Mini-apps will be added in future phases.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kid Opens Hub and Sees App Launcher (Priority: P1)

A child opens SproutPlay and sees a colorful launcher screen with large, colorful icons representing mini-apps. The hub displays a welcoming, kid-friendly interface with bright colors and simple navigation.

**Why this priority**: This is the core functionality - the hub launcher is the foundation that all mini-apps will plug into. Without it, there is no product.

**Independent Test**: Can be fully tested by opening the app and seeing the launcher screen with app icons displayed. Icons can be placeholders for now.

**Acceptance Scenarios**:

1. **Given** the app is installed and closed, **When** the child taps the SproutPlay icon, **Then** the hub launcher screen displays with colorful app icons
2. **Given** the hub launcher is displayed, **When** the child taps a mini-app icon, **Then** a placeholder view loads (to be replaced with real mini-apps later)
3. **Given** the hub is displayed, **When** the child looks at the screen, **Then** they see large, colorful touch targets with clear labels

---

### User Story 2 - Parent Accesses Settings (Priority: P2)

A parent can access a settings screen from the hub. The settings screen is hidden from children (accessed via long-press or hidden gesture). Initial settings include parental gate toggle.

**Why this priority**: Settings infrastructure is needed early as it affects navigation throughout the app. The parental gate feature itself can be added later.

**Independent Test**: Can be fully tested by accessing settings from the hub and seeing the settings screen.

**Acceptance Scenarios**:

1. **Given** the hub is displayed, **When** the parent performs the settings gesture (long-press corner), **Then** a settings screen appears
2. **Given** the settings screen is open, **When** the parent taps "Back", **Then** they return to the hub
3. **Given** the settings screen is open, **When** the parent sees the parental gate toggle, **Then** it shows current state (on/off)

---

### Edge Cases

- What happens when child taps multiple icons rapidly? Only the first tap registers, others are ignored for 500ms
- How does the app handle different screen sizes? UI scales appropriately for phones and tablets
- What happens if no mini-apps are registered? Hub shows a friendly "Coming Soon" message

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a launcher screen with icons for all registered mini-apps on startup
- **FR-002**: System MUST load a placeholder view within 2 seconds when a mini-app icon is tapped
- **FR-003**: System MUST use large touch targets (minimum 48dp) for all interactive elements
- **FR-004**: System MUST use bright, high-contrast colors suitable for young children
- **FR-005**: System MUST provide a way to access settings via parent-only gesture (long-press)
- **FR-006**: System MUST display app registry dynamically (mini-apps can be added/removed)
- **FR-007**: System MUST NOT contain any advertisements
- **FR-008**: System MUST NOT contain any in-app purchases
- **FR-009**: System MUST support rapid-tap prevention to avoid accidental double-launches
- **FR-010**: System MUST scale UI for screen sizes from 5 to 12 inches

### Key Entities

- **MiniApp**: A self-contained activity within the hub, with a unique identifier, display name, icon, and launch entry point
- **AppRegistry**: Central registry that tracks all available mini-apps and their metadata
- **UserSettings**: App-wide settings including parental gate configuration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Hub launcher loads within 2 seconds on mid-range Android devices
- **SC-002**: All touch targets meet 48dp minimum size requirement for accessibility
- **SC-003**: App achieves 100% crash-free rate during basic navigation testing
- **SC-004**: Settings screen is accessible only via parent gesture (not visible to children)

## Assumptions

- Target platform is Android (via Capacitor/Ionic framework like BabbyPaint)
- App will be distributed via F-Droid and GitHub releases (following BabbyPaint pattern)
- No backend services required - all functionality is local
- Mini-apps will be added in future phases
- Parental gate functionality (the actual challenge) will be added in a future phase
- App supports phones and tablets with screen sizes from 5 to 12 inches
- No user accounts or personalization required for v1
- App works entirely offline after installation
