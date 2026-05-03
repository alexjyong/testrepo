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
  const BALL_SPEED = 3.5;
  const HEART_COUNT = 3;
  const FRAME_TIME = 1000 / 60;
  const MAX_DELTA = FRAME_TIME * 2;

  // Game State
  let canvas, ctx;
  let paddleX;
  let ballX, ballY, ballDX, ballDY;
  let blocks = [];
  let powerups = [];
  let heartsActive = HEART_COUNT;
  let score = 0;
  let gameActive = false;
  let ballLaunched = false;
  let animationId;
  let lastTime = 0;
  let containerWidth, containerHeight;
let touchStartTime = 0;
const TOUCH_LAUNCH_GRACE_MS = 150;

  function init() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('touchstart', handleStart);

    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('play-again-btn').addEventListener('click', resetGame);
    document.getElementById('gameover-play-again-btn').addEventListener('click', resetGame);
    document.getElementById('gameover-back-btn').addEventListener('click', () => window.location.href = '../index.html');
    document.getElementById('space-back').addEventListener('click', () => window.location.href = '../index.html');
    document.getElementById('celebration-back').addEventListener('click', () => window.location.href = '../index.html');

    resetGameState();
  }

  function resizeCanvas() {
    const container = document.getElementById('game-container');
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    if (!gameActive) {
      paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    }

    if (blocks.length === 0) {
      initBlocks();
    }
  }

  function initBlocks() {
    const availableWidth = containerWidth - (BLOCK_OFFSET_LEFT * 2);
    const blockWidth = (availableWidth / BLOCK_COLS) - BLOCK_PADDING;
    const blockHeight = 25;

    blocks = [];
    for (let c = 0; c < BLOCK_COLS; c++) {
      blocks[c] = [];
      for (let r = 0; r < BLOCK_ROWS; r++) {
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

  function resetGameState() {
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    resetBall();
    heartsActive = HEART_COUNT;
    updateHeartsUI();
    initBlocks();
    powerups = [];
    score = 0;
    ballLaunched = false;
    gameActive = false;

    document.getElementById('game-overlay').style.display = 'flex';
    document.getElementById('celebration').style.display = 'none';
    document.getElementById('gameover').style.display = 'none';

    draw();
  }

  function resetBall() {
    ballX = paddleX + PADDLE_WIDTH / 2;
    ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 15;
    ballDX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ballDY = -BALL_SPEED;
    ballLaunched = false;
  }

  function updateHeartsUI() {
    for (let i = 1; i <= HEART_COUNT; i++) {
      const heart = document.getElementById(`heart-${i}`);
      if (heart) {
        if (i <= heartsActive) {
          heart.classList.remove('broken');
        } else {
          heart.classList.add('broken');
        }
      }
    }
  }

  function startGame() {
    if (gameActive) return;

    if (Sound) Sound.init();

    gameActive = true;
    lastTime = performance.now();
    document.getElementById('game-overlay').style.display = 'none';

    if (!animationId) {
      gameLoop(performance.now());
    }
  }

function handleStart() {
  touchStartTime = Date.now();
  if (gameActive && !ballLaunched) {
    if (Sound) Sound.init();
    ballLaunched = true;
  }
}

  function resetGame() {
    resetGameState();
  }

  function handleMouseMove(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - PADDLE_WIDTH / 2;
    }
  }

function handleTouchMove(e) {
  e.preventDefault();
  const timeSinceTouchStart = Date.now() - touchStartTime;
  if (timeSinceTouchStart < TOUCH_LAUNCH_GRACE_MS) {
    return;
  }
  const touch = e.touches[0];
  const relativeX = touch.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - PADDLE_WIDTH / 2;
  }
}

  function gameLoop(timestamp) {
    let delta = timestamp - lastTime;
    lastTime = timestamp;

    if (delta > MAX_DELTA) delta = MAX_DELTA;

    const dt = delta / FRAME_TIME;

    update(dt);
    draw();
    animationId = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    if (!gameActive) return;

    if (!ballLaunched) {
      ballX = paddleX + PADDLE_WIDTH / 2;
      return;
    }

    ballX += ballDX * dt;
    ballY += ballDY * dt;

    // Wall collisions (Left/Right)
    if (ballX < BALL_RADIUS) {
      ballX = BALL_RADIUS;
      ballDX = -ballDX;
    } else if (ballX > canvas.width - BALL_RADIUS) {
      ballX = canvas.width - BALL_RADIUS;
      ballDX = -ballDX;
    }

    // Ceiling collision
    if (ballY < BALL_RADIUS) {
      ballY = BALL_RADIUS;
      ballDY = -ballDY;
    }

    // Paddle collision
    const paddleTop = canvas.height - PADDLE_HEIGHT - 10;
    if (ballDY > 0 && 
        ballY + BALL_RADIUS > paddleTop && 
        ballY - BALL_RADIUS < paddleTop + PADDLE_HEIGHT &&
        ballX > paddleX && 
        ballX < paddleX + PADDLE_WIDTH) {
      
      // Bounce off paddle
      ballDY = -Math.abs(ballDY);
      // Snap to above paddle to avoid multi-collision
      ballY = paddleTop - BALL_RADIUS;
      
      // Angle based on where it hit the paddle
      let hitPos = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
      ballDX = hitPos * BALL_SPEED * 1.5;

      if (Sound) Sound.tone(400, 100, 'sine', 0.2);
    }
    // Bottom collision (Bumpers or Game Over)
    else if (ballY + BALL_RADIUS > canvas.height) {
      heartsActive--;
      if (heartsActive > 0) {
        updateHeartsUI();
        ballDY = -Math.abs(ballDY);
        ballY = canvas.height - BALL_RADIUS - 5; // Bounce up
        if (Sound) Sound.tone(150, 150, 'square', 0.2);
      } else {
        gameOver();
      }
    }

    // Move and catch powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      let p = powerups[i];
      p.y += 2 * dt;

      if (p.y > canvas.height - PADDLE_HEIGHT - 20 &&
          p.y < canvas.height - 10 &&
          p.x > paddleX && p.x < paddleX + PADDLE_WIDTH) {

        if (heartsActive < HEART_COUNT) {
          heartsActive++;
          updateHeartsUI();
          if (Sound) Sound.tone(600, 200, 'triangle', 0.3);
        }
        powerups.splice(i, 1);
      }
      else if (p.y > canvas.height) {
        powerups.splice(i, 1);
      }
    }

    collisionDetection();
    checkWin();
  }

  function gameOver() {
    gameActive = false;
    if (Sound) Sound.tone(200, 400, 'sawtooth', 0.15);
    document.getElementById('gameover-score').textContent = score;
    document.getElementById('gameover').style.display = 'flex';
  }

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

          if (ballX + BALL_RADIUS > bx && ballX - BALL_RADIUS < bx + blockWidth && 
              ballY + BALL_RADIUS > by && ballY - BALL_RADIUS < by + blockHeight) {
            ballDY = -ballDY;
            b.status--;
            score += 10;

            if (Sound) Sound.tone(800, 50, 'triangle', 0.2);

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
      if (Sound) Sound.celebrate();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBlocks();
    drawBall();
    drawPaddle();
    drawPowerups();
    drawScore();
  }

  function drawScore() {
    const heartsWidth = HEART_COUNT * 40 + (HEART_COUNT - 1) * 15;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 0;
    ctx.fillText('Score: ' + score, heartsWidth + 20, 10);
  }

  function drawPowerups() {
    powerups.forEach(p => {
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', p.x, p.y);
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

          if (b.type === 'powerup') {
            ctx.fillStyle = "#00F2FF";
          } else if (b.type === 'strong') {
            ctx.fillStyle = b.status === 2 ? "#9C27B0" : "#BA68C8";
          } else {
            const colors = ["#4CAF50", "#FFEB3B", "#FF9800", "#F44336"];
            ctx.fillStyle = colors[r % colors.length];
          }

          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', () => {
  SpaceHero.init();
});
