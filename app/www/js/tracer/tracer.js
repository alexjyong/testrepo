/**
 * SproutPlay - Tracer Mini-App
 * A kid-friendly tracing game where children practice fine motor skills
 * by tracing numbers (0-100) and letters (A-Z) with their finger.
 *
 * Features:
 *   - 4 game modes: Numbers, Letters, Multi-Digit, Words
 *   - 3 difficulty levels: Easy (50% tolerance), Medium (35%), Hard (20%)
 *   - Canvas-based 60fps rendering with real-time glow trail effects
 *   - Stroke-order hints (numbered start points, directional arrows)
 *   - TTS pronunciation via Capacitor TextToSpeech plugin
 *   - Celebration screens with animations and sounds
 *   - Progress persistence via localStorage (Settings module)
 *
 * Dependencies (loaded before this file by index.html):
 *   - Sound    (window.Sound)    — audio playback, TTS
 *   - Paths    (window.Paths)    — SVG path data for all characters
 *   - Settings (window.Settings) — sound enabled/disabled toggle
 */

/* global Paths, Sound */
const Tracer = (function () {

    // ── DOM refs ─────────────────────────────────────────────────
    var canvas, ctx;
    var modeSelect, difficultySelect;
    var celebrationEl, celebrationTitle, celebrationMsg;
    var playAgainBtn, celebrationBack;

    // ── State ─────────────────────────────────────────────────────
    var currentMode = "numbers";          // "numbers" | "letters" | "multi-digit" | "words"
    var currentDifficulty = "easy";       // "easy" | "medium" | "hard"
    var currentCharacter = null;          // Current character string (e.g., "A", "42", "CAT")
    var currentWordEntry = null;          // Word entry object (for Word Mode)
    var isTracing = false;                // Is finger currently on canvas?
    var tracePoints = [];                 // Array of {x, y} touch points
    var mistakesCount = 0;                // Mistakes on current character
    var hintsUsed = 0;                    // Hints shown for current character
    var successCount = 0;                 // Total successful traces in session
    var failureCount = 0;                 // Total failed traces in session
    var charactersTraced = [];            // Array of {character, success, timestamp, mistakesCount, hintsUsed}
    var setComplete = false;              // Whether current celebration set is complete
    var charactersPerSet = 3;             // Configurable by difficulty
    var tracingTolerance = 50;            // Allowed deviation % (20-50)
    var hintFrequency = 1;                // When to show hints (mistakes before hint)
    var showStrokeHints = true;           // Always visible (Easy) or hidden (Hard)
    var currentCharacterIndex = 0;        // Index in the character sequence (multi-digit/word)
    var characterSequence = [];           // Array of characters for current game (e.g., ["4", "2"] or ["C","A","T"])
    var lastTouchTime = 0;                // Debounce timer (ms since last touch)
    var renderLoopId = null;              // requestAnimationFrame ID
    var hintAnimFrame = 0;                // For animated hint pulse

    // ── Canvas sizing constants ───────────────────────────────────
    var CANVAS_PADDING = 20;              // Padding around character in coordinate space
    var BASE_CHAR_SIZE = 100;             // Base character size in path data coords

    // ── Difficulty config ─────────────────────────────────────────
    var DIFFICULTY_CONFIG = {
        "easy":   { tolerance: 50, setSize: 3, hintFrequency: 1, showHints: true },
        "medium": { tolerance: 35, setSize: 5, hintFrequency: 1, showHints: false },
        "hard":   { tolerance: 20, setSize: 8, hintFrequency: 3, showHints: false }
    };

    // ── Init ──────────────────────────────────────────────────────

    function init() {
        // Cache DOM elements
        canvas            = document.getElementById('tracer-canvas');
        modeSelect        = document.getElementById('mode-select');
        difficultySelect  = document.getElementById('difficulty-select');
        celebrationEl     = document.getElementById('celebration');
        celebrationTitle  = document.getElementById('celebration-title');
        celebrationMsg    = document.getElementById('celebration-msg');
        playAgainBtn      = document.getElementById('play-again-btn');
        celebrationBack   = document.getElementById('celebration-back');

        // Wire up navigation
        var backBtn = document.getElementById('tracer-back');
        if (backBtn) backBtn.addEventListener('click', goToHub);
        if (celebrationBack) celebrationBack.addEventListener('click', goToHub);
        if (playAgainBtn) playAgainBtn.addEventListener('click', playAgain);

        // Wire up controls
        if (modeSelect) modeSelect.addEventListener('change', onModeChange);
        if (difficultySelect) difficultySelect.addEventListener('change', onDifficultyChange);

        // Register touch handlers
        if (canvas) {
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
            canvas.addEventListener('touchcancel', handleTouchEnd);

            // Mouse fallback for desktop testing
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseUp);
        }

        // Load settings from localStorage
        loadSettings();

        // Resize canvas to fit screen
        resizeCanvas();

        // Start render loop
        startRenderLoop();

        // Load first character after canvas is sized
        setTimeout(loadNewCharacter, 100);
    }

    // ── Settings Persistence ───────────────────────────────────────

    function loadSettings() {
        try {
            var stored = localStorage.getItem('sproutplay_settings');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (parsed.tracer_mode) currentMode = parsed.tracer_mode;
                if (parsed.tracer_difficulty) currentDifficulty = parsed.tracer_difficulty;
            }
        } catch (e) {
            console.warn('Tracer: Failed to load settings', e);
        }

        // Apply difficulty config
        applyDifficultyConfig();

        // Update UI selectors
        if (modeSelect) modeSelect.value = currentMode;
        if (difficultySelect) difficultySelect.value = currentDifficulty;
    }

    function saveSettings() {
        try {
            var stored = localStorage.getItem('sproutplay_settings');
            var settings = stored ? JSON.parse(stored) : {};
            settings.tracer_mode = currentMode;
            settings.tracer_difficulty = currentDifficulty;
            localStorage.setItem('sproutplay_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Tracer: Failed to save settings', e);
        }
    }

    function applyDifficultyConfig() {
        var config = DIFFICULTY_CONFIG[currentDifficulty] || DIFFICULTY_CONFIG["easy"];
        tracingTolerance = config.tolerance;
        charactersPerSet = config.setSize;
        hintFrequency = config.hintFrequency;
        showStrokeHints = config.showHints;
    }

    // ── Control Handlers ───────────────────────────────────────────

    function onModeChange(e) {
        currentMode = e.target.value;
        saveSettings();
        resetSession();
        loadNewCharacter();
    }

    function onDifficultyChange(e) {
        currentDifficulty = e.target.value;
        applyDifficultyConfig();
        saveSettings();
        resetSession();
        loadNewCharacter();
    }

    function resetSession() {
        successCount = 0;
        failureCount = 0;
        charactersTraced = [];
        setComplete = false;
        currentCharacterIndex = 0;
    }

    // ── Canvas Sizing ──────────────────────────────────────────────

    function resizeCanvas() {
        if (!canvas) return;

        var rect = canvas.getBoundingClientRect();
        var w = Math.floor(rect.width);
        var h = Math.floor(rect.height);

        if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
        }
    }

    // ── Render Loop (60fps) ────────────────────────────────────────

    function startRenderLoop() {
        function frame() {
            render();
            renderLoopId = requestAnimationFrame(frame);
        }
        frame();
    }

    function render() {
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentCharacter) {
            drawCharacterOutline();
            drawStrokeHints();
            drawGlowTrail();
            drawTracePoints();
        }

        // Draw progress dots
        drawProgressDots();
    }

    // ── Character Rendering ────────────────────────────────────────

    function drawCharacterOutline() {
        if (!currentCharacter) return;

        var pathData = Paths.getPath(currentCharacter);
        if (!pathData || !pathData.paths) return;

        var scale = getScaleFactor();
        var offsetX = (canvas.width - pathData.boundingBox.width * scale) / 2;
        var offsetY = (canvas.height - pathData.boundingBox.height * scale) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Draw dashed outline for each stroke
        var isComplete = isCharacterComplete(pathData);

        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (var i = 0; i < pathData.paths.length; i++) {
            var strokeNum = pathData.strokeOrder[i] || (i + 1);

            ctx.beginPath();
            ctx.setLineDash([8, 4]);

            if (isComplete) {
                // Filled character — solid line
                ctx.strokeStyle = getCharacterColor(currentCharacter);
                ctx.lineWidth = 6;
                ctx.setLineDash([]);
            } else {
                // Dashed outline — dim color
                ctx.strokeStyle = 'rgba(150, 150, 180, 0.5)';
                ctx.lineWidth = 3;
            }

            parseAndDrawPath(pathData.paths[i]);
            ctx.stroke();
        }

        ctx.restore();
    }

    function parseAndDrawPath(pathString) {
        // Parse SVG path commands (M, L, C, Z) and draw on canvas
        var commands = pathString.match(/[MLCZ]|[+-]?\d*\.?\d+/g);
        if (!commands) return;

        var x = 0, y = 0;
        var startX = 0, startY = 0;
        var isFirstPoint = true;

        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i];

            if (cmd === 'M' || cmd === 'm') {
                i++;
                x = parseFloat(commands[i]);
                i++;
                y = parseFloat(commands[i]);
                startX = x;
                startY = y;
                ctx.moveTo(x, y);
                isFirstPoint = false;
            } else if (cmd === 'L' || cmd === 'l') {
                i++;
                x = parseFloat(commands[i]);
                i++;
                y = parseFloat(commands[i]);
                ctx.lineTo(x, y);
            } else if (cmd === 'C' || cmd === 'c') {
                i++;
                var cx1 = parseFloat(commands[i]);
                i++;
                var cy1 = parseFloat(commands[i]);
                i++;
                var cx2 = parseFloat(commands[i]);
                i++;
                var cy2 = parseFloat(commands[i]);
                i++;
                var ex = parseFloat(commands[i]);
                i++;
                var ey = parseFloat(commands[i]);
                ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
            } else if (cmd === 'Z' || cmd === 'z') {
                ctx.closePath();
            }
        }
    }

    function getScaleFactor() {
        var rect = canvas.getBoundingClientRect();
        var charWidth = Math.min(rect.width * 0.7, rect.height * 0.8);
        // Scale from 100-unit coordinate space to canvas pixels
        return Math.max(80 / BASE_CHAR_SIZE, Math.min(2.5, charWidth / BASE_CHAR_SIZE));
    }

    function getCharacterColor(character) {
        // Assign a consistent bright color per character
        var colors = [
            '#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3',
            '#F38181', '#AA96DA', '#FCBAD3', '#B8E986',
            '#38C7C7', '#ECC94B'
        ];
        var hash = 0;
        var chars = character.toUpperCase().split('');
        for (var i = 0; i < chars.length; i++) {
            hash = ((hash << 5) - hash) + chars[i].charCodeAt(0);
            hash = hash & hash; // Convert to 32bit integer
        }
        return colors[Math.abs(hash) % colors.length];
    }

    // ── Stroke Hints ───────────────────────────────────────────────

    function drawStrokeHints() {
        if (!currentCharacter || !showStrokeHints) return;

        var pathData = Paths.getPath(currentCharacter);
        if (!pathData || !pathData.paths) return;

        var scale = getScaleFactor();
        var offsetX = (canvas.width - pathData.boundingBox.width * scale) / 2;
        var offsetY = (canvas.height - pathData.boundingBox.height * scale) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Draw numbered start points for each stroke
        for (var i = 0; i < pathData.paths.length; i++) {
            var strokeNum = pathData.strokeOrder[i] || (i + 1);

            // Parse the first point of this stroke
            var firstCmd = pathData.paths[i].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            if (!firstCmd) continue;

            var startX = parseFloat(firstCmd[1]);
            var startY = parseFloat(firstCmd[2]);

            // Draw start point circle with number
            ctx.beginPath();
            ctx.arc(startX, startY, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(78, 205, 196, 0.8)';
            ctx.fill();

            // Draw number
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(strokeNum.toString(), startX, startY);

            // Draw small directional arrow if there's a next stroke
            if (i < pathData.paths.length - 1) {
                var nextCmd = pathData.paths[i + 1].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
                if (nextCmd) {
                    var nextX = parseFloat(nextCmd[1]);
                    var nextY = parseFloat(nextCmd[2]);
                    drawArrow(startX, startY, nextX, nextY);
                }
            }
        }

        ctx.restore();
    }

    function drawArrow(fromX, fromY, toX, toY) {
        var dx = toX - fromX;
        var dy = toY - fromY;
        var angle = Math.atan2(dy, dx);
        var arrowLen = 10;

        ctx.save();
        ctx.strokeStyle = 'rgba(78, 205, 196, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);

        // Arrow line (shorter than full path to avoid overlap)
        var midX = fromX + dx * 0.3;
        var midY = fromY + dy * 0.3;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(midX, midY);
        ctx.stroke();

        // Arrowhead
        var tipX = midX;
        var tipY = midY;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - arrowLen * Math.cos(angle - 0.4), tipY - arrowLen * Math.sin(angle - 0.4));
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - arrowLen * Math.cos(angle + 0.4), tipY - arrowLen * Math.sin(angle + 0.4));
        ctx.stroke();

        ctx.restore();
    }

    // ── Glow Trail (follows finger) ────────────────────────────────

    function drawGlowTrail() {
        if (!isTracing || tracePoints.length < 2) return;

        ctx.save();

        // Draw glow effect
        ctx.shadowColor = 'rgba(78, 205, 196, 0.6)';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = 'rgba(78, 205, 196, 0.9)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(tracePoints[0].x, tracePoints[0].y);

        for (var i = 1; i < tracePoints.length; i++) {
            ctx.lineTo(tracePoints[i].x, tracePoints[i].y);
        }
        ctx.stroke();

        // Draw brighter core trail
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(78, 205, 196, 1.0)';
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(tracePoints[0].x, tracePoints[0].y);

        for (var j = 1; j < tracePoints.length; j++) {
            ctx.lineTo(tracePoints[j].x, tracePoints[j].y);
        }
        ctx.stroke();

        ctx.restore();
    }

    // ── Trace Points (individual touch dots) ───────────────────────

    function drawTracePoints() {
        if (tracePoints.length === 0) return;

        ctx.save();
        for (var i = 0; i < tracePoints.length; i++) {
            var pt = tracePoints[i];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
            ctx.fill();
        }
        ctx.restore();
    }

    // ── Progress Dots ──────────────────────────────────────────────

    function drawProgressDots() {
        if (charactersTraced.length === 0) return;

        var dotSize = 8;
        var gap = 16;
        var totalWidth = charactersTraced.length * (dotSize + gap) - gap;
        var startX = (canvas.width - totalWidth) / 2;
        var y = canvas.height - 30;

        ctx.save();
        for (var i = 0; i < charactersTraced.length; i++) {
            var dotX = startX + i * (dotSize + gap);
            ctx.beginPath();
            ctx.arc(dotX + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2);

            if (charactersTraced[i].success) {
                ctx.fillStyle = getCharacterColor(charactersTraced[i].character);
            } else {
                ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
            }
            ctx.fill();

            if (i < charactersTraced.length - 1) {
                ctx.strokeStyle = 'rgba(150, 150, 180, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dotX + dotSize, y);
                ctx.lineTo(dotX + dotSize + gap, y);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ── Character Completion Check ─────────────────────────────────

    function isCharacterComplete(pathData) {
        if (!pathData || !pathData.paths || tracePoints.length < 5) return false;

        // Check if enough points have been traced to cover the path
        var scale = getScaleFactor();
        var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale;

        // Sample points along the SVG path and check if trace points are close enough
        var pathPoints = samplePathPoints(pathData);

        for (var i = 0; i < pathPoints.length; i += 3) { // Sample every 3rd point for performance
            var pp = pathPoints[i];
            var minDist = Infinity;

            for (var j = 0; j < tracePoints.length; j++) {
                var tp = tracePoints[j];
                var dx = pp.x - tp.x;
                var dy = pp.y - tp.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist) {
                    minDist = dist;
                }
            }

            if (minDist > tolerancePx) {
                return false; // Point off track — not complete yet
            }
        }

        // Check if we've covered enough of the path (at least 70% of sampled points)
        var coveredPoints = 0;
        for (var k = 0; k < pathPoints.length; k += 3) {
            var pp = pathPoints[k];
            var minDist = Infinity;

            for (var m = 0; m < tracePoints.length; m++) {
                var tp = tracePoints[m];
                var dx = pp.x - tp.x;
                var dy = pp.y - tp.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist) {
                    minDist = dist;
                }
            }

            if (minDist <= tolerancePx) {
                coveredPoints++;
            }
        }

        return (coveredPoints / Math.ceil(pathPoints.length / 3)) >= 0.7;
    }

    function samplePathPoints(pathData) {
        var points = [];

        for (var i = 0; i < pathData.paths.length; i++) {
            var commands = pathData.paths[i].match(/[MLCZ]|[+-]?\d*\.?\d+/g);
            if (!commands) continue;

            var x = 0, y = 0;
            var prevX = 0, prevY = 0;
            var segments = [];
            var currentSegment = [{ x: 0, y: 0 }];

            for (var j = 0; j < commands.length; j++) {
                var cmd = commands[j];

                if (cmd === 'M' || cmd === 'm') {
                    j++;
                    x = parseFloat(commands[j]);
                    j++;
                    y = parseFloat(commands[j]);
                    prevX = x;
                    prevY = y;
                    currentSegment.push({ x: x, y: y });
                } else if (cmd === 'L' || cmd === 'l') {
                    j++;
                    x = parseFloat(commands[j]);
                    j++;
                    y = parseFloat(commands[j]);
                    segments.push(lineSegments(prevX, prevY, x, y, 10));
                    prevX = x;
                    prevY = y;
                } else if (cmd === 'C' || cmd === 'c') {
                    j++;
                    var cx1 = parseFloat(commands[j]);
                    j++;
                    var cy1 = parseFloat(commands[j]);
                    j++;
                    var cx2 = parseFloat(commands[j]);
                    j++;
                    var cy2 = parseFloat(commands[j]);
                    j++;
                    var ex = parseFloat(commands[j]);
                    j++;
                    var ey = parseFloat(commands[j]);
                    segments.push(bezierSegments(prevX, prevY, cx1, cy1, cx2, cy2, ex, ey, 15));
                    prevX = ex;
                    prevY = ey;
                }
            }

            for (var s = 0; s < segments.length; s++) {
                points = points.concat(segments[s]);
            }
        }

        return points;
    }

    function lineSegments(x1, y1, x2, y2, count) {
        var points = [];
        for (var i = 0; i <= count; i++) {
            var t = i / count;
            points.push({
                x: x1 + (x2 - x1) * t,
                y: y1 + (y2 - y1) * t
            });
        }
        return points;
    }

    function bezierSegments(x1, y1, cx1, cy1, cx2, cy2, x2, y2, count) {
        var points = [];
        for (var i = 0; i <= count; i++) {
            var t = i / count;
            var mt = 1 - t;
            var x = mt*mt*x1 + 2*mt*t*cx1 + t*t*x2;
            var y = mt*mt*y1 + 2*mt*t*cy1 + t*t*y2;
            points.push({ x: x, y: y });
        }
        return points;
    }

    // ── Touch Event Handlers ───────────────────────────────────────

    function getCanvasCoordinates(touchEvent) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        var clientX = touchEvent.clientX;
        var clientY = touchEvent.clientY;

        // Handle both single touch and pointer events
        if (touchEvent.touches && touchEvent.touches.length > 0) {
            clientX = touchEvent.touches[0].clientX;
            clientY = touchEvent.touches[0].clientY;
        }

        var x = (clientX - rect.left) * scaleX;
        var y = (clientY - rect.top) * scaleY;

        return { x: x, y: y };
    }

    function handleTouchStart(e) {
        e.preventDefault();
        if (!e.touches || e.touches.length === 0) return;

        // Debounce rapid touches
        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;

        var coords = getCanvasCoordinates(e);
        isTracing = true;
        tracePoints = [coords];
        mistakesCount = 0;
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!isTracing || !e.touches || e.touches.length === 0) return;

        var coords = getCanvasCoordinates(e);
        tracePoints.push(coords);

        // Check for hint trigger
        if (!showStrokeHints && mistakesCount < hintFrequency) {
            // Count mistakes (points far from any path point)
            var scale = getScaleFactor();
            var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale;
            var pathData = Paths.getPath(currentCharacter);

            if (pathData) {
                var pathPoints = samplePathPoints(pathData);
                var lastPt = tracePoints[tracePoints.length - 1];
                var minDist = Infinity;

                for (var i = 0; i < pathPoints.length; i += 5) {
                    var pp = pathPoints[i];
                    var dx = pp.x - lastPt.x;
                    var dy = pp.y - lastPt.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist) minDist = dist;
                }

                if (minDist > tolerancePx * 2) {
                    mistakesCount++;
                    if (mistakesCount >= hintFrequency && !showStrokeHints) {
                        // Show hints after enough mistakes
                        showStrokeHints = true;
                    }
                }
            }
        }
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        if (!isTracing) return;

        isTracing = false;

        // Validate trace completion
        var pathData = Paths.getPath(currentCharacter);
        if (pathData && isCharacterComplete(pathData)) {
            // Success!
            onCharacterSuccess();
        } else {
            // Failure — clear trace points and try again
            onCharacterFailure();
        }
    }

    // ── Mouse Event Handlers (Desktop Testing) ─────────────────────

    function handleMouseDown(e) {
        var coords = getCanvasCoordinates(e);
        isTracing = true;
        tracePoints = [coords];
        mistakesCount = 0;

        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;
    }

    function handleMouseMove(e) {
        if (!isTracing) return;

        var coords = getCanvasCoordinates(e);
        tracePoints.push(coords);
    }

    function handleMouseUp(e) {
        if (!isTracing) return;

        isTracing = false;

        var pathData = Paths.getPath(currentCharacter);
        if (pathData && isCharacterComplete(pathData)) {
            onCharacterSuccess();
        } else {
            onCharacterFailure();
        }
    }

    // ── Character Success / Failure ────────────────────────────────

    function onCharacterSuccess() {
        var result = {
            character: currentCharacter,
            success: true,
            timestamp: Date.now(),
            mistakesCount: mistakesCount,
            hintsUsed: hintsUsed
        };

        charactersTraced.push(result);
        successCount++;

        // Play success sound
        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.match();

            // TTS pronunciation
            if (currentMode === "letters") {
                var pathData = Paths.getPath(currentCharacter);
                if (pathData && pathData.exampleWord) {
                    var word = pathData.exampleWord.toLowerCase();
                    Sound.speak(currentCharacter + " is for " + pathData.exampleWord + "!");
                }
            } else if (currentMode === "numbers") {
                Sound.speak(numberToWords(parseInt(currentCharacter)));
            } else if (currentMode === "words" && currentWordEntry) {
                var letters = currentWordEntry.letters.join("-");
                Sound.speak(letters + ", " + currentWordEntry.word.toLowerCase() + "! " + currentWordEntry.meaning);
            } else {
                Sound.speak(numberToWords(parseInt(currentCharacter)));
            }
        }

        // Check if set is complete
        if (charactersTraced.length >= charactersPerSet) {
            setComplete = true;
            setTimeout(function () {
                showCelebration();
            }, 500);
        } else {
            // Load next character after brief pause
            setTimeout(function () {
                loadNewCharacter();
            }, 800);
        }

        tracePoints = [];
    }

    function onCharacterFailure() {
        failureCount++;

        // Play gentle "try again" sound
        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.noMatch();
        }

        // Clear trace points after brief delay
        setTimeout(function () {
            tracePoints = [];

            // Check if too many failures — show hint animation
            if (failureCount >= 3) {
                showAutoHint();
                failureCount = 0; // Reset to avoid constant hints
            } else {
                loadNewCharacter();
            }
        }, 500);
    }

    function showAutoHint() {
        // Animate the character path to show how it should be traced
        if (!currentCharacter) return;

        var pathData = Paths.getPath(currentCharacter);
        if (!pathData) return;

        // Flash the character path with a bright color
        var originalStroke = ctx.strokeStyle;
        var scale = getScaleFactor();

        // Brief visual hint — we'll just reload the character with hints visible
        showStrokeHints = true;
        tracePoints = [];

        // TTS hint
        if (typeof Sound !== 'undefined') {
            Sound.speak("Try again! Look at the numbered dots.");
        }
    }

    // ── Number to Words Converter ──────────────────────────────────

    function numberToWords(num) {
        if (num < 0 || num > 100) return num.toString();

        var ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                     "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
                     "seventeen", "eighteen", "nineteen"];
        var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

        if (num <= 19) return ones[num];
        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 ? "-" + ones[num % 10] : "");
        }
        return "one hundred";
    }

    // ── Character Loading ──────────────────────────────────────────

    function loadNewCharacter() {
        hideCelebration();
        tracePoints = [];
        mistakesCount = 0;
        hintsUsed = 0;
        showStrokeHints = DIFFICULTY_CONFIG[currentDifficulty].showHints;

        var charList = [];
        var sequence = [];
        var tracedSet = {};
        for (var t = 0; t < charactersTraced.length; t++) {
            tracedSet[charactersTraced[t].character] = true;
        }

        switch (currentMode) {
            case "numbers":
                charList = Paths.getCharactersForMode("numbers");
                var available = charList.filter(function (c) { return !tracedSet[c]; });
                if (available.length === 0) available = charList;
                currentCharacter = available[Math.floor(Math.random() * available.length)];
                sequence = [currentCharacter];
                break;

            case "letters":
                charList = Paths.getCharactersForMode("letters");
                var available = charList.filter(function (c) { return !tracedSet[c]; });
                if (available.length === 0) available = charList;
                currentCharacter = available[Math.floor(Math.random() * available.length)];
                sequence = [currentCharacter];
                break;

            case "multi-digit":
                // Generate 2-3 digit numbers
                var maxDigits = charactersPerSet >= 8 ? 3 : 2;
                var numDigits = Math.random() < 0.3 ? 3 : 2; // 30% chance of 3-digit
                var minNum = numDigits === 3 ? 100 : 10;
                var maxNum = numDigits === 3 ? 100 : 99;
                var num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
                currentCharacter = num.toString();
                sequence = currentCharacter.split('');
                break;

            case "words":
                // Pick a random word entry
                var words = Paths.getWordEntries();
                currentWordEntry = words[Math.floor(Math.random() * words.length)];
                currentCharacter = currentWordEntry.word;
                sequence = currentWordEntry.letters;
                break;
        }

        characterSequence = sequence;
        currentCharacterIndex = 0;
    }

    // ── Celebration ────────────────────────────────────────────────

    function showCelebration() {
        if (!celebrationEl) return;

        // Update celebration text
        celebrationTitle.textContent = "Great Tracing!";

        var msg = "";
        if (currentMode === "numbers") {
            msg = "You traced " + successCount + " numbers!";
        } else if (currentMode === "letters") {
            msg = "You traced " + successCount + " letters!";
        } else if (currentMode === "multi-digit") {
            msg = "You traced " + successCount + " multi-digit numbers!";
        } else {
            msg = "You traced " + successCount + " words!";
        }
        celebrationMsg.textContent = msg;

        celebrationEl.style.display = 'flex';

        // Celebration sound
        if (typeof Sound !== 'undefined') {
            Sound.celebrate();
        }
    }

    function hideCelebration() {
        if (celebrationEl) celebrationEl.style.display = 'none';
    }

    function playAgain() {
        hideCelebration();
        resetSession();
        loadNewCharacter();
    }

    // ── Navigation ────────────────────────────────────────────────

    function goToHub() {
        // Save session progress before leaving
        try {
            var stored = localStorage.getItem('sproutplay_settings');
            var settings = stored ? JSON.parse(stored) : {};
            settings.tracer_session = {
                successCount: successCount,
                failureCount: failureCount,
                charactersTraced: charactersTraced,
                lastSaved: Date.now()
            };
            localStorage.setItem('sproutplay_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Tracer: Failed to save session', e);
        }

        window.location.href = '../index.html';
    }

    // ── Public API ────────────────────────────────────────────────

    return {
        init: init
    };

})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', Tracer.init);
