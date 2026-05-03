# Tasks: SproutPlay Kids App Hub - Phase 1 (Framework & Main Menu)

**Input**: Design documents from `/specs/001-sproutplay-hub/`
**Prerequisites**: plan.md, spec.md

**Tests**: Manual testing following BabbyPaint pattern. Automated tests optional.

**Scope**: This phase focuses on app framework and main menu only. Mini-apps will be added in future phases.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create SproutPlay project directory structure following plan.md
- [x] T002 [P] Initialize npm project with package.json (name: dev.coolorg.sproutplay)
- [ ] T003 [P] Install Capacitor dependencies (@capacitor/core, @capacitor/android)
- [ ] T004 [P] Install Capacitor CLI tools (@capacitor/cli, @capacitor/assets)
- [x] T005 Create capacitor.config.ts with app configuration
- [x] T006 Set up basic directory structure: app/www/js/, app/www/css/, app/resources/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create AppRegistry module in app/www/js/registry.js
- [x] T008 [P] Create router/navigation module in app/www/js/router.js
- [x] T009 Create settings storage module in app/www/js/settings.js (localStorage wrapper)
- [x] T010 Create base CSS styles in app/www/css/base.css (colors, typography, touch targets)
- [x] T011 Create main index.html with app container structure
- [x] T012 Create app.js entry point that initializes the hub

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Hub Launcher (Priority: P1) 🎯 MVP

**Goal**: Create the hub launcher screen that displays mini-app icons

**Independent Test**: Can be fully tested by opening the app and seeing the launcher screen with app icons displayed

### Implementation for User Story 1

- [x] T013 [P] [US1] Create hub launcher HTML structure in app/www/index.html
- [x] T014 [P] [US1] Create hub styles in app/www/css/hub.css (grid layout, large icons, bright colors)
- [x] T015 [P] [US1] Create hub.js module with launcher logic in app/www/js/hub.js
- [x] T016 [US1] Implement app icon rendering from AppRegistry in hub.js
- [x] T017 [US1] Add tap/click event handlers for launching mini-apps
- [x] T018 [US1] Implement router.navigate() to switch views
- [x] T019 [US1] Add rapid-tap prevention (500ms debounce)
- [x] T020 [US1] Create placeholder view for mini-app content
- [x] T021 [US1] Register 2-3 placeholder mini-apps in AppRegistry (for testing)
- [ ] T022 [US1] Test: Hub displays all registered mini-app icons
- [ ] T023 [US1] Test: Tapping icon loads placeholder view

**Checkpoint**: At this point, User Story 1 should be fully functional - hub displays and can navigate to placeholder views

---

## Phase 4: User Story 2 - Parent Settings Access (Priority: P2)

**Goal**: Implement parent-only settings access via long-press gesture

**Independent Test**: Can be fully tested by long-pressing a corner of the hub to access settings

### Implementation for User Story 2

- [x] T024 [P] [US2] Create settings screen HTML in app/www/index.html
- [x] T025 [P] [US2] Create settings styles in app/www/css/settings.css
- [x] T026 [US2] Implement long-press gesture detector in app/www/js/gesture.js
- [x] T027 [US2] Add settings icon/button to hub (hidden or subtle)
- [x] T028 [US2] Create settings.js module for settings screen logic in app/www/js/settings.js
- [x] T029 [US2] Add parental gate toggle UI (checkbox/switch)
- [x] T030 [US2] Implement settings persistence in localStorage
- [x] T031 [US2] Add back navigation from settings to hub
- [ ] T032 [US2] Test: Long-press opens settings
- [ ] T033 [US2] Test: Settings toggle saves state
- [ ] T034 [US2] Test: Back button returns to hub

**Checkpoint**: At this point, User Stories 1 AND 2 both work - hub displays apps and parents can access settings

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Add app icons and splash screens in app/resources/ (placeholder)
- [x] T036 [P] Update README.md with SproutPlay description and build instructions
- [x] T037 [P] Update package.json with correct name, version, description
- [ ] T038 Add smooth transitions between hub and placeholder views
- [ ] T039 Ensure all touch targets meet 48dp minimum
- [ ] T040 Test on multiple screen sizes (phone and tablet)
- [ ] T041 Run quickstart.md validation scenarios
- [ ] T042 Build APK using build.sh
- [ ] T043 Test APK on physical Android device
- [ ] T044 Fix any crashes or critical bugs found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-4)**: All depend on Foundational phase completion
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1

### Within Each User Story

- Models/utilities before UI components
- Core implementation before integration with hub
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T004)
- All Foundational tasks marked [P] can run in parallel (T007-T008)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Within each user story, tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all parallel foundational tasks together:
Task: "T007 [P] Create AppRegistry module in app/www/js/registry.js"
Task: "T008 [P] Create router/navigation module in app/www/js/router.js"
```

---

## Parallel Example: User Story 1 (Hub Launcher)

```bash
# Launch all parallel hub tasks together:
Task: "T013 [P] [US1] Create hub launcher HTML structure in app/www/index.html"
Task: "T014 [P] [US1] Create hub styles in app/www/css/hub.css"
Task: "T015 [P] [US1] Create hub.js module with launcher logic in app/www/js/hub.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Hub Launcher)
4. **STOP and VALIDATE**: Test hub displays and navigates to placeholder views
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Hub) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Settings) → Test independently → Deploy/Demo
4. Future: Add mini-apps in separate features

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow BabbyPaint patterns for Capacitor setup and build process
- Package name: dev.coolorg.sproutplay
- Placeholder mini-apps will be replaced with real apps in future phases
