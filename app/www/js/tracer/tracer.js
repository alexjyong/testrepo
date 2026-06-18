/* global Paths, Sound */
const Tracer = (function () {

    var canvas, ctx;
    var celebrationEl, celebrationTitle, celebrationMsg, celebrationMeaning;
    var playAgainBtn, celebrationBack;
    var promptBanner;

    var currentMode = "numbers";
    var currentDifficulty = "easy";
    var currentCharacter = null;
    var currentWordEntry = null;
    var isTracing = false;
    var tracePoints = [];
    var offPathPoints = [];
    var mistakesCount = 0;
    var hintsUsed = 0;
    var successCount = 0;
    var failureCount = 0;
    var charactersTraced = [];
    var setComplete = false;
    var charactersPerSet = 3;
    var tracingTolerance = 50;
    var hintFrequency = 1;
    var showStrokeHints = true;
    var currentCharacterIndex = 0;
    var characterSequence = [];
    var lastTouchTime = 0;
    var renderLoopId = null;
    var progressFraction = 0;

    var CANVAS_PADDING = 20;
    var BASE_CHAR_SIZE = 100;

    var DIFFICULTY_CONFIG = {
        "easy":   { tolerance: 50, setSize: 3, hintFrequency: 1, showHints: true },
        "medium": { tolerance: 35, setSize: 5, hintFrequency: 1, showHints: false },
        "hard":   { tolerance: 20, setSize: 8, hintFrequency: 3, showHints: false }
    };

    var PRAISE_PHRASES = [
        "Great job!",
        "Amazing tracing!",
        "You did it!",
        "Wonderful!",
        "Awesome!",
        "Fantastic!",
        "Super star!",
        "Well done!"
    ];

    function init() {
        canvas = document.getElementById('tracer-canvas');
        celebrationEl = document.getElementById('celebration');
        celebrationTitle = document.getElementById('celebration-title');
        celebrationMsg = document.getElementById('celebration-msg');
        celebrationMeaning = document.getElementById('celebration-meaning');
        playAgainBtn = document.getElementById('play-again-btn');
        celebrationBack = document.getElementById('celebration-back');
        promptBanner = document.getElementById('prompt-banner');

        if (canvas) {
            ctx = canvas.getContext('2d');
        }

        var backBtn = document.getElementById('tracer-back');
        if (backBtn) backBtn.addEventListener('click', goToHub);
        if (celebrationBack) celebrationBack.addEventListener('click', goToHub);
        if (playAgainBtn) playAgainBtn.addEventListener('click', playAgain);

        wireModeButtons();
        wireDifficultyButtons();

        if (canvas) {
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
            canvas.addEventListener('touchcancel', handleTouchEnd);
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            canvas.addEventListener('mouseleave', handleMouseUp);
        }

        window.addEventListener('resize', debounceResize);

        loadSettings();
        resizeCanvas();
        startRenderLoop();
        setTimeout(loadNewCharacter, 100);
    }

    function wireModeButtons() {
        var btns = document.querySelectorAll('.mode-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
                    btn.classList.add('active');
                    currentMode = btn.getAttribute('data-mode');
                    saveSettings();
                    resetSession();
                    loadNewCharacter();
                });
            })(btns[i]);
        }
    }

    function wireDifficultyButtons() {
        var btns = document.querySelectorAll('.diff-btn');
        for (var i = 0; i < btns.length; i++) {
            (function (btn) {
                btn.addEventListener('click', function () {
                    for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
                    btn.classList.add('active');
                    currentDifficulty = btn.getAttribute('data-difficulty');
                    saveSettings();
                    applyDifficultyConfig();
                    resetSession();
                    loadNewCharacter();
                });
            })(btns[i]);
        }
    }

    var _resizeTimer = null;
    function debounceResize() {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(function () {
            resizeCanvas();
        }, 150);
    }

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

        applyDifficultyConfig();
        syncButtonStates();
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

    function syncButtonStates() {
        var modeBtns = document.querySelectorAll('.mode-btn');
        for (var i = 0; i < modeBtns.length; i++) {
            if (modeBtns[i].getAttribute('data-mode') === currentMode) {
                modeBtns[i].classList.add('active');
            } else {
                modeBtns[i].classList.remove('active');
            }
        }
        var diffBtns = document.querySelectorAll('.diff-btn');
        for (var j = 0; j < diffBtns.length; j++) {
            if (diffBtns[j].getAttribute('data-difficulty') === currentDifficulty) {
                diffBtns[j].classList.add('active');
            } else {
                diffBtns[j].classList.remove('active');
            }
        }
    }

    function resetSession() {
        successCount = 0;
        failureCount = 0;
        charactersTraced = [];
        setComplete = false;
        currentCharacterIndex = 0;
        progressFraction = 0;
    }

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
            drawOffPathFeedback();
            drawTracePoints();
            updateProgressFraction();
        }

        drawProgressBar();
        drawPromptBanner();
    }

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

        for (var i = 0; i < pathData.paths.length; i++) {
            ctx.beginPath();
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = 'rgba(150, 150, 180, 0.5)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            var firstPt = pathData.paths[i].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            if (firstPt) {
                var completedStrokesBefore = i;
                if (completedStrokesBefore < progressFraction * pathData.paths.length) {
                    ctx.setLineDash([]);
                    ctx.strokeStyle = getCharacterColor(currentCharacter);
                    ctx.lineWidth = 6;
                }
            }

            parseAndDrawPath(pathData.paths[i]);
            ctx.stroke();
        }

        ctx.restore();
    }

    function parseAndDrawPath(pathString) {
        var commands = pathString.match(/[MLCZ]|[+-]?\d*\.?\d+/g);
        if (!commands) return;

        var x = 0, y = 0;

        for (var i = 0; i < commands.length; i++) {
            var cmd = commands[i];

            if (cmd === 'M' || cmd === 'm') {
                i++; x = parseFloat(commands[i]);
                i++; y = parseFloat(commands[i]);
                ctx.moveTo(x, y);
            } else if (cmd === 'L' || cmd === 'l') {
                i++; x = parseFloat(commands[i]);
                i++; y = parseFloat(commands[i]);
                ctx.lineTo(x, y);
            } else if (cmd === 'C' || cmd === 'c') {
                i++; var cx1 = parseFloat(commands[i]);
                i++; var cy1 = parseFloat(commands[i]);
                i++; var cx2 = parseFloat(commands[i]);
                i++; var cy2 = parseFloat(commands[i]);
                i++; var ex = parseFloat(commands[i]);
                i++; var ey = parseFloat(commands[i]);
                ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
            } else if (cmd === 'Z' || cmd === 'z') {
                ctx.closePath();
            }
        }
    }

    function getScaleFactor() {
        var rect = canvas.getBoundingClientRect();
        var charWidth = Math.min(rect.width * 0.7, rect.height * 0.7);
        return Math.max(0.8, Math.min(2.5, charWidth / BASE_CHAR_SIZE));
    }

    function getCharacterColor(character) {
        var colors = [
            '#FF6B6B', '#FFE66D', '#4ECDC4', '#95E1D3',
            '#F38181', '#AA96DA', '#FCBAD3', '#B8E986',
            '#38C7C7', '#ECC94B'
        ];
        var hash = 0;
        var chars = character.toUpperCase().split('');
        for (var i = 0; i < chars.length; i++) {
            hash = ((hash << 5) - hash) + chars[i].charCodeAt(0);
            hash = hash & hash;
        }
        return colors[Math.abs(hash) % colors.length];
    }

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

        for (var i = 0; i < pathData.paths.length; i++) {
            var strokeNum = pathData.strokeOrder[i] || (i + 1);
            var firstCmd = pathData.paths[i].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            if (!firstCmd) continue;

            var startX = parseFloat(firstCmd[1]);
            var startY = parseFloat(firstCmd[2]);

            ctx.beginPath();
            ctx.arc(startX, startY, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(93, 173, 226, 0.8)';
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(strokeNum.toString(), startX, startY);

            if (i < pathData.paths.length - 1) {
                var nextCmd = pathData.paths[i + 1].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
                if (nextCmd) {
                    drawArrow(startX, startY, parseFloat(nextCmd[1]), parseFloat(nextCmd[2]));
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
        ctx.strokeStyle = 'rgba(93, 173, 226, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);

        var midX = fromX + dx * 0.3;
        var midY = fromY + dy * 0.3;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(midX, midY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - arrowLen * Math.cos(angle - 0.4), midY - arrowLen * Math.sin(angle - 0.4));
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - arrowLen * Math.cos(angle + 0.4), midY - arrowLen * Math.sin(angle + 0.4));
        ctx.stroke();

        ctx.restore();
    }

    function drawGlowTrail() {
        if (tracePoints.length < 2) return;

        ctx.save();

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

    function drawOffPathFeedback() {
        if (offPathPoints.length === 0) return;

        ctx.save();
        for (var i = 0; i < offPathPoints.length; i++) {
            var pt = offPathPoints[i];
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(230, 126, 34, 0.6)';
            ctx.fill();
        }
        ctx.restore();
    }

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

    function updateProgressFraction() {
        if (!currentCharacter || tracePoints.length < 5) {
            progressFraction = 0;
            return;
        }

        var pathData = Paths.getPath(currentCharacter);
        if (!pathData || !pathData.paths) return;

        var pathPoints = samplePathPoints(pathData);
        if (pathPoints.length === 0) return;

        var scale = getScaleFactor();
        var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale;

        var coveredPoints = 0;
        var totalSampled = Math.ceil(pathPoints.length / 3);

        for (var k = 0; k < pathPoints.length; k += 3) {
            var pp = pathPoints[k];
            var minDist = Infinity;

            for (var m = 0; m < tracePoints.length; m++) {
                var tp = tracePoints[m];
                var dx = pp.x - tp.x;
                var dy = pp.y - tp.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) minDist = dist;
            }

            if (minDist <= tolerancePx) coveredPoints++;
        }

        progressFraction = coveredPoints / totalSampled;
    }

    function drawProgressBar() {
        var barWidth = canvas.width * 0.6;
        var barHeight = 8;
        var x = (canvas.width - barWidth) / 2;
        var y = canvas.height - 20;
        var radius = 4;

        ctx.save();

        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
        fillRoundRect(ctx, x, y, barWidth, barHeight, radius);

        var fillWidth = Math.max(0, barWidth * progressFraction);
        if (fillWidth > 0) {
            var gradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
            gradient.addColorStop(0, '#5DADE2');
            gradient.addColorStop(1, '#4ECDC4');
            ctx.fillStyle = gradient;
            fillRoundRect(ctx, x, y, fillWidth, barHeight, radius);
        }

        var dotSize = 8;
        var gap = 16;
        var totalDotWidth = charactersTraced.length * (dotSize + gap) - gap;
        var dotStartX = (canvas.width - totalDotWidth) / 2;
        var dotY = y - 16;

        for (var i = 0; i < charactersTraced.length; i++) {
            var dotX = dotStartX + i * (dotSize + gap);
            ctx.beginPath();
            ctx.arc(dotX + dotSize / 2, dotY, dotSize / 2, 0, Math.PI * 2);
            ctx.fillStyle = charactersTraced[i].success ? getCharacterColor(charactersTraced[i].character) : 'rgba(200, 200, 200, 0.5)';
            ctx.fill();
        }

        ctx.restore();
    }

    function fillRoundRect(context, x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + w - r, y);
        context.quadraticCurveTo(x + w, y, x + w, y + r);
        context.lineTo(x + w, y + h - r);
        context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        context.lineTo(x + r, y + h);
        context.quadraticCurveTo(x, y + h, x, y + h - r);
        context.lineTo(x, y + r);
        context.quadraticCurveTo(x, y, x + r, y);
        context.closePath();
        context.fill();
    }

    function drawPromptBanner() {
        if (!promptBanner) return;
        if (currentCharacter && !isTracing && tracePoints.length === 0) {
            promptBanner.style.opacity = '1';
        } else if (isTracing) {
            promptBanner.style.opacity = '0.4';
        }
    }

    function isCharacterComplete(pathData) {
        if (!pathData || !pathData.paths || tracePoints.length < 5) return false;

        var scale = getScaleFactor();
        var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale;

        var pathPoints = samplePathPoints(pathData);
        var coveredPoints = 0;
        var totalSampled = Math.ceil(pathPoints.length / 3);

        for (var k = 0; k < pathPoints.length; k += 3) {
            var pp = pathPoints[k];
            var minDist = Infinity;

            for (var m = 0; m < tracePoints.length; m++) {
                var tp = tracePoints[m];
                var dx = pp.x - tp.x;
                var dy = pp.y - tp.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) minDist = dist;
            }

            if (minDist <= tolerancePx) coveredPoints++;
        }

        return (coveredPoints / totalSampled) >= 0.7;
    }

    function samplePathPoints(pathData) {
        var points = [];

        for (var i = 0; i < pathData.paths.length; i++) {
            var commands = pathData.paths[i].match(/[MLCZ]|[+-]?\d*\.?\d+/g);
            if (!commands) continue;

            var x = 0, y = 0;
            var prevX = 0, prevY = 0;
            var segments = [];

            for (var j = 0; j < commands.length; j++) {
                var cmd = commands[j];

                if (cmd === 'M' || cmd === 'm') {
                    j++; x = parseFloat(commands[j]);
                    j++; y = parseFloat(commands[j]);
                    prevX = x; prevY = y;
                } else if (cmd === 'L' || cmd === 'l') {
                    j++; x = parseFloat(commands[j]);
                    j++; y = parseFloat(commands[j]);
                    segments.push(lineSegments(prevX, prevY, x, y, 10));
                    prevX = x; prevY = y;
                } else if (cmd === 'C' || cmd === 'c') {
                    j++; var cx1 = parseFloat(commands[j]);
                    j++; var cy1 = parseFloat(commands[j]);
                    j++; var cx2 = parseFloat(commands[j]);
                    j++; var cy2 = parseFloat(commands[j]);
                    j++; var ex = parseFloat(commands[j]);
                    j++; var ey = parseFloat(commands[j]);
                    segments.push(bezierSegments(prevX, prevY, cx1, cy1, cx2, cy2, ex, ey, 15));
                    prevX = ex; prevY = ey;
                }
            }

            for (var s = 0; s < segments.length; s++) {
                points = points.concat(segments[s]);
            }
        }

        var scale = getScaleFactor();
        var offsetX = (canvas.width - pathData.boundingBox.width * scale) / 2;
        var offsetY = (canvas.height - pathData.boundingBox.height * scale) / 2;

        for (var p = 0; p < points.length; p++) {
            points[p] = {
                x: points[p].x * scale + offsetX,
                y: points[p].y * scale + offsetY
            };
        }

        return points;
    }

    function lineSegments(x1, y1, x2, y2, count) {
        var points = [];
        for (var i = 0; i <= count; i++) {
            var t = i / count;
            points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
        }
        return points;
    }

    function bezierSegments(x1, y1, cx1, cy1, cx2, cy2, x2, y2, count) {
        var points = [];
        for (var i = 0; i <= count; i++) {
            var t = i / count;
            var mt = 1 - t;
            points.push({
                x: mt*mt*mt*x1 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x2,
                y: mt*mt*mt*y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y2
            });
        }
        return points;
    }

    function isPointOnPath(px, py) {
        var pathData = Paths.getPath(currentCharacter);
        if (!pathData) return true;

        var scale = getScaleFactor();
        var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale;
        var pathPoints = samplePathPoints(pathData);

        for (var i = 0; i < pathPoints.length; i += 3) {
            var pp = pathPoints[i];
            var dx = pp.x - px;
            var dy = pp.y - py;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= tolerancePx) return true;
        }

        return false;
    }

    function getCanvasCoordinates(touchEvent) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        var clientX = touchEvent.clientX;
        var clientY = touchEvent.clientY;

        if (touchEvent.touches && touchEvent.touches.length > 0) {
            clientX = touchEvent.touches[0].clientX;
            clientY = touchEvent.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function handleTouchStart(e) {
        e.preventDefault();
        if (!e.touches || e.touches.length === 0) return;

        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;

        var coords = getCanvasCoordinates(e);
        isTracing = true;
        tracePoints = [coords];
        offPathPoints = [];
        mistakesCount = 0;
    }

    function handleTouchMove(e) {
        e.preventDefault();
        if (!isTracing || !e.touches || e.touches.length === 0) return;

        var coords = getCanvasCoordinates(e);
        tracePoints.push(coords);

        var onPath = isPointOnPath(coords.x, coords.y);
        if (!onPath) {
            offPathPoints.push(coords);
            if (offPathPoints.length > 20) offPathPoints.shift();

            if (!showStrokeHints && mistakesCount < hintFrequency * 3) {
                mistakesCount++;
                if (mistakesCount >= hintFrequency * 2) {
                    showStrokeHints = true;
                    hintsUsed++;
                    if (typeof Sound !== 'undefined') {
                        Sound.speak("Follow the dotted line!");
                    }
                }
            }
        } else {
            offPathPoints = [];
        }
    }

    function handleTouchEnd(e) {
        e.preventDefault();
        if (!isTracing) return;

        isTracing = false;
        offPathPoints = [];

        var pathData = Paths.getPath(currentCharacter);
        if (pathData && isCharacterComplete(pathData)) {
            onCharacterSuccess();
        } else {
            onCharacterFailure();
        }
    }

    function handleMouseDown(e) {
        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;

        var coords = getCanvasCoordinates(e);
        isTracing = true;
        tracePoints = [coords];
        offPathPoints = [];
        mistakesCount = 0;
    }

    function handleMouseMove(e) {
        if (!isTracing) return;

        var coords = getCanvasCoordinates(e);
        tracePoints.push(coords);

        var onPath = isPointOnPath(coords.x, coords.y);
        if (!onPath) {
            offPathPoints.push(coords);
            if (offPathPoints.length > 20) offPathPoints.shift();
        } else {
            offPathPoints = [];
        }
    }

    function handleMouseUp(e) {
        if (!isTracing) return;

        isTracing = false;
        offPathPoints = [];

        var pathData = Paths.getPath(currentCharacter);
        if (pathData && isCharacterComplete(pathData)) {
            onCharacterSuccess();
        } else {
            onCharacterFailure();
        }
    }

    function onCharacterSuccess() {
        charactersTraced.push({
            character: currentCharacter,
            success: true,
            timestamp: Date.now(),
            mistakesCount: mistakesCount,
            hintsUsed: hintsUsed
        });
        successCount++;

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.match();

            if (currentMode === "letters") {
                var pathData = Paths.getPath(currentCharacter);
                if (pathData && pathData.exampleWord) {
                    Sound.speak(currentCharacter + " is for " + pathData.exampleWord + "!");
                } else {
                    Sound.speak("Great! " + currentCharacter);
                }
            } else if (currentMode === "numbers") {
                Sound.speak(numberToWords(parseInt(currentCharacter)));
            } else if (currentMode === "multi-digit") {
                Sound.speak(currentCharacter);
            } else if (currentMode === "words" && currentWordEntry) {
                var letters = currentWordEntry.letters.join(", ");
                Sound.speak(letters + "! " + currentWordEntry.word.toLowerCase() + "!");
            } else {
                Sound.speak("Great!");
            }
        }

        if (charactersTraced.length >= charactersPerSet) {
            setComplete = true;
            setTimeout(showCelebration, 500);
        } else {
            setTimeout(loadNewCharacter, 800);
        }

        tracePoints = [];
    }

    function onCharacterFailure() {
        failureCount++;
        charactersTraced.push({
            character: currentCharacter,
            success: false,
            timestamp: Date.now(),
            mistakesCount: mistakesCount,
            hintsUsed: hintsUsed
        });

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.noMatch();
            Sound.speak("Try again!");
        }

        setTimeout(function () {
            tracePoints = [];

            if (failureCount >= 3) {
                showAutoHint();
                failureCount = 0;
            } else {
                loadNewCharacter();
            }
        }, 500);
    }

    function showAutoHint() {
        showStrokeHints = true;
        tracePoints = [];

        if (typeof Sound !== 'undefined') {
            Sound.speak("Follow the numbered dots!");
        }
    }

    function numberToWords(num) {
        if (isNaN(num) || num < 0 || num > 100) return (num || 0).toString();

        var ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                     "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
                     "seventeen", "eighteen", "nineteen"];
        var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

        if (num <= 19) return ones[num];
        if (num < 100) {
            return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
        }
        return "one hundred";
    }

    function loadNewCharacter() {
        hideCelebration();
        tracePoints = [];
        offPathPoints = [];
        mistakesCount = 0;
        hintsUsed = 0;
        progressFraction = 0;
        showStrokeHints = DIFFICULTY_CONFIG[currentDifficulty].showHints;

        var charList = [];
        var sequence = [];
        var tracedSet = {};
        for (var t = 0; t < charactersTraced.length; t++) {
            tracedSet[charactersTraced[t].character] = true;
        }

        currentWordEntry = null;

        switch (currentMode) {
            case "numbers":
                charList = Paths.getCharactersForMode("numbers");
                var availNum = charList.filter(function (c) { return !tracedSet[c]; });
                if (availNum.length === 0) availNum = charList;
                currentCharacter = availNum[Math.floor(Math.random() * availNum.length)];
                sequence = [currentCharacter];
                break;

            case "letters":
                charList = Paths.getCharactersForMode("letters");
                var availLet = charList.filter(function (c) { return !tracedSet[c]; });
                if (availLet.length === 0) availLet = charList;
                currentCharacter = availLet[Math.floor(Math.random() * availLet.length)];
                sequence = [currentCharacter];
                break;

            case "multi-digit":
                var numDigits = Math.random() < 0.3 ? 3 : 2;
                var minNum = numDigits === 3 ? 100 : 10;
                var maxNum = numDigits === 3 ? 999 : 99;
                var num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
                currentCharacter = num.toString();
                sequence = currentCharacter.split('');
                break;

            case "words":
                var words = Paths.getWordEntries();
                currentWordEntry = words[Math.floor(Math.random() * words.length)];
                currentCharacter = currentWordEntry.word;
                sequence = currentWordEntry.letters;
                break;
        }

        characterSequence = sequence;
        currentCharacterIndex = 0;

        updatePromptBanner();

        if (typeof Sound !== 'undefined') {
            setTimeout(function () {
                announceCharacter();
            }, 300);
        }
    }

    function updatePromptBanner() {
        if (!promptBanner) return;

        if (currentMode === "numbers") {
            promptBanner.textContent = "Trace the number " + currentCharacter + "!";
        } else if (currentMode === "letters") {
            promptBanner.textContent = "Trace the letter " + currentCharacter + "!";
        } else if (currentMode === "multi-digit") {
            promptBanner.textContent = "Trace " + currentCharacter + "!";
        } else if (currentMode === "words" && currentWordEntry) {
            promptBanner.textContent = "Trace " + currentWordEntry.word + "!";
        }
    }

    function announceCharacter() {
        if (typeof Sound === 'undefined') return;

        if (currentMode === "numbers") {
            Sound.speak("Trace the number " + numberToWords(parseInt(currentCharacter)));
        } else if (currentMode === "letters") {
            Sound.speak("Trace the letter " + currentCharacter);
        } else if (currentMode === "multi-digit") {
            Sound.speak("Trace " + numberToWords(parseInt(currentCharacter)));
        } else if (currentMode === "words" && currentWordEntry) {
            Sound.speak("Trace the word " + currentWordEntry.word.toLowerCase());
        }
    }

    function showCelebration() {
        if (!celebrationEl) return;

        var phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
        celebrationTitle.textContent = phrase;

        var msg = "";
        if (currentMode === "numbers") {
            msg = "You traced " + successCount + " number" + (successCount !== 1 ? "s" : "") + "!";
        } else if (currentMode === "letters") {
            msg = "You traced " + successCount + " letter" + (successCount !== 1 ? "s" : "") + "!";
        } else if (currentMode === "multi-digit") {
            msg = "You traced " + successCount + " multi-digit number" + (successCount !== 1 ? "s" : "") + "!";
        } else {
            msg = "You traced " + successCount + " word" + (successCount !== 1 ? "s" : "") + "!";
        }
        celebrationMsg.textContent = msg;

        if (currentMode === "words" && currentWordEntry && currentWordEntry.meaning) {
            celebrationMeaning.textContent = currentWordEntry.meaning;
            celebrationMeaning.style.display = 'block';
        } else if (currentMode === "letters") {
            var pathData = Paths.getPath(currentCharacter);
            if (pathData && pathData.exampleWord) {
                celebrationMeaning.textContent = currentCharacter + " is for " + pathData.exampleWord + "!";
                celebrationMeaning.style.display = 'block';
            } else {
                celebrationMeaning.style.display = 'none';
            }
        } else {
            celebrationMeaning.style.display = 'none';
        }

        celebrationEl.style.display = 'flex';

        if (typeof Sound !== 'undefined') {
            Sound.celebrate();
            Sound.speak(phrase + " " + msg);
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

    function goToHub() {
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

    return {
        init: init
    };

})();

document.addEventListener('DOMContentLoaded', Tracer.init);
