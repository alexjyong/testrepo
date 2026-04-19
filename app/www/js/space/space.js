/**
 * SproutPlay - Space Hero (Star Bounce)
 * A kid-friendly breakout-style game
 */

const SpaceHero = (function() {
    // Game Constants
    const PADDLE_HEIGHT = 20;
    const PADDLE_WIDTH = 100;
    const BALL_RADIUS = 10;
    const BLOCK_ROWS = 4;
    const BLOCK_COLS = 6;
    const BLOCK_PADDING = 10;
    const BLOCK_OFFSET_TOP = 60;
    const BLOCK_OFFSET_LEFT = 30;
    const BALL_SPEED = 4;
    const BUMPER_COUNT = 3;

    // Game State
    let canvas, ctx;
    let paddleX;
    let ballX, ballY, ballDX, ballDY;
    let blocks = [];
    let powerups = [];
    let bumpersActive = BUMPER_COUNT;
    let score = 0;
    let gameActive = false;
    let ballLaunched = false;
    let animationId;
    let containerWidth, containerHeight;

    /**
     * Initialize the game
     */
    function init() {
        canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        // Setup resize
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Setup controls
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('touchstart', handleStart);

        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('play-again-btn').addEventListener('click', resetGame);
        document.getElementById('space-back').addEventListener('click', () => window.location.href = '../index.html');
        document.getElementById('celebration-back').addEventListener('click', () => window.location.href = '../index.html');

        resetGameState();
    }

    /**
     * Handle canvas resizing
     */
    function resizeCanvas() {
        const container = document.getElementById('game-container');
        containerWidth = container.clientWidth;
        containerHeight = container.clientHeight;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Re-center paddle if needed
        if (!gameActive) {
            paddleX = (canvas.width - PADDLE_WIDTH) / 2;
        }
        
        // Initialize blocks if not done
        if (blocks.length === 0) {
            initBlocks();
        }
    }

    /**
     * Initialize block grid
     */
    function initBlocks() {
        const availableWidth = containerWidth - (BLOCK_OFFSET_LEFT * 2);
        const blockWidth = (availableWidth / BLOCK_COLS) - BLOCK_PADDING;
        const blockHeight = 25;

        blocks = [];
        for (let c = 0; c < BLOCK_COLS; c++) {
            blocks[c] = [];
            for (let r = 0; r < BLOCK_ROWS; r++) {
                // Determine block type (kid friendly randomness)
                let type = 'standard';
                if (Math.random() > 0.8) type = 'strong';
                if (Math.random() > 0.95) type = 'powerup';

                blocks[c][r] = { 
                    x: 0, 
                    y: 0, 
                    status: type === 'strong' ? 2 : 1,
                    type: type,
                    width: blockWidth,
                    height: blockHeight
                };
            }
        }
    }

    /**
     * Reset game state for a new round
     */
    function resetGameState() {
        paddleX = (canvas.width - PADDLE_WIDTH) / 2;
        resetBall();
        bumpersActive = BUMPER_COUNT;
        updateBumpersUI();
        initBlocks();
        powerups = [];
        score = 0;
        ballLaunched = false;
        gameActive = false;
        
        document.getElementById('game-overlay').style.display = 'flex';
        document.getElementById('celebration').style.display = 'none';
        
        draw();
    }

    /**
     * Reset ball to paddle position
     */
    function resetBall() {
        ballX = paddleX + PADDLE_WIDTH / 2;
        ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 15;
        ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ballDY = -BALL_SPEED;
        ballLaunched = false;
    }

    /**
     * Update Bumper UI
     */
    function updateBumpersUI() {
        for (let i = 1; i <= BUMPER_COUNT; i++) {
            const bumper = document.getElementById(`bumper-${i}`);
            if (bumper) {
                if (i <= bumpersActive) {
                    bumper.classList.remove('broken');
                } else {
                    bumper.classList.add('broken');
                }
            }
        }
    }

    /**
     * Start the game loop
     */
    function startGame() {
        if (gameActive) return;
        
        // Initialize sound context
        if (window.Sound) window.Sound.init();
        
        gameActive = true;
        document.getElementById('game-overlay').style.display = 'none';
        
        if (!animationId) {
            gameLoop();
        }
    }

    function handleStart() {
        if (gameActive && !ballLaunched) {
            ballLaunched = true;
        }
    }

    function resetGame() {
        resetGameState();
    }

    /**
     * Input handlers
     */
    function handleMouseMove(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
        }
    }

    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const relativeX = touch.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
        }
    }

    /**
     * Core Game Loop
     */
    function gameLoop() {
        update();
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    /**
     * Update physics and logic
     */
    function update() {
        if (!gameActive) return;

        if (!ballLaunched) {
            ballX = paddleX + PADDLE_WIDTH / 2;
            return;
        }

        // Move ball
        ballX += ballDX;
        ballY += ballDY;

        // Wall collisions (Left/Right)
        if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
            ballDX = -ballDX;
        }

        // Ceiling collision
        if (ballY + ballDY < BALL_RADIUS) {
            ballDY = -ballDY;
        } 
        // Bottom collision (Paddle or Bumpers)
        else if (ballY + ballDY > canvas.height - BALL_RADIUS - 5) {
            // Paddle collision
            if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) {
                ballDY = -ballDY;
                // Add some angle variety based on where it hit the paddle
                let hitPos = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                ballDX = hitPos * BALL_SPEED;
                
                if (window.Sound) window.Sound.tone(400, 100, 'sine', 0.2);
            } else {
                // Bumper or Cushion
                if (bumpersActive > 0) {
                    bumpersActive--;
                    updateBumpersUI();
                    ballDY = -ballDY;
                    if (window.Sound) window.Sound.tone(150, 150, 'square', 0.2);
                } else {
                    // Cushion reset
                    if (window.Sound) window.Sound.tone(300, 400, 'sine', 0.2);
                    ballLaunched = false;
                    resetBall();
                }
            }
        }

        // Move and catch powerups
        for (let i = powerups.length - 1; i >= 0; i--) {
            let p = powerups[i];
            p.y += 2; // Falling speed

            // Catch by paddle
            if (p.y > canvas.height - PADDLE_HEIGHT - 20 && 
                p.y < canvas.height - 10 &&
                p.x > paddleX && p.x < paddleX + PADDLE_WIDTH) {
                
                // Effect: Restore Bumper
                if (bumpersActive < BUMPER_COUNT) {
                    bumpersActive++;
                    updateBumpersUI();
                    if (window.Sound) window.Sound.tone(600, 200, 'triangle', 0.3);
                }
                powerups.splice(i, 1);
            } 
            // Missed
            else if (p.y > canvas.height) {
                powerups.splice(i, 1);
            }
        }

        // Block collisions
        collisionDetection();

        // Check win condition
        checkWin();
    }

    /**
     * Detect collision with blocks
     */
    function collisionDetection() {
        const availableWidth = containerWidth - (BLOCK_OFFSET_LEFT * 2);
        const blockWidth = (availableWidth / BLOCK_COLS) - BLOCK_PADDING;
        const blockHeight = 25;

        for (let c = 0; c < BLOCK_COLS; c++) {
            for (let r = 0; r < BLOCK_ROWS; r++) {
                let b = blocks[c][r];
                if (b.status > 0) {
                    let bx = c * (blockWidth + BLOCK_PADDING) + BLOCK_OFFSET_LEFT;
                    let by = r * (blockHeight + BLOCK_PADDING) + BLOCK_OFFSET_TOP;
                    
                    if (ballX > bx && ballX < bx + blockWidth && ballY > by && ballY < by + blockHeight) {
                        ballDY = -ballDY;
                        b.status--;
                        
                        if (window.Sound) window.Sound.tone(800, 50, 'triangle', 0.2);
                        
                        // Spawn powerup
                        if (b.status === 0 && b.type === 'powerup') {
                            powerups.push({
                                x: bx + blockWidth / 2,
                                y: by + blockHeight / 2,
                                type: 'repair'
                            });
                        }
                    }
                }
            }
        }
    }

    function checkWin() {
        let allCleared = true;
        for (let c = 0; c < BLOCK_COLS; c++) {
            for (let r = 0; r < BLOCK_ROWS; r++) {
                if (blocks[c][r].status > 0) {
                    allCleared = false;
                    break;
                }
            }
        }

        if (allCleared && gameActive) {
            gameActive = false;
            document.getElementById('celebration').style.display = 'flex';
            if (window.Sound) window.Sound.celebrate();
        }
    }

    /**
     * Render the game
     */
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBlocks();
        drawBall();
        drawPaddle();
        drawPowerups();
    }

    function drawPowerups() {
        powerups.forEach(p => {
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', p.x, p.y);
            // Optional: Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#FFEB3B";
        });
        ctx.shadowBlur = 0;
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#FFEB3B";
        ctx.fill();
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFEB3B";
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.roundRect(paddleX, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 10);
        ctx.fillStyle = "#E91E63";
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#E91E63";
        ctx.closePath();
        ctx.shadowBlur = 0;
    }

    function drawBlocks() {
        const availableWidth = containerWidth - (BLOCK_OFFSET_LEFT * 2);
        const blockWidth = (availableWidth / BLOCK_COLS) - BLOCK_PADDING;
        const blockHeight = 25;

        for (let c = 0; c < BLOCK_COLS; c++) {
            for (let r = 0; r < BLOCK_ROWS; r++) {
                let b = blocks[c][r];
                if (b.status > 0) {
                    let bx = c * (blockWidth + BLOCK_PADDING) + BLOCK_OFFSET_LEFT;
                    let by = r * (blockHeight + BLOCK_PADDING) + BLOCK_OFFSET_TOP;
                    
                    ctx.beginPath();
                    ctx.roundRect(bx, by, blockWidth, blockHeight, 5);
                    
                    // Color based on status/type
                    if (b.type === 'powerup') {
                        ctx.fillStyle = "#00F2FF";
                    } else if (b.type === 'strong') {
                        ctx.fillStyle = b.status === 2 ? "#9C27B0" : "#BA68C8";
                    } else {
                        // Rainbow rows
                        const colors = ["#4CAF50", "#FFEB3B", "#FF9800", "#F44336"];
                        ctx.fillStyle = colors[r % colors.length];
                    }
                    
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    SpaceHero.init();
});
