# Spec: 003-Space-Hero (Star Bounce)

A kid-friendly breakout-style mini-app for SproutPlay.

## 1. Overview
"Star Bounce" is a space-themed ball-and-paddle game designed for children aged 3–7. The goal is to clear "Space Junk" (blocks) by bouncing a "Sparkle Ball" off a "Space Hero" paddle.

## 2. Core Mechanics

### 2.1 Movement
- **Paddle:** Follows the user's touch/mouse horizontally at the bottom of the screen.
- **Ball:** Moves at a constant, kid-appropriate speed (slow enough for a 3-year-old to track), bouncing off walls, blocks, and the paddle. Speed is frame-rate independent via delta-time normalization so the game plays the same on 60Hz and 120Hz devices.
- **Launch:** The ball starts attached to the paddle and launches on the first tap.

### 2.2 The "Challenge" (Bumper Guard System)
To keep the game challenging but fair:
- **Energy Bumpers:** Three glowing bars sit at the bottom of the screen.
- **The Save:** If the ball misses the paddle, it bounces off a Bumper.
- **Breaking:** A Bumper breaks after one hit (visual "poof" effect).
- **Game Over:** If all 3 Bumpers are gone and the ball falls past the paddle, the game ends. A "Game Over" overlay appears showing the final score, with options to "Play Again" or "Back to Hub."
- **Repair Star:** Occasionally, a broken block drops a "Repair Star." Catching it restores one Bumper.

### 2.3 Blocks (Space Junk)
- **Standard Blocks:** 1 hit to break.
- **Strong Blocks:** 2 hits (cracks on first hit).
- **Power-up Blocks:** Contains a "Repair Star" or "Giant Ball" effect.

## 3. Visuals & Audio

### 3.1 Visual Style
- **Background:** Deep space (dark purple/black) with twinkling stars.
- **Paddle:** A bright, high-contrast spaceship or platform (e.g., #E91E63).
- **Blocks:** Neon colors (Green, Yellow, Cyan).
- **Animations:** Blocks should "pop" or "shimmer" when hit.

### 3.2 Sound Effects (via Sound.js)
- **Paddle Hit:** Mid-range "boing" tone.
- **Block Hit:** High-pitched "pop" or "chime".
- **Bumper Hit:** Lower "thump" or "buzz".
- **Cushion Land / Game Over:** Gentle "whoosh" or descending tone.
- **All sounds must actually play** — the shared Sound module exposes its `tone()` method so that Space Hero (and other mini-apps) can play custom tones.

## 4. Technical Requirements
- **Container:** `app/www/space/index.html`
- **Logic:** `app/www/js/space/space.js`
- **Styles:** `app/www/css/space.css`
- **Input:** Touch events (with mouse fallback).
- **Loop:** `requestAnimationFrame` with delta-time normalization for consistent speed across frame rates.
