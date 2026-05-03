# Data Model: SproutPlay

**Feature**: SproutPlay Kids App Hub - Phase 1 (Framework)
**Branch**: `001-sproutplay-hub`

## Core Entities

### MiniApp

Represents a mini-app available in the hub.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (e.g., "paint", "memory", "coloring") |
| name | string | Display name shown in launcher (e.g., "Paint", "Memory Game") |
| icon | string | Path to icon image or emoji (e.g., "🎨", "/icons/paint.png") |
| path | string | Path to the mini-app's HTML/JS entry point |
| description | string | Short description for accessibility |
| backgroundColor | string | Background color for the app's launcher tile |
| enabled | boolean | Whether the app is available (for future feature flags) |
| placeholder | boolean | Whether this is a placeholder (true for Phase 1) |

**Example**:
```javascript
{
  id: "paint",
  name: "Paint",
  icon: "🎨",
  path: "js/paint/paint.js",
  description: "Draw and paint with colors",
  backgroundColor: "#FF6B6B",
  enabled: true,
  placeholder: true
}
```

---

### AppRegistry

Central registry that manages all available mini-apps.

| Field | Type | Description |
|-------|------|-------------|
| apps | MiniApp[] | Array of registered mini-apps |
| version | string | Registry version for migration tracking |

**Methods**:
- `register(app: MiniApp)`: Add a mini-app to the registry
- `getAll()`: Return all enabled mini-apps
- `getById(id: string)`: Get a specific mini-app by ID
- `launch(id: string)`: Launch a mini-app by ID

**Example**:
```javascript
const registry = {
  apps: [
    {
      id: "placeholder-1",
      name: "Coming Soon",
      icon: "🚀",
      path: "views/placeholder.html",
      description: "New app coming soon",
      backgroundColor: "#4ECDC4",
      enabled: true,
      placeholder: true
    }
  ]
};
```

---

### UserSettings

App-wide user/parent settings.

| Field | Type | Description |
|-------|------|-------------|
| parentalGateEnabled | boolean | Whether parental gate is active |
| parentalGateHoldDuration | number | Duration in ms for hold challenge (default: 3000) |
| soundEnabled | boolean | Whether sound effects are on (future) |
| lastAppId | string | Last opened mini-app (future) |
| firstLaunch | boolean | Whether this is first app launch |

**Example**:
```javascript
{
  parentalGateEnabled: false,
  parentalGateHoldDuration: 3000,
  soundEnabled: true,
  firstLaunch: true
}
```

---

## Relationships

```
UserSettings
  └── parentalGateEnabled: boolean
  └── parentalGateHoldDuration: number

AppRegistry
  └── apps: MiniApp[]
```

---

## State Machine: App Navigation (Phase 1)

```
[Splash Screen]
       │
       └─(loaded)─→ [Hub Launcher]
                         │
                         ├─(tap app)─→ [Placeholder View]
                         │                  │
                         │                  └─(back)─→ [Hub Launcher]
                         │
                         ├─(long-press)─→ [Settings Screen]
                         │                     │
                         │                     └─(back)─→ [Hub Launcher]
                         │
                         └─(back, gate disabled)─→ [Exit App]
```

---

## Validation Rules

| Entity | Rule |
|--------|------|
| MiniApp.id | Must be unique, lowercase, alphanumeric with hyphens |
| MiniApp.name | Must be 1-20 characters |
| MiniApp.icon | Must be emoji or valid image path |
| UserSettings.parentalGateHoldDuration | Must be between 1000ms and 10000ms |

---

## Extension Points

For future mini-apps, add new entries to the AppRegistry:

```javascript
// Example: Adding a paint game (future phase)
{
  id: "paint",
  name: "Paint",
  icon: "🎨",
  path: "js/paint/paint.js",
  description: "Draw and paint with colors",
  backgroundColor: "#FF6B6B",
  enabled: true,
  placeholder: false
}
```
