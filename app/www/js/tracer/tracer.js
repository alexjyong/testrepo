/* global Paths, Sound */
const Tracer = (function () {

    var canvas, ctx;
    var celebrationEl, celebrationTitle, celebrationMsg, celebrationMeaning;
    var playAgainBtn, celebrationBack;
    var promptBanner;
    var confettiParts = [];
    var confettiCanvas = null;

    var currentMode = "numbers";
    var currentDifficulty = "easy";
    var currentCharacter = null;
    var currentWordEntry = null;
    var renderChars = [];
    var activeCharIndex = 0;
    var isTracing = false;
    var tracePoints = [];
    var offPathPoints = [];
    var mistakesCount = 0;
    var hintsUsed = 0;
    var successCount = 0;
    var failureCount = 0;
    var charactersTraced = [];
    var charactersPerSet = 3;
    var tracingTolerance = 50;
    var hintFrequency = 1;
    var showStrokeHints = true;
    var lastTouchTime = 0;
    var renderLoopId = null;
    var progressFraction = 0;
    var pathCoverageMap = {};
    var currentSegmentIndex = 0;
    var segmentSamples = [];

    var BASE_CHAR_SIZE = 100;
    var CHAR_GAP = 15;

    var DIFFICULTY_CONFIG = {
        "easy":   { tolerance: 35, setSize: 3, hintFrequency: 1, showHints: true },
        "medium": { tolerance: 25, setSize: 5, hintFrequency: 1, showHints: false },
        "hard":   { tolerance: 15, setSize: 8, hintFrequency: 3, showHints: false }
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
        _resizeTimer = setTimeout(resizeCanvas, 150);
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

        if (renderChars.length > 0) {
            drawAllCharacters();
            drawActiveCharStrokeHints();
            drawActiveCharHintLabels();
            drawGlowTrail();
            drawOffPathFeedback();
            drawTracePoints();
            updateProgressFraction();
        }

        drawProgressBar();
        updatePromptBannerOpacity();
        renderConfetti();
    }

    function getCharLayout() {
        var n = renderChars.length;
        if (n === 0) return [];

        var scale = getScaleFactor(n);
        var gap = CHAR_GAP * scale;
        var totalWidth = 0;
        var charWidths = [];

        for (var i = 0; i < n; i++) {
            var pd = Paths.getPath(renderChars[i]);
            var w = pd ? pd.boundingBox.width * scale : BASE_CHAR_SIZE * scale;
            charWidths.push(w);
            totalWidth += w;
        }
        totalWidth += gap * (n - 1);

        var startX = (canvas.width - totalWidth) / 2;
        var layouts = [];
        var cx = startX;

        for (var j = 0; j < n; j++) {
            var pd2 = Paths.getPath(renderChars[j]);
            var cw = charWidths[j];
            var ch = pd2 ? pd2.boundingBox.height * scale : BASE_CHAR_SIZE * scale;
            var ox = pd2 ? (cx - pd2.boundingBox.x * scale) : cx;
            var oy = pd2 ? ((canvas.height - ch) / 2 - pd2.boundingBox.y * scale) : (canvas.height - ch) / 2;

            layouts.push({
                char: renderChars[j],
                pathData: pd2,
                scale: scale,
                offsetX: ox,
                offsetY: oy,
                width: cw,
                x: cx
            });
            cx += cw + gap;
        }

        return layouts;
    }

    function drawAllCharacters() {
        var layouts = getCharLayout();

        for (var i = 0; i < layouts.length; i++) {
            var L = layouts[i];
            if (!L.pathData) continue;

            var isActive = (i === activeCharIndex);
            var isComplete = (i < activeCharIndex);
            var coverage = pathCoverageMap[renderChars[i]] || 0;

            ctx.save();
            ctx.translate(L.offsetX, L.offsetY);
            ctx.scale(L.scale, L.scale);

            for (var s = 0; s < L.pathData.paths.length; s++) {
                ctx.beginPath();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                if (isComplete) {
                    ctx.setLineDash([]);
                    ctx.strokeStyle = '#4ECDC4';
                    ctx.lineWidth = 8;
                } else if (isActive) {
                    if (coverage > 0.95) {
                        ctx.setLineDash([]);
                        ctx.strokeStyle = '#4ECDC4';
                        ctx.lineWidth = 8;
                    } else if (s === 0 || L.pathData.paths.length === 1) {
                        ctx.setLineDash([8, 4]);
                        ctx.strokeStyle = 'rgba(78, 205, 196, ' + (0.3 + 0.7 * coverage) + ')';
                        ctx.lineWidth = 3 + 5 * coverage;
                    } else {
                        ctx.setLineDash([8, 4]);
                        ctx.strokeStyle = 'rgba(150, 150, 180, 0.5)';
                        ctx.lineWidth = 3;
                    }
                } else {
                    ctx.setLineDash([8, 4]);
                    ctx.strokeStyle = 'rgba(150, 150, 180, 0.35)';
                    ctx.lineWidth = 3;
                }

                parseAndDrawPath(L.pathData.paths[s]);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function drawActiveCharStrokeHints() {
        if (!showStrokeHints || renderChars.length === 0) return;
        if (activeCharIndex >= renderChars.length) return;

        var layouts = getCharLayout();
        var L = layouts[activeCharIndex];
        if (!L || !L.pathData) return;

        ctx.save();
        ctx.translate(L.offsetX, L.offsetY);
        ctx.scale(L.scale, L.scale);

        for (var i = 0; i < L.pathData.paths.length; i++) {
            var strokeNum = L.pathData.strokeOrder[i] || (i + 1);
            var firstCmd = L.pathData.paths[i].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            if (!firstCmd) continue;

            var sx = parseFloat(firstCmd[1]);
            var sy = parseFloat(firstCmd[2]);

            ctx.beginPath();
            ctx.arc(sx, sy, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(93, 173, 226, 0.8)';
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(strokeNum.toString(), sx, sy);
        }

        ctx.restore();
    }

    function drawActiveCharHintLabels() {
        if (!showStrokeHints || activeCharIndex >= renderChars.length) return;
        var layouts = getCharLayout();
        var L = layouts[activeCharIndex];
        if (!L || !L.pathData || L.pathData.paths.length <= 1) return;

        ctx.save();
        ctx.translate(L.offsetX, L.offsetY);
        ctx.scale(L.scale, L.scale);

        for (var i = 0; i < L.pathData.paths.length - 1; i++) {
            var curCmd = L.pathData.paths[i].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            var nextCmd = L.pathData.paths[i + 1].match(/M\s*([0-9.]+)\s*([0-9.]+)/);
            if (!curCmd || !nextCmd) continue;

            var fx = parseFloat(curCmd[1]);
            var fy = parseFloat(curCmd[2]);
            var tx = parseFloat(nextCmd[1]);
            var ty = parseFloat(nextCmd[2]);
            drawArrow(fx, fy, tx, ty);
        }

        ctx.restore();
    }

    function drawArrow(fromX, fromY, toX, toY) {
        var dx = toX - fromX;
        var dy = toY - fromY;
        var angle = Math.atan2(dy, dx);
        var arrowLen = 10;
        var midX = fromX + dx * 0.3;
        var midY = fromY + dy * 0.3;

        ctx.save();
        ctx.strokeStyle = 'rgba(93, 173, 226, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);

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

    function getScaleFactor(numChars) {
        var n = numChars || renderChars.length || 1;
        var rect = canvas.getBoundingClientRect();
        var availWidth = rect.width * 0.85;
        var availHeight = rect.height * 0.75;
        var singleCharSize = Math.min(availWidth / n, availHeight);
        return Math.max(0.5, Math.min(3.0, singleCharSize / BASE_CHAR_SIZE));
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

    function buildSegmentSamples(pathData, charIdx) {
        segmentSamples = [];
        var layouts = getCharLayout();
        if (charIdx >= layouts.length) return;
        var L = layouts[charIdx];
        var tolerancePx = getTolerancePx(charIdx);

        var rawPoints = [];
        for (var i = 0; i < pathData.paths.length; i++) {
            var commands = pathData.paths[i].match(/[MLCZ]|[+-]?\d*\.?\d+/g);
            if (!commands) continue;
            var x = 0, y = 0, prevX = 0, prevY = 0;
            var segs = [];
            for (var j = 0; j < commands.length; j++) {
                var cmd = commands[j];
                if (cmd === 'M' || cmd === 'm') {
                    j++; x = parseFloat(commands[j]);
                    j++; y = parseFloat(commands[j]);
                    prevX = x; prevY = y;
                } else if (cmd === 'L' || cmd === 'l') {
                    j++; x = parseFloat(commands[j]);
                    j++; y = parseFloat(commands[j]);
                    segs.push(lineSegs(prevX, prevY, x, y, 10));
                    prevX = x; prevY = y;
                } else if (cmd === 'C' || cmd === 'c') {
                    j++; var cx1 = parseFloat(commands[j]);
                    j++; var cy1 = parseFloat(commands[j]);
                    j++; var cx2 = parseFloat(commands[j]);
                    j++; var cy2 = parseFloat(commands[j]);
                    j++; var ex = parseFloat(commands[j]);
                    j++; var ey = parseFloat(commands[j]);
                    segs.push(bezSegs(prevX, prevY, cx1, cy1, cx2, cy2, ex, ey, 15));
                    prevX = ex; prevY = ey;
                }
            }
            for (var s = 0; s < segs.length; s++) {
                rawPoints = rawPoints.concat(segs[s]);
            }
        }

        var totalSegs = 40;
        var segSize = Math.max(1, Math.floor(rawPoints.length / totalSegs));
        for (var k = 0; k < totalSegs && k * segSize < rawPoints.length; k++) {
            var segPoints = [];
            for (var m = 0; m < segSize && (k * segSize + m) < rawPoints.length; m++) {
                var rp = rawPoints[k * segSize + m];
                segPoints.push({
                    x: rp.x * L.scale + L.offsetX,
                    y: rp.y * L.scale + L.offsetY
                });
            }
            if (segPoints.length === 0) break;
            var segCenter = segPoints[0];
            segmentSamples.push({
                points: segPoints,
                center: segCenter,
                tolerance: tolerancePx,
                coveredTraceCount: 0,
                complete: false
            });
        }

        currentSegmentIndex = 0;
    }

    function getTolerancePx(charIdx) {
        var pd = charIdx < renderChars.length ? Paths.getPath(renderChars[charIdx]) : null;
        var bboxSize = pd ? Math.max(pd.boundingBox.width, pd.boundingBox.height) : BASE_CHAR_SIZE;
        var scale = getScaleFactor(renderChars.length);
        return (tracingTolerance / 100) * bboxSize * scale;
    }

    function evaluateSegments() {
        if (segmentSamples.length === 0 || tracePoints.length === 0) return;
        for (var i = 0; i < segmentSamples.length; i++) {
            segmentSamples[i].complete = false;
        }

        for (var i = 0; i < segmentSamples.length; i++) {
            var seg = segmentSamples[i];
            var covered = 0;
            for (var j = 0; j < seg.points.length; j++) {
                var sp = seg.points[j];
                for (var k = 0; k < tracePoints.length; k++) {
                    var tp = tracePoints[k];
                    var dx = sp.x - tp.x;
                    var dy = sp.y - tp.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= seg.tolerance) {
                        covered++;
                        break;
                    }
                }
            }
            var threshold = Math.max(1, Math.ceil(seg.points.length * 0.8));
            seg.complete = (covered >= threshold);
        }
    }

    function getSequentialCompletion() {
        if (segmentSamples.length === 0) return 0;
        for (var i = 0; i < segmentSamples.length; i++) {
            if (!segmentSamples[i].complete) {
                return i;
            }
        }
        return segmentSamples.length;
    }

    function updateProgressFraction() {
        if (activeCharIndex >= renderChars.length) { progressFraction = 1; return; }
        if (segmentSamples.length === 0) { progressFraction = 0; return; }
        var ch = renderChars[activeCharIndex];
        var seq = getSequentialCompletion();
        progressFraction = seq / segmentSamples.length;
        pathCoverageMap[ch] = progressFraction;
    }

    function isActiveCharComplete() {
        if (segmentSamples.length === 0) return false;
        var seq = getSequentialCompletion();
        return (seq / segmentSamples.length) >= 0.9;
    }

    function isPointOnActivePath(px, py) {
        if (segmentSamples.length === 0) return true;
        for (var i = 0; i < segmentSamples.length; i++) {
            var seg = segmentSamples[i];
            if (!seg) continue;
            for (var j = 0; j < seg.points.length; j++) {
                var sp = seg.points[j];
                var dx = sp.x - px;
                var dy = sp.y - py;
                if (Math.sqrt(dx * dx + dy * dy) <= seg.tolerance) return true;
            }
        }
        return false;
    }

    function lineSegs(x1, y1, x2, y2, n) {
        var pts = [];
        for (var i = 0; i <= n; i++) {
            var t = i / n;
            pts.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t });
        }
        return pts;
    }

    function bezSegs(x1, y1, cx1, cy1, cx2, cy2, x2, y2, n) {
        var pts = [];
        for (var i = 0; i <= n; i++) {
            var t = i / n;
            var mt = 1 - t;
            pts.push({
                x: mt*mt*mt*x1 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x2,
                y: mt*mt*mt*y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y2
            });
        }
        return pts;
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
        var dotGap = 16;
        var totalDotWidth = charactersTraced.length * (dotSize + dotGap) - dotGap;
        var dotStartX = (canvas.width - totalDotWidth) / 2;
        var dotY = y - 16;

        for (var i = 0; i < charactersTraced.length; i++) {
            var dotX = dotStartX + i * (dotSize + dotGap);
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

    function updatePromptBannerOpacity() {
        if (!promptBanner) return;
        if (renderChars.length > 0 && !isTracing && tracePoints.length === 0) {
            promptBanner.style.opacity = '1';
        } else if (isTracing) {
            promptBanner.style.opacity = '0.4';
        }
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
        if (activeCharIndex >= renderChars.length) return;

        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;

        var coords = getCanvasCoordinates(e);
        if (!isPointNearActiveChar(coords.x, coords.y)) return;

        var ch = renderChars[activeCharIndex];
        var pathData = Paths.getPath(ch);
        if (pathData) buildSegmentSamples(pathData, activeCharIndex);

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
        evaluateSegments();
        updateProgressFraction();

        var onPath = isPointOnActivePath(coords.x, coords.y);
        if (!onPath) {
            offPathPoints.push(coords);
            if (offPathPoints.length > 20) offPathPoints.shift();

            if (!showStrokeHints) {
                mistakesCount++;
                if (mistakesCount >= hintFrequency * 3) {
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
        evaluateSegments();

        if (isActiveCharComplete()) {
            onSubCharSuccess();
        } else {
            onSubCharFailure();
        }
    }

    function handleMouseDown(e) {
        if (activeCharIndex >= renderChars.length) return;
        var now = Date.now();
        if (now - lastTouchTime < 100) return;
        lastTouchTime = now;

        var coords = getCanvasCoordinates(e);
        if (!isPointNearActiveChar(coords.x, coords.y)) return;

        var ch = renderChars[activeCharIndex];
        var pathData = Paths.getPath(ch);
        if (pathData) buildSegmentSamples(pathData, activeCharIndex);

        isTracing = true;
        tracePoints = [coords];
        offPathPoints = [];
        mistakesCount = 0;
    }

    function handleMouseMove(e) {
        if (!isTracing) return;
        var coords = getCanvasCoordinates(e);
        tracePoints.push(coords);
        evaluateSegments();
        updateProgressFraction();

        var onPath = isPointOnActivePath(coords.x, coords.y);
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
        evaluateSegments();

        if (isActiveCharComplete()) {
            onSubCharSuccess();
        } else {
            onSubCharFailure();
        }
    }

    function isPointNearActiveChar(px, py) {
        var layouts = getCharLayout();
        if (activeCharIndex >= layouts.length) return false;
        var L = layouts[activeCharIndex];
        if (!L.pathData) return true;

        var scale = L.scale;
        var tolerancePx = (tracingTolerance / 100) * BASE_CHAR_SIZE * scale * 1.5;
        var cx = L.x + L.width / 2;
        var cy = canvas.height / 2;
        var halfW = L.width / 2 + tolerancePx;
        var halfH = (L.pathData.boundingBox.height * scale) / 2 + tolerancePx;

        return Math.abs(px - cx) <= halfW && Math.abs(py - cy) <= halfH;
    }

    function onSubCharSuccess() {
        var ch = renderChars[activeCharIndex];
        pathCoverageMap[ch] = 1;
        segmentSamples = [];

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.match();
            speakCharSuccess(ch);
        }

        activeCharIndex++;
        tracePoints = [];
        offPathPoints = [];
        progressFraction = 0;

        if (activeCharIndex >= renderChars.length) {
            onFullCharacterSuccess();
        } else {
            showStrokeHints = DIFFICULTY_CONFIG[currentDifficulty].showHints;
            updatePromptBanner();
            if (typeof Sound !== 'undefined') {
                setTimeout(function () { announceSubChar(); }, 400);
            }
        }
    }

    function onSubCharFailure() {
        failureCount++;
        tracePoints = [];
        segmentSamples = [];

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.noMatch();
            Sound.speak("Try again!");
        }

        if (failureCount >= 3) {
            showStrokeHints = true;
            failureCount = 0;
            if (typeof Sound !== 'undefined') {
                Sound.speak("Follow the numbered dots!");
            }
        }
    }

    function onFullCharacterSuccess() {
        successCount++;
        charactersTraced.push({
            character: currentCharacter,
            success: true,
            timestamp: Date.now(),
            mistakesCount: mistakesCount,
            hintsUsed: hintsUsed
        });

        if (typeof Sound !== 'undefined') {
            Sound.celebrate();
            speakFullSuccess();
        }

        if (charactersTraced.length >= charactersPerSet) {
            setTimeout(showCelebration, 500);
        } else {
            setTimeout(loadNewCharacter, 800);
        }
    }

    function speakCharSuccess(ch) {
        if (typeof Sound === 'undefined') return;
        if (currentMode === "letters") {
            var pd = Paths.getPath(ch);
            if (pd && pd.exampleWord) {
                Sound.speak(ch + " is for " + pd.exampleWord + "!");
            } else {
                Sound.speak("Great! " + ch);
            }
        } else if (currentMode === "numbers") {
            Sound.speak(numberToWords(parseInt(ch)));
        } else if (currentMode === "multi-digit") {
            Sound.speak(numberToWords(parseInt(ch)));
        } else if (currentMode === "words" && currentWordEntry) {
            Sound.speak(ch);
        }
    }

    function speakFullSuccess() {
        if (typeof Sound === 'undefined') return;
        if (currentMode === "words" && currentWordEntry) {
            var letters = currentWordEntry.letters.join(", ");
            Sound.speak(letters + "! " + currentWordEntry.word.toLowerCase() + "!");
        } else if (currentMode === "multi-digit") {
            Sound.speak(numberToWords(parseInt(currentCharacter)));
        }
    }

    function announceSubChar() {
        if (typeof Sound === 'undefined') return;
        if (activeCharIndex >= renderChars.length) return;
        var ch = renderChars[activeCharIndex];

        if (currentMode === "numbers") {
            Sound.speak("Trace the number " + numberToWords(parseInt(ch)));
        } else if (currentMode === "letters") {
            Sound.speak("Trace the letter " + ch);
        } else if (currentMode === "multi-digit") {
            Sound.speak("Now trace " + numberToWords(parseInt(ch)));
        } else if (currentMode === "words" && currentWordEntry) {
            Sound.speak("Trace the letter " + ch);
        }
    }

    function numberToWords(num) {
        if (isNaN(num) || num < 0 || num > 999) return (num || 0).toString();
        var ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
                     "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
                     "seventeen", "eighteen", "nineteen"];
        var tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        if (num <= 19) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
        return numberToWords(Math.floor(num / 100)) + " hundred" + (num % 100 ? " " + numberToWords(num % 100) : "");
    }

    function loadNewCharacter() {
        hideCelebration();
        tracePoints = [];
        offPathPoints = [];
        mistakesCount = 0;
        hintsUsed = 0;
        progressFraction = 0;
        pathCoverageMap = {};
        segmentSamples = [];
        currentSegmentIndex = 0;
        showStrokeHints = DIFFICULTY_CONFIG[currentDifficulty].showHints;

        var tracedSet = {};
        for (var t = 0; t < charactersTraced.length; t++) {
            tracedSet[charactersTraced[t].character] = true;
        }

        currentWordEntry = null;
        renderChars = [];
        activeCharIndex = 0;

        switch (currentMode) {
            case "numbers":
                var nums = Paths.getCharactersForMode("numbers");
                var availNum = nums.filter(function (c) { return !tracedSet[c]; });
                if (availNum.length === 0) availNum = nums;
                currentCharacter = availNum[Math.floor(Math.random() * availNum.length)];
                renderChars = [currentCharacter];
                break;

            case "letters":
                var lets = Paths.getCharactersForMode("letters");
                var availLet = lets.filter(function (c) { return !tracedSet[c]; });
                if (availLet.length === 0) availLet = lets;
                currentCharacter = availLet[Math.floor(Math.random() * availLet.length)];
                renderChars = [currentCharacter];
                break;

            case "multi-digit":
                var numDigits = Math.random() < 0.3 ? 3 : 2;
                var minNum = numDigits === 3 ? 100 : 10;
                var maxNum = numDigits === 3 ? 999 : 99;
                var num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
                currentCharacter = num.toString();
                renderChars = currentCharacter.split('');
                break;

            case "words":
                var words = Paths.getWordEntries();
                currentWordEntry = words[Math.floor(Math.random() * words.length)];
                currentCharacter = currentWordEntry.word;
                renderChars = currentWordEntry.letters.slice();
                break;
        }

        updatePromptBanner();

        if (typeof Sound !== 'undefined') {
            setTimeout(function () { announceCharacter(); }, 300);
        }
    }

    function updatePromptBanner() {
        if (!promptBanner) return;
        var ch = activeCharIndex < renderChars.length ? renderChars[activeCharIndex] : '';

        if (currentMode === "numbers") {
            promptBanner.textContent = "Trace the number " + (renderChars.length > 1 ? currentCharacter : ch) + "!";
        } else if (currentMode === "letters") {
            promptBanner.textContent = "Trace the letter " + ch + "!";
        } else if (currentMode === "multi-digit") {
            promptBanner.textContent = "Trace " + currentCharacter + "! Letter " + (activeCharIndex + 1) + " of " + renderChars.length;
        } else if (currentMode === "words" && currentWordEntry) {
            promptBanner.textContent = "Trace " + currentWordEntry.word + "! Letter " + (activeCharIndex + 1) + " of " + renderChars.length;
        }
    }

    function announceCharacter() {
        if (typeof Sound === 'undefined') return;
        if (currentMode === "numbers") {
            Sound.speak("Trace the number " + numberToWords(parseInt(currentCharacter)));
        } else if (currentMode === "letters") {
            Sound.speak("Trace the letter " + currentCharacter);
        } else if (currentMode === "multi-digit") {
            Sound.speak("Trace the number " + numberToWords(parseInt(currentCharacter)));
        } else if (currentMode === "words" && currentWordEntry) {
            Sound.speak("Trace the word " + currentWordEntry.word.toLowerCase());
        }
    }

    function showCelebration() {
        if (!celebrationEl) return;

        spawnConfetti();

        var phrase = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
        celebrationTitle.textContent = phrase;

        var msg = "";
        if (currentMode === "numbers") {
            msg = "You traced " + successCount + " number" + (successCount !== 1 ? "s" : "") + "!";
        } else if (currentMode === "letters") {
            msg = "You traced " + successCount + " letter" + (successCount !== 1 ? "s" : "") + "!";
        } else if (currentMode === "multi-digit") {
            msg = "You traced " + successCount + " number" + (successCount !== 1 ? "s" : "") + "!";
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

    function spawnConfetti() {
        confettiParts = [];
        var colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#AA96DA', '#F38181', '#95E1D3', '#FCBAD3', '#B8E986'];
        for (var i = 0; i < 60; i++) {
            confettiParts.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 10 - 4,
                w: Math.random() * 10 + 4,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                life: 1
            });
        }
    }

    function renderConfetti() {
        if (confettiParts.length === 0) return;
        var gravity = 0.25;
        var alive = [];

        ctx.save();
        for (var i = 0; i < confettiParts.length; i++) {
            var p = confettiParts[i];
            p.vy += gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.life -= 0.008;

            if (p.life <= 0 || p.y > canvas.height + 50) continue;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();

            alive.push(p);
        }
        ctx.restore();
        confettiParts = alive;
    }

    function playAgain() {
        hideCelebration();
        confettiParts = [];
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

    return { init: init };

})();

document.addEventListener('DOMContentLoaded', Tracer.init);
