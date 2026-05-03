# Requirements Checklist - Star Bounce

## Gameplay Integrity
- [x] Ball speed is kid-appropriate and frame-rate independent (delta-time normalized)
- [x] Game ends when all bumpers are depleted and ball falls past paddle
- [x] Game Over overlay shows score with Play Again / Back to Hub options
- [ ] Paddle hitbox is generous (kid-friendly).
- [ ] Blocks are large enough to see clearly on small screens.

## Visuals
- [x] High contrast colors for ball and paddle.
- [ ] Starry background doesn't distract from gameplay.
- [x] Clear visual indication when a Bumper is broken.

## Audio
- [x] Sounds are pleasant, not jarring.
- [x] Sound system initializes correctly on first touch.
- [x] Sound.tone() is exposed in public API for custom tones.
- [x] Paddle hit, block hit, bumper hit, and game-over all produce sounds.

## Integration
- [ ] "Back" button works and returns to Hub.
- [ ] Correct icon (🚀) and name (Space Hero) in Hub.
