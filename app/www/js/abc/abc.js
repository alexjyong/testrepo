/**
 * SproutPlay - ABC Letters Mini-App
 * Endless Alphabet style: one word at a time, scattered letters, drag to slots
 */

document.addEventListener('DOMContentLoaded', function () {

    // ── Word List ─────────────────────────────────────────────────

    var WORD_LIST = [
        { word: 'CAT', meaning: 'A furry animal that says meow! 🐱' },
        { word: 'DOG', meaning: 'A loyal pet that says woof! 🐶' },
        { word: 'RUN', meaning: 'Move your legs super fast! 🏃' },
        { word: 'BIG', meaning: 'Very large — like a giant! 🐘' },
        { word: 'SUN', meaning: 'The warm star in the sky! ☀️' },
        { word: 'HAT', meaning: 'Something you wear on your head! 🧢' },
        { word: 'CUP', meaning: 'You drink water from it! 🥤' },
        { word: 'BED', meaning: 'Where you sleep at night! 🛏️' },
        { word: 'RED', meaning: 'The color of fire trucks! 🚒' },
        { word: 'FUN', meaning: 'Playing makes you say this! 🎉' }
    ];

    var LETTER_COLORS = {
        A:'#E74C3C',B:'#3498DB',C:'#F1C40F',D:'#68B25B',E:'#E67E22',
        F:'#9B59B6',G:'#1ABC9C',H:'#34495E',I:'#E91E63',J:'#00BCD4',
        K:'#FF5722',L:'#8BC34A',M:'#FFC107',N:'#673AB7',O:'#4CAF50',
        P:'#FF9800',Q:'#795548',R:'#F44336',S:'#2196F3',T:'#607D8B',
        U:'#CDDC39',V:'#E040FB',W:'#009688',X:'#A1887F',Y:'#FFEB3B',Z:'#6A1B9A'
    };

    // ── State ────────────────────────────────────────────────────

    var currentWordIndex = 0;
    var slots = [];       // { el, letter, filled }
    var letterTiles = []; // { el, letter, x, y, originalX, originalY }
    var activeDrag = null;

    // ── DOM ──────────────────────────────────────────────────────

    var slotsContainer = document.getElementById('word-slots');
    var letterArea = document.getElementById('letter-area');
    var nextBtn = document.getElementById('next-word-btn');
    var celebrationEl = document.getElementById('celebration');
    var celebrationWordEl = document.getElementById('celebration-word');
    var celebrationMeaningEl = document.getElementById('celebration-meaning');
    var playAgainBtn = document.getElementById('play-again-btn');
    var celebrationBackBtn = document.getElementById('celebration-back');
    var backButton = document.getElementById('abc-back');
    var debugEl = document.getElementById('debug-log');

    function debug(msg) {
        if (debugEl) {
            debugEl.textContent = msg;
            console.log('[ABC]', msg);
        }
    }

    // Make debug global so sound.js can use it
    window._debug = debug;

    // ── Init ─────────────────────────────────────────────────────

    function init() {
        backButton && backButton.addEventListener('click', function() { window.location.href = '../index.html'; });
        nextBtn && nextBtn.addEventListener('click', loadNextWord);
        playAgainBtn && playAgainBtn.addEventListener('click', function() { hideCelebration(); loadNextWord(); });
        celebrationBackBtn && celebrationBackBtn.addEventListener('click', function() { window.location.href = '../index.html'; });

        loadWord(0);
    }

    function loadWord(index) {
        currentWordIndex = index % WORD_LIST.length;
        hideCelebration();
        createSlots();
        scatterLetters();
    }

    function loadNextWord() {
        loadWord(currentWordIndex + 1);
    }

    // ── Slots ────────────────────────────────────────────────────

    function createSlots() {
        var word = WORD_LIST[currentWordIndex].word;
        slotsContainer.innerHTML = '';
        slots = [];

        for (var i = 0; i < word.length; i++) {
            var slot = document.createElement('div');
            slot.className = 'word-slot';
            slot.dataset.index = i;
            slotsContainer.appendChild(slot);
            slots.push({ el: slot, letter: word[i], filled: false });
        }
    }

    // ── Scatter Letters ──────────────────────────────────────────

    function scatterLetters() {
        letterArea.innerHTML = '';
        letterTiles = [];

        var word = WORD_LIST[currentWordIndex].word;
        var letters = word.split('');
        var areaRect = letterArea.getBoundingClientRect();
        var tileW = 64;
        var tileH = 64;
        var padding = 20;

        // Shuffle letters
        letters.sort(function() { return Math.random() - 0.5; });

        // Scatter with collision avoidance
        var placed = [];
        for (var i = 0; i < letters.length; i++) {
            var letter = letters[i];
            var pos = findFreePosition(areaRect, tileW, tileH, padding, placed);

            var tile = document.createElement('div');
            tile.className = 'letter-tile letter-color-' + letter;
            tile.textContent = letter;
            tile.style.left = pos.x + 'px';
            tile.style.top = pos.y + 'px';

            var tileObj = { el: tile, letter: letter, x: pos.x, y: pos.y, originalX: pos.x, originalY: pos.y };
            letterTiles.push(tileObj);
            placed.push({ x: pos.x, y: pos.y, w: tileW, h: tileH });

            // Touch events
            tile.addEventListener('touchstart', startDrag, { passive: false });
            tile.addEventListener('mousedown', startDrag);

            letterArea.appendChild(tile);
        }
    }

    function findFreePosition(areaRect, tileW, tileH, padding, placed) {
        var maxAttempts = 100;
        for (var attempt = 0; attempt < maxAttempts; attempt++) {
            var x = padding + Math.random() * (areaRect.width - tileW - padding * 2);
            var y = padding + Math.random() * (areaRect.height - tileH - padding * 2);

            // Check overlap
            var overlap = false;
            for (var i = 0; i < placed.length; i++) {
                var p = placed[i];
                if (x < p.x + p.w + padding && x + tileW + padding > p.x &&
                    y < p.y + p.h + padding && y + tileH + padding > p.y) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) return { x: x, y: y };
        }
        // Fallback
        return { x: padding + Math.random() * 50, y: padding + Math.random() * 50 };
    }

    // ── Drag & Drop ──────────────────────────────────────────────

    function startDrag(e) {
        e.preventDefault();
        if (activeDrag) return;

        var tile = e.currentTarget;
        var tileObj = findTileObj(tile);
        if (!tileObj || tileObj.el.classList.contains('placed')) return;

        activeDrag = tileObj;

        // Initialize sound on first interaction
        if (typeof Sound !== 'undefined') Sound.init();

        // Play phonics sound
        if (typeof Sound !== 'undefined') {
            Sound.phonics(tileObj.letter);
        }
        debug('Tapped: ' + tileObj.letter);

        var rect = tileObj.el.getBoundingClientRect();
        var point = e.touches ? e.touches[0] : e;

        // Store offset from the tile's top-left corner
        activeDrag.offsetX = point.clientX - rect.left;
        activeDrag.offsetY = point.clientY - rect.top;

        tileObj.el.classList.add('dragging');

        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
    }

    function moveDrag(e) {
        e.preventDefault();
        if (!activeDrag) return;

        var point = e.touches ? e.touches[0] : e;
        var areaRect = letterArea.getBoundingClientRect();

        // Calculate new position relative to letterArea
        var newX = point.clientX - areaRect.left - activeDrag.offsetX;
        var newY = point.clientY - areaRect.top - activeDrag.offsetY;

        activeDrag.el.style.left = newX + 'px';
        activeDrag.el.style.top = newY + 'px';

        // Highlight matching slot
        var slot = getSlotAtPoint(point.clientX, point.clientY);
        slots.forEach(function(s) { s.el.classList.remove('drag-over'); });
        if (slot) slot.el.classList.add('drag-over');
    }

    function endDrag(e) {
        if (!activeDrag) return;

        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);

        var point = e.changedTouches ? e.changedTouches[0] : e;
        var slot = getSlotAtPoint(point.clientX, point.clientY);

        if (slot && slot.letter === activeDrag.letter && !slot.filled) {
            // Correct slot!
            fillSlot(slot, activeDrag);
        } else {
            // Wrong — animate back to original position
            animateBack(activeDrag);
        }

        activeDrag.el.classList.remove('dragging');
        slots.forEach(function(s) { s.el.classList.remove('drag-over'); });
        activeDrag = null;
    }

    function getSlotAtPoint(cx, cy) {
        for (var i = 0; i < slots.length; i++) {
            var rect = slots[i].el.getBoundingClientRect();
            if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
                return slots[i];
            }
        }
        return null;
    }

    function fillSlot(slot, tileObj) {
        slot.filled = true;
        slot.el.classList.add('filled');
        slot.el.innerHTML = '<span class="dropped-letter">' + slot.letter + '</span>';

        // Play phonics sound again
        if (typeof Sound !== 'undefined') Sound.phonics(tileObj.letter);

        // Hide the tile
        tileObj.el.classList.add('placed');

        // Check if word complete
        var allFilled = slots.every(function(s) { return s.filled; });
        if (allFilled) {
            setTimeout(showCelebration, 500);
        }
    }

    function animateBack(tileObj) {
        // Simple CSS transition back to original position
        tileObj.el.style.transition = 'left 0.3s ease, top 0.3s ease';
        tileObj.el.style.left = tileObj.originalX + 'px';
        tileObj.el.style.top = tileObj.originalY + 'px';
        setTimeout(function() {
            tileObj.el.style.transition = '';
        }, 300);
    }

    function findTileObj(tile) {
        for (var i = 0; i < letterTiles.length; i++) {
            if (letterTiles[i].el === tile) return letterTiles[i];
        }
        return null;
    }

    // ── Celebration ──────────────────────────────────────────────

    function showCelebration() {
        var wordObj = WORD_LIST[currentWordIndex];
        if (celebrationWordEl) celebrationWordEl.textContent = wordObj.word + '!';
        if (celebrationMeaningEl) celebrationMeaningEl.textContent = wordObj.meaning;
        if (celebrationEl) celebrationEl.style.display = 'flex';

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.celebrate();
        }
    }

    function hideCelebration() {
        if (celebrationEl) celebrationEl.style.display = 'none';
    }

    // ── Start ────────────────────────────────────────────────────

    init();

});
