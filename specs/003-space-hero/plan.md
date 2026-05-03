# Implementation Plan - Star Bounce (Space Hero)

Step-by-step guide to building the kid-friendly breakout game.

## Phase 1: Foundation & Entry Point
- [ ] Enable the 'space' app in `app/www/js/registry.js`.
- [ ] Create folder structure: `app/www/space/`, `app/www/js/space/`.
- [ ] Create `app/www/space/index.html` with the canvas and UI containers.
- [ ] Create `app/www/css/space.css` with the space theme.

## Phase 2: Core Engine (Physics)
- [ ] Initialize Canvas and Game Loop (`requestAnimationFrame`).
- [ ] Implement Paddle movement (Touch/Mouse).
- [ ] Implement Ball physics (Bounce off walls and paddle).
- [ ] Implement Block grid generation and collision.

## Phase 3: The "Challenge" & Power-ups
- [ ] Implement the Energy Bumper system (3 bars).
- [ ] Implement the "Cushion Reset" when bumpers are gone.
- [ ] Implement Power-up drops (Repair Star).

## Phase 4: Polish & Audio
- [ ] Connect `Sound.js` for hit effects and background ambiance.
- [ ] Add particle effects for block "popping."
- [ ] Add "You Won!" celebration screen (similar to ABC game).

## Phase 5: Testing
- [ ] Verify touch responsiveness on mobile.
- [ ] Ensure "Next Level" or "Play Again" flows correctly.
