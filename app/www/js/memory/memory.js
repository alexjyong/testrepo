/**
 * SproutPlay - Memory Matching Game
 * Kid-friendly card matching game using emojis
 */

document.addEventListener('DOMContentLoaded', function () {

    // ── Game Configuration ─────────────────────────────────────────────────

    var EMOJI_PAIRS = [
        '🐶', '🐱', '🐸', '🦊', '🐻', '🐼',
        '🐨', '🦁', '🐮', '🐷', '🐙', '🦄'
    ];
    var GRID_SIZE = 4;       // 4x4 grid
    var TOTAL_PAIRS = 8;     // 8 pairs = 16 cards
    var FLIP_BACK_DELAY = 800; // ms before non-matching cards flip back

    // ── Game State ─────────────────────────────────────────────────────────

    var cards = [];
    var flippedCards = [];
    var matchedPairs = 0;
    var moves = 0;
    var isLocked = false;    // prevent taps while checking match
    var gameStarted = false;
    var firstMoveTime = null;

    // ── DOM References ─────────────────────────────────────────────────────

    var gameBoard = document.getElementById('game-board');
    var moveCountEl = document.getElementById('move-count');
    var pairCountEl = document.getElementById('pair-count');
    var restartBtn = document.getElementById('restart-btn');
    var backButton = document.getElementById('memory-back');
    var celebrationEl = document.getElementById('celebration');
    var finalMovesEl = document.getElementById('final-moves');
    var playAgainBtn = document.getElementById('play-again-btn');
    var celebrationBackBtn = document.getElementById('celebration-back');

    // ── Initialize ─────────────────────────────────────────────────────────

    function init() {
        setupEventListeners();
        startNewGame();
    }

    function setupEventListeners() {
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.location.href = '../index.html';
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener('click', startNewGame);
        }

        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', function() {
                hideCelebration();
                startNewGame();
            });
        }

        if (celebrationBackBtn) {
            celebrationBackBtn.addEventListener('click', function() {
                window.location.href = '../index.html';
            });
        }
    }

    // ── Game Logic ─────────────────────────────────────────────────────────

    function startNewGame() {
        // Reset state
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        isLocked = false;
        gameStarted = false;
        firstMoveTime = null;

        // Update UI
        updateStats();
        hideCelebration();

        // Create and shuffle cards
        var emojis = getRandomEmojis(TOTAL_PAIRS);
        var cardValues = createCardValues(emojis);
        cards = shuffle(cardValues);

        // Render
        renderBoard();
    }

    function getRandomEmojis(count) {
        var shuffled = EMOJI_PAIRS.slice().sort(function() {
            return Math.random() - 0.5;
        });
        return shuffled.slice(0, count);
    }

    function createCardValues(emojis) {
        var values = [];
        for (var i = 0; i < emojis.length; i++) {
            values.push(emojis[i]);
            values.push(emojis[i]); // pair
        }
        return values;
    }

    function shuffle(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    function renderBoard() {
        gameBoard.innerHTML = '';

        for (var i = 0; i < cards.length; i++) {
            var card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = i;
            card.dataset.value = cards[i];

            card.innerHTML = 
                '<div class="card-inner">' +
                    '<div class="card-face card-front"></div>' +
                    '<div class="card-face card-back">' + cards[i] + '</div>' +
                '</div>';

            card.addEventListener('click', handleCardTap);
            card.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleCardTap.call(this, e);
            });

            gameBoard.appendChild(card);
        }
    }

    function handleCardTap(e) {
        if (isLocked) return;

        var cardEl = e.currentTarget;
        var index = parseInt(cardEl.dataset.index, 10);

        // Ignore already flipped/matched cards
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
            return;
        }

        // First move tracking
        if (!gameStarted) {
            gameStarted = true;
            firstMoveTime = Date.now();
        }

        // Play flip sound
        if (typeof Sound !== 'undefined') {
          Sound.init();
          Sound.flip();
        }

        // Flip the card
        flipCard(cardEl);
        flippedCards.push({ el: cardEl, index: index, value: cards[index] });

        // Check if two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            updateStats();
            checkMatch();
        }
    }

    function flipCard(cardEl) {
        cardEl.classList.add('flipped');
    }

    function unflipCard(cardEl) {
        cardEl.classList.remove('flipped');
    }

    function checkMatch() {
        isLocked = true;

        var card1 = flippedCards[0];
        var card2 = flippedCards[1];

        if (card1.value === card2.value) {
            // Match!
            card1.el.classList.add('matched');
            card2.el.classList.add('matched');
            matchedPairs++;
            updateStats();
            flippedCards = [];
            isLocked = false;

            // Play match sound
            if (typeof Sound !== 'undefined') {
              Sound.init();
              Sound.match();
            }

            // Check if game is complete
            if (matchedPairs === TOTAL_PAIRS) {
                setTimeout(showCelebration, 500);
            }
        } else {
            // No match - play sound and flip back after delay
            if (typeof Sound !== 'undefined') {
              Sound.init();
              Sound.noMatch();
            }

            setTimeout(function() {
                unflipCard(card1.el);
                unflipCard(card2.el);
                flippedCards = [];
                isLocked = false;
            }, FLIP_BACK_DELAY);
        }
    }

    function updateStats() {
        if (moveCountEl) {
            moveCountEl.textContent = moves;
        }
        if (pairCountEl) {
            pairCountEl.textContent = matchedPairs + '/' + TOTAL_PAIRS;
        }
    }

    function showCelebration() {
        if (finalMovesEl) {
            finalMovesEl.textContent = moves;
        }
        celebrationEl.style.display = 'flex';

        // Play celebration sound
        if (typeof Sound !== 'undefined') {
          Sound.init();
          Sound.celebrate();
        }
    }

    function hideCelebration() {
        celebrationEl.style.display = 'none';
    }

    // ── Start ──────────────────────────────────────────────────────────────

    init();

});
