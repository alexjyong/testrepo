# Data Model: Number/Letter Tracer Game

**Feature**: 010-number-letter-tracer
**Date**: 2026-06-18

---

## Entity 1: Character Path

**Description**: SVG path data defining the dashed outline and stroke order for each traceable character (numbers 0-9, uppercase letters A-Z).

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `character` | String | Single character (e.g., "0", "A", "Z") | Must be a single digit (0-9) or uppercase letter (A-Z) |
| `paths` | Array of Strings | SVG path strings for each stroke (e.g., `["M 50 10 L 90 90", "M 30 50 L 70 50"]`) | Must contain 1-4 paths (most characters have 1-3 strokes) |
| `strokeOrder` | Array of Numbers | Numbered start points showing stroke sequence (e.g., `[1, 2]` for "A" with 2 strokes) | Must match `paths.length`; values must be sequential (1, 2, 3...) |
| `boundingBox` | Object | Spatial bounds: `{ x: Number, y: Number, width: Number, height: Number }` | `width` and `height` must be > 0; `x` and `y` must be >= 0 |
| `exampleWord` | String (optional) | Word example for letters (e.g., "Apple" for "A") | Only required for letters; can be null for numbers |
| `category` | String (optional) | Word category for words (e.g., "animals", "colors") | Only used in Word Mode; can be null for numbers/single letters |

### Example

```javascript
{
    "character": "A",
    "paths": [
        "M 50 10 L 20 90",  // Left diagonal (stroke 1)
        "M 50 10 L 80 90",  // Right diagonal (stroke 2)
        "M 35 60 L 65 60"   // Crossbar (stroke 3)
    ],
    "strokeOrder": [1, 2, 3],
    "boundingBox": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100
    },
    "exampleWord": "Apple",
    "category": "fruits"
}
```

### Relationships

- **One-to-One**: Each character (0-9, A-Z) has exactly one Character Path entry
- **Used By**: `TraceSession` references Character Path data when rendering characters

---

## Entity 2: Trace Session

**Description**: Tracks the child's current progress during a game session, including mode, difficulty, and per-character trace results.

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `mode` | String | Current game mode: `"numbers"`, `"letters"`, `"multi-digit"`, `"words"` | Must be one of the four allowed values |
| `difficulty` | String | Current difficulty level: `"easy"`, `"medium"`, `"hard"` | Must be one of the three allowed values |
| `currentCharacterIndex` | Number | Index of the current character in the game sequence (0-based) | Must be >= 0 and < `characters.length` |
| `charactersTraced` | Array of Objects | Array of traced characters with results: `{ character, success, timestamp }` | Must contain 1+ entries; `success` must be boolean |
| `successCount` | Number | Total successful traces in current session | Must be >= 0 |
| `failureCount` | Number | Total failed traces in current session | Must be >= 0 |
| `hintsShown` | Number | Total hints shown in current session | Must be >= 0 |
| `setComplete` | Boolean | Whether the current set (e.g., 3 numbers) is complete | Must be boolean |
| `startTime` | Number (timestamp) | Session start time (Unix timestamp in ms) | Must be valid timestamp |
| `lastSaved` | Number (timestamp) | Last save time to localStorage (Unix timestamp in ms) | Must be valid timestamp; >= `startTime` |

### Example

```javascript
{
    "mode": "letters",
    "difficulty": "easy",
    "currentCharacterIndex": 2,
    "charactersTraced": [
        { "character": "A", "success": true, "timestamp": 1718640000000 },
        { "character": "B", "success": true, "timestamp": 1718640005000 },
        { "character": "C", "success": false, "timestamp": 1718640010000 }
    ],
    "successCount": 2,
    "failureCount": 1,
    "hintsShown": 1,
    "setComplete": false,
    "startTime": 1718640000000,
    "lastSaved": 1718640010000
}
```

### Relationships

- **Uses**: References `Character Path` data when rendering characters (by `character` field)
- **Saves To**: Persisted to localStorage via existing `Settings` module (key: `sproutplay_settings.tracer_session`)
- **Validated By**: `GameConfiguration` determines tolerance, set size, and hint frequency based on `difficulty`

---

## Entity 3: Game Configuration

**Description**: Settings that control game behavior, loaded from localStorage and configurable by parents via the Settings screen.

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `defaultMode` | String | Default game mode on app launch: `"numbers"`, `"letters"`, `"multi-digit"`, `"words"` | Must be one of the four allowed values |
| `defaultDifficulty` | String | Default difficulty on app launch: `"easy"`, `"medium"`, `"hard"` | Must be one of the three allowed values |
| `setSize` | Number | Number of characters per celebration set (e.g., 3 numbers = 1 set) | Must be >= 3 and <= 8 |
| `tracingTolerance` | Number | Allowed deviation from path (percentage: 20-50) | Must be >= 20 and <= 50; derived from `difficulty` |
| `hintFrequency` | Number | When to show hints (number of mistakes before hint appears) | Must be >= 1 and <= 3; derived from `difficulty` |
| `showStrokeHints` | Boolean | Whether stroke-order hints are always visible (Easy) or hidden (Hard) | Must be boolean; derived from `difficulty` |
| `selectedMode` | String | Currently selected mode (can differ from `defaultMode` if child changes it) | Must be one of the four allowed values; can be null (uses `defaultMode`) |
| `selectedDifficulty` | String | Currently selected difficulty (can differ from `defaultDifficulty`) | Must be one of the three allowed values; can be null (uses `defaultDifficulty`) |
| `progressUnlocked` | Object | Milestones unlocked: `{ easy: boolean, medium: boolean, hard: boolean }` | Must contain all three keys; values must be boolean |

### Tolerance/Difficulty Mapping

| Difficulty | `tracingTolerance` | `setSize` | `hintFrequency` | `showStrokeHints` |
|------------|-------------------|-----------|-----------------|-------------------|
| `"easy"` | 50% | 3 | 1 (after 1 mistake) | `true` (always visible) |
| `"medium"` | 35% | 5 | 1 (after 1 mistake) | `false` (after 1 mistake) |
| `"hard"` | 20% | 8 | 3 (after 3 mistakes) | `false` (after 3 mistakes) |

### Example

```javascript
{
    "defaultMode": "numbers",
    "defaultDifficulty": "easy",
    "setSize": 3,
    "tracingTolerance": 50,
    "hintFrequency": 1,
    "showStrokeHints": true,
    "selectedMode": "letters",
    "selectedDifficulty": "medium",
    "progressUnlocked": {
        "easy": true,
        "medium": false,
        "hard": false
    }
}
```

### Relationships

- **Loaded By**: `TraceSession` reads configuration from localStorage on init
- **Persisted To**: Saved to localStorage via existing `Settings` module (key: `sproutplay_settings.tracer_config`)
- **Validates**: `TraceSession` uses `tracingTolerance`, `setSize`, `hintFrequency` to validate traces

---

## Entity 4: Word Entry

**Description**: For Word Mode, each word contains the word string, individual letters, meaning (fun fact with emoji), and category.

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `word` | String | Full word (e.g., "CAT") | Must be 3-6 uppercase letters; no spaces or special characters |
| `letters` | Array of Strings | Individual letters: `["C", "A", "T"]` | Must match `word.split('')`; length must be 3-6 |
| `meaning` | String | Fun fact with emoji (e.g., "A furry animal that says meow! 🐱") | Must be non-empty; can contain emojis |
| `category` | String | Word category (e.g., "animals", "colors", "fruits") | Must be non-empty; used for grouping words by difficulty |

### Example

```javascript
{
    "word": "CAT",
    "letters": ["C", "A", "T"],
    "meaning": "A furry animal that says meow! 🐱",
    "category": "animals"
}
```

### Relationships

- **Used By**: `TraceSession` in Word Mode references Word Entry data when rendering letter slots
- **Grouped By**: `category` is used to group words by difficulty (3-letter simple words first, then 4-5 letter words)
- **Validated By**: `letters.length` must match `word.length`; both must be 3-6 characters

---

## Entity 5: Trace Result

**Description**: Per-character trace result, saved to `TraceSession.charactersTraced` array.

### Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `character` | String | The character traced (e.g., "A", "42", "CAT") | Must match a Character Path or Word Entry |
| `success` | Boolean | Whether the trace was successful (within tolerance) | Must be boolean |
| `timestamp` | Number (timestamp) | When the trace completed (Unix timestamp in ms) | Must be valid timestamp |
| `mistakesCount` | Number (optional) | Number of mistakes made during trace | Must be >= 0; only required if `success` is false |
| `hintsUsed` | Number (optional) | Number of hints used during trace | Must be >= 0; only required if hints were shown |

### Example

```javascript
{
    "character": "A",
    "success": true,
    "timestamp": 1718640000000,
    "mistakesCount": 0,
    "hintsUsed": 0
}
```

### Relationships

- **Contains**: References `Character Path` or `Word Entry` by `character` field
- **Stored In**: Part of `TraceSession.charactersTraced` array
- **Used For**: Calculating `successCount`, `failureCount`, and determining when to show hints

---

## Entity Relationships Diagram

```
Character Path (36 base characters: 0-9, A-Z)
    │
    └─── Used By ───► TraceSession (current game state)
                         │
                         ├─── References ───► GameConfiguration (settings)
                         │
                         └─── Contains ───► Trace Result (per-character)
                                               │
                                               └─── References ───► Character Path or Word Entry

Word Entry (64 words: 3-6 letters)
    │
    └─── Used By ───► TraceSession (Word Mode only)
```

---

## Validation Rules Summary

| Entity | Field | Rule | Error if Violated |
|--------|-------|------|-------------------|
| Character Path | `character` | Must be single digit (0-9) or uppercase letter (A-Z) | Character not found error |
| Character Path | `paths.length` | Must be 1-4 paths (most characters have 1-3 strokes) | Rendering error (no path to draw) |
| Trace Session | `mode` | Must be one of: "numbers", "letters", "multi-digit", "words" | Game mode error (fallback to "numbers") |
| Trace Session | `difficulty` | Must be one of: "easy", "medium", "hard" | Difficulty error (fallback to "easy") |
| Game Configuration | `setSize` | Must be >= 3 and <= 8 | Set size error (fallback to 3) |
| Game Configuration | `tracingTolerance` | Must be >= 20 and <= 50 | Tolerance error (fallback to 50) |
| Word Entry | `word.length` | Must be 3-6 letters | Word length error (skip word) |
| Word Entry | `letters.length` | Must match `word.split('').length` | Data integrity error (log warning) |

---

## localStorage Keys

| Key | Entity | Format |
|-----|--------|--------|
| `sproutplay_settings.tracer_config` | Game Configuration | JSON object |
| `sproutplay_settings.tracer_session` | Trace Session | JSON object |

**Note**: Both keys follow existing SproutPlay convention (`sproutplay_settings.<module>`) and are managed by the existing `Settings` module.
