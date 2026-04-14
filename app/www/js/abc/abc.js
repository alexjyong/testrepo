/**
 * SproutPlay - ABC Letters Mini-App
 * Endless Alphabet style: one word at a time, scattered letters, drag to slots
 */

document.addEventListener('DOMContentLoaded', function () {

    // ── Word List ─────────────────────────────────────────────────

    var WORD_LIST = [
        // 3-letter words
        { word: 'CAT', meaning: 'A furry animal that says meow! 🐱' },
        { word: 'DOG', meaning: 'A loyal pet that says woof! 🐶' },
        { word: 'RUN', meaning: 'Move your legs super fast! 🏃' },
        { word: 'BIG', meaning: 'Very large — like a giant! 🐘' },
        { word: 'SUN', meaning: 'The warm star in the sky! ☀️' },
        { word: 'HAT', meaning: 'Something you wear on your head! 🧢' },
        { word: 'CUP', meaning: 'You drink water from it! 🥤' },
        { word: 'BED', meaning: 'Where you sleep at night! 🛏️' },
        { word: 'RED', meaning: 'The color of fire trucks! 🚒' },
        { word: 'FUN', meaning: 'Playing makes you say this! 🎉' },
        { word: 'BOX', meaning: 'You put toys inside! 📦' },
        { word: 'MUD', meaning: 'Wet dirt on the ground! 💧' },
        // 4-letter words
        { word: 'FROG', meaning: 'A green animal that says ribbit! 🐸' },
        { word: 'BIRD', meaning: 'A creature that flies in the sky! 🐦' },
        { word: 'FISH', meaning: 'An animal that swims in water! 🐟' },
        { word: 'DUCK', meaning: 'A bird that says quack! 🦆' },
        { word: 'CAKE', meaning: 'A sweet treat for birthdays! 🎂' },
        { word: 'TREE', meaning: 'A tall plant with leaves! 🌳' },
        // 5-letter words
        { word: 'APPLE', meaning: 'A red fruit that is crunchy! 🍎' },
        { word: 'HORSE', meaning: 'A big animal you can ride! 🐴' },
        { word: 'TIGER', meaning: 'A big cat with stripes! 🐅' },
        { word: 'SHEEP', meaning: 'A fluffy animal that says baa! 🐑' },
        { word: 'PEACH', meaning: 'A soft sweet fruit! 🍑' },
        { word: 'BREAD', meaning: 'What you make toast from! 🍞' }
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
        playAgainBtn && playAgainBtn.addEventListener('click', function() { hideCelebration(); loadRandomWord(); });
        celebrationBackBtn && celebrationBackBtn.addEventListener('click', function() { window.location.href = '../index.html'; });

        loadRandomWord();
    }

    function loadWord(index) {
        currentWordIndex = index % WORD_LIST.length;
        hideCelebration();
        createSlots();

        // Show the complete word in slots first so kids see what to build
        showWordPreview();

        var word = WORD_LIST[currentWordIndex].word;

        // Read the whole word aloud using native TTS, then spell with phonics
        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.speak(word, 0.7).then(function() {
                // After the word is spoken, spell it out with phonics
                speakWordPhonics(word);
            });
        }

        // After a pause, clear the preview and scatter letters for building
        setTimeout(function() {
            clearWordPreview();
            scatterLetters();
        }, 2500);
    }

    function loadRandomWord() {
        loadWord(Math.floor(Math.random() * WORD_LIST.length));
    }

    function loadNextWord() {
        var next;
        do {
            next = Math.floor(Math.random() * WORD_LIST.length);
        } while (next === currentWordIndex && WORD_LIST.length > 1);
        loadWord(next);
    }

    // Show the complete word in the slots as a preview before scattering
    function showWordPreview() {
        var word = WORD_LIST[currentWordIndex].word;
        for (var i = 0; i < slots.length; i++) {
            var color = LETTER_COLORS[word[i]] || '#333';
            var size = parseInt(slots[i].el.style.width);
            var fontSize = size * 0.65;
            slots[i].el.style.background = color;
            slots[i].el.style.borderStyle = 'solid';
            slots[i].el.style.borderColor = color;
            slots[i].el.innerHTML = '<span style="font-size:' + fontSize + 'px; font-weight:800; color:#fff; text-shadow:1px 1px 2px rgba(0,0,0,0.3);">' + word[i] + '</span>';
        }
    }

    // Clear the preview so slots are empty and ready for dragging
    function clearWordPreview() {
        for (var i = 0; i < slots.length; i++) {
            slots[i].el.style.background = '';
            slots[i].el.style.borderStyle = '';
            slots[i].el.style.borderColor = '';
            slots[i].el.innerHTML = '';
            slots[i].filled = false;
        }
    }

    // Read a word aloud letter-by-letter using phonics (works on Android WebView)
    function speakWordPhonics(word) {
        if (typeof Sound === 'undefined') return;
        Sound.init();
        var letters = word.split('');
        letters.forEach(function(letter, i) {
            setTimeout(function() {
                Sound.phonics(letter);
            }, i * 500);
        });
    }

    // ── Slots ────────────────────────────────────────────────────

    function createSlots() {
        var word = WORD_LIST[currentWordIndex].word;
        slotsContainer.innerHTML = '';
        slots = [];

        // Adjust slot size based on word length
        var slotSize = word.length <= 3 ? 64 : word.length === 4 ? 56 : 48;

        for (var i = 0; i < word.length; i++) {
            var slot = document.createElement('div');
            slot.className = 'word-slot';
            slot.style.width = slotSize + 'px';
            slot.style.height = slotSize + 'px';
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
        var tileW = word.length <= 3 ? 64 : word.length === 4 ? 56 : 48;
        var tileH = tileW;
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

            // Entry animation: start off-screen, animate in
            tile.style.transform = 'scale(0.3)';
            tile.style.opacity = '0';
            setTimeout((function(t, delay) {
                return function() {
                    t.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
                    t.style.transform = 'scale(1)';
                    t.style.opacity = '1';
                    setTimeout(function() { t.style.transition = ''; }, 500);
                };
            })(tile, i * 150), 400 + i * 150);

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
        if (activeDrag) {
            // Safety: clear any stuck drag state from a previous interaction
            cleanupDrag();
        }

        var tile = e.currentTarget;
        var tileObj = findTileObj(tile);
        if (!tileObj) {
            debug('No tileObj found');
            return;
        }
        if (tileObj.el.classList.contains('placed')) {
            debug('Tile already placed: ' + tileObj.letter);
            return;
        }

        activeDrag = tileObj;
        debug('Start drag: ' + tileObj.letter);

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
        document.addEventListener('touchcancel', cancelDrag);
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

    function cleanupDrag() {
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('touchcancel', cancelDrag);
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);

        if (activeDrag) {
            activeDrag.el.classList.remove('dragging');
        }
        slots.forEach(function(s) { s.el.classList.remove('drag-over'); });
        activeDrag = null;
    }

    function endDrag(e) {
        if (!activeDrag) return;

        try {
            var point = e.changedTouches ? e.changedTouches[0] : e;
            var slot = getSlotAtPoint(point.clientX, point.clientY);

            if (slot && slot.letter === activeDrag.letter && !slot.filled) {
                fillSlot(slot, activeDrag);
            } else {
                animateBack(activeDrag);
            }
        } finally {
            cleanupDrag();
        }
    }

    function cancelDrag() {
        if (!activeDrag) return;
        animateBack(activeDrag);
        cleanupDrag();
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
        var color = LETTER_COLORS[slot.letter] || '#333';
        var size = parseInt(slot.el.style.width);
        var fontSize = size * 0.65;

        // Match the tile style: colored background with white text
        slot.el.style.background = color;
        slot.el.style.borderColor = color;
        slot.el.style.opacity = '1';
        slot.el.innerHTML = '<span class="dropped-letter" style="font-size:' + fontSize + 'px; font-weight:800; color:#fff; text-shadow:1px 1px 2px rgba(0,0,0,0.3); opacity:1;">' + slot.letter + '</span>';

        // Play phonics sound
        if (typeof Sound !== 'undefined') Sound.phonics(slot.letter);

        // Hide the dragged tile
        tileObj.el.classList.add('placed');

        // Check if word complete
        var allFilled = slots.every(function(s) { return s.filled; });
        debug('All filled: ' + allFilled + ' (' + slots.filter(function(s){return s.filled;}).length + '/' + slots.length + ')');
        if (allFilled) {
            setTimeout(showCelebration, 500);
        }
    }

    function animateBack(tileObj) {
        debug('animateBack: ' + tileObj.letter);
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

            // Read the word aloud, then the meaning
            var cleanMeaning = wordObj.meaning.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
            Sound.speak(wordObj.word, 0.7).then(function() {
                return Sound.speak(cleanMeaning, 0.85);
            });
        }
    }

    function hideCelebration() {
        if (celebrationEl) celebrationEl.style.display = 'none';
    }

    // ── Start ────────────────────────────────────────────────────

    init();

});
