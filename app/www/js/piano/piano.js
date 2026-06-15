/**
 * SproutPlay - Piano Play Mini-App
 * A landscape-mode piano with a dynamic number of keys that fills the screen.
 * Tap keys to hear synthesized musical notes via the Web Audio API.
 *
 * Copy of _template/js/_template.js adapted for piano.
 *
 * Dependencies (loaded before this file by index.html):
 *   - Sound    (window.Sound)    — audio playback, TTS
 *   - Settings (window.Settings) — sound enabled/disabled toggle
 *
 * Capacitor plugins (loaded via npx cap sync):
 *   - @capawesome/capacitor-screen-orientation — locks to landscape
 */

const Piano = (function () {

    // ── DOM refs ─────────────────────────────────────────────────
    var backBtn         = null;
    var keyboardEl      = null;
    var labelToggleBtn  = null;

    // ── State ─────────────────────────────────────────────────────
    var isInitialized   = false;
    var labelsVisible   = false;
    var currentKeys     = []; // dynamically computed based on screen width

    // ── Finger sliding (glissando) tracking ───────────────────────
    var activeTouchId   = null; // touch identifier currently pressing a key
    var currentKey      = null; // key element currently active under the touch

    // ── All available notes starting from C4 (up to 3 octaves) ────
    var ALL_NOTES = [
        { note: 'C4',  frequency: 261.63, isBlack: false, label: 'C'  },
        { note: 'C#4', frequency: 277.18, isBlack: true,  label: 'C#' },
        { note: 'D4',  frequency: 293.66, isBlack: false, label: 'D'  },
        { note: 'D#4', frequency: 311.13, isBlack: true,  label: 'D#' },
        { note: 'E4',  frequency: 329.63, isBlack: false, label: 'E'  },
        { note: 'F4',  frequency: 349.23, isBlack: false, label: 'F'  },
        { note: 'F#4', frequency: 369.99, isBlack: true,  label: 'F#' },
        { note: 'G4',  frequency: 392.00, isBlack: false, label: 'G'  },
        { note: 'G#4', frequency: 415.30, isBlack: true,  label: 'G#' },
        { note: 'A4',  frequency: 440.00, isBlack: false, label: 'A'  },
        { note: 'A#4', frequency: 466.16, isBlack: true,  label: 'A#' },
        { note: 'B4',  frequency: 493.88, isBlack: false, label: 'B'  },
        { note: 'C5',  frequency: 523.25, isBlack: false, label: 'C'  },
        { note: 'C#5', frequency: 554.37, isBlack: true,  label: 'C#' },
        { note: 'D5',  frequency: 587.33, isBlack: false, label: 'D'  },
        { note: 'D#5', frequency: 622.25, isBlack: true,  label: 'D#' },
        { note: 'E5',  frequency: 659.25, isBlack: false, label: 'E'  },
        { note: 'F5',  frequency: 698.46, isBlack: false, label: 'F'  },
        { note: 'F#5', frequency: 739.99, isBlack: true,  label: 'F#' },
        { note: 'G5',  frequency: 783.99, isBlack: false, label: 'G'  },
        { note: 'G#5', frequency: 830.61, isBlack: true,  label: 'G#' },
        { note: 'A5',  frequency: 880.00, isBlack: false, label: 'A'  },
        { note: 'A#5', frequency: 932.33, isBlack: true,  label: 'A#' },
        { note: 'B5',  frequency: 987.77, isBlack: false, label: 'B'  },
        { note: 'C6',  frequency: 1046.50, isBlack: false, label: 'C'  }
    ];

    // ── Compute how many white keys fit on screen ─────────────────
    function computeKeyRange() {
        var minWidth = 48; // Constitution minimum touch target
        var availableWidth = window.innerWidth;
        var maxWhiteKeys = Math.floor(availableWidth / minWidth);

        // Cap at 3 octaves (22 white keys) to avoid overloading young kids
        if (maxWhiteKeys > 22) maxWhiteKeys = 22;

        // Count white keys from ALL_NOTES starting at C4
        var whiteKeyCount = 0;
        var endIdx = ALL_NOTES.length - 1;
        for (var i = ALL_NOTES.length - 1; i >= 0; i--) {
            if (!ALL_NOTES[i].isBlack) whiteKeyCount++;
            if (whiteKeyCount >= maxWhiteKeys) { endIdx = i; break; }
        }

        return ALL_NOTES.slice(0, endIdx + 1);
    }

    // ── PianoAudio module ────────────────────────────────────────
    var PianoAudio = (function () {
        var audioCtx    = null;
        var activeNotes = new Map(); // keyElement → { oscillator, gainNode }

        function init() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playNote(frequency, keyElement) {
            if (!audioCtx) init();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            // Don't restart if already playing (prevents double-trigger)
            if (activeNotes.has(keyElement)) return;

            var oscillator = audioCtx.createOscillator();
            var gainNode   = audioCtx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

            // Attack: quick ramp to full volume (0.5 gain)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();

            activeNotes.set(keyElement, { oscillator: oscillator, gainNode: gainNode });
        }

        function stopNote(keyElement) {
            var note = activeNotes.get(keyElement);
            if (!note) return;

            var { oscillator, gainNode } = note;
            var now = audioCtx.currentTime;

            // Release: ramp gain to 0 over 300ms, stop oscillator after 350ms
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            oscillator.stop(now + 0.35);

            // Cleanup after release
            setTimeout(function () {
                oscillator.disconnect();
                gainNode.disconnect();
            }, 400);

            activeNotes.delete(keyElement);
        }

        function destroy() {
            activeNotes.forEach(function (note, keyEl) {
                try { note.oscillator.stop(); } catch (e) {}
                try { note.oscillator.disconnect(); } catch (e) {}
                try { note.gainNode.disconnect(); } catch (e) {}
            });
            activeNotes.clear();
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
        }

        return {
            init: init,
            playNote: playNote,
            stopNote: stopNote,
            destroy: destroy
        };
    })();

    // ── Keyboard rendering ───────────────────────────────────────
    function renderKeyboard() {
        // Skip re-render if nothing changed (prevents flicker on resize)
        var minWidth = 48;
        var availableWidth = window.innerWidth;
        var newMaxWhiteKeys = Math.min(Math.floor(availableWidth / minWidth), 22);
        if (currentKeys._maxWhiteKeys === newMaxWhiteKeys) return;
        currentKeys._maxWhiteKeys = newMaxWhiteKeys;

        keyboardEl.innerHTML = '';

        // Compute keys based on current screen width
        currentKeys = computeKeyRange();

        // Assign whiteKeyIndex to each key
        var whiteKeyIndex = 0;
        for (var i = 0; i < currentKeys.length; i++) {
            if (!currentKeys[i].isBlack) {
                currentKeys[i].whiteKeyIndex = whiteKeyIndex;
                whiteKeyIndex++;
            }
        }

        var whiteKeys = currentKeys.filter(function (k) { return !k.isBlack; });
        var blackKeys = currentKeys.filter(function (k) { return k.isBlack; });

        // Create white key elements
        for (var w = 0; w < whiteKeys.length; w++) {
            var wk = whiteKeys[w];
            var keyEl = document.createElement('div');
            keyEl.className = 'key white-key';
            keyEl.dataset.note = wk.note;
            keyEl.dataset.frequency = wk.frequency;

            var label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = wk.label;
            keyEl.appendChild(label);

            keyboardEl.appendChild(keyEl);
        }

        // Create black key elements — position over the gap between white keys
        var blackKeyWhiteCols = {}; // note → 1-based white key column (left side of gap)
        for (var b = 0; b < blackKeys.length; b++) {
            var bk = blackKeys[b];
            // Find the white key just before this black key
            var prevWhiteIdx = -1;
            for (var wi = 0; wi < whiteKeys.length; wi++) {
                if (whiteKeys[wi].note === getNoteBeforeBlack(bk.note)) {
                    prevWhiteIdx = wi;
                    break;
                }
            }
            blackKeyWhiteCols[bk.note] = prevWhiteIdx + 1; // 1-based
        }

        for (var j = 0; j < blackKeys.length; j++) {
            var bk = blackKeys[j];
            var keyEl = document.createElement('div');
            keyEl.className = 'key black-key';
            keyEl.dataset.note = bk.note;
            keyEl.dataset.frequency = bk.frequency;

            var label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = bk.label;
            keyEl.appendChild(label);

            keyboardEl.appendChild(keyEl);
        }

        // Update black key positions after DOM is built (uses % of keyboard width)
        updateBlackKeyPositions(blackKeyWhiteCols);
    }

    // ── Map black key note → the white key immediately before it ───
    function getNoteBeforeBlack(blackNote) {
        var map = {
            'C#4': 'C4', 'D#4': 'D4', 'F#4': 'F4', 'G#4': 'G4', 'A#4': 'A4',
            'C#5': 'C5', 'D#5': 'D5', 'F#5': 'F5', 'G#5': 'G5', 'A#5': 'A5'
        };
        return map[blackNote] || '';
    }

    // ── Position black keys using calc() based on white key count ──
    function updateBlackKeyPositions(blackKeyWhiteCols) {
        var blackKeys = keyboardEl.querySelectorAll('.black-key');
        for (var i = 0; i < blackKeys.length; i++) {
            var bk = blackKeys[i];
            var note = bk.dataset.note;
            var col = blackKeyWhiteCols[note];
            // White key width = 100% / numWhiteKeys. Black key = 10% wide, centered on gap.
            var whiteKeyPct = 100 / (currentKeys.filter(function (k) { return !k.isBlack; }).length);
            bk.style.left = (whiteKeyPct * col - whiteKeyPct * 0.5) + '%';
            bk.style.width = (whiteKeyPct * 0.7) + '%';
        }

        // Show keyboard after keys are rendered (hides flicker on load)
        keyboardEl.classList.add('ready');
    }

    // ── Touch handling (with finger sliding / glissando support) ───
    function findKeyAtPoint(x, y) {
        var el = document.elementFromPoint(x, y);
        if (!el) return null;
        return el.closest('.key');
    }

    function activateKey(key) {
        if (!key || !currentKey || currentKey !== key) {
            // Stop previous key if different (or no previous)
            if (currentKey) {
                PianoAudio.stopNote(currentKey);
                currentKey.classList.remove('active');
            }
            // Play new key
            if (key) {
                var freq = parseFloat(key.dataset.frequency);
                PianoAudio.playNote(freq, key);
                key.classList.add('active');
                currentKey = key;
            } else {
                currentKey = null;
            }
        }
    }

    function resetActiveKey() {
        if (currentKey) {
            PianoAudio.stopNote(currentKey);
            currentKey.classList.remove('active');
            currentKey = null;
        }
        activeTouchId = null;
    }

    function wireTouchHandling() {
        // ── Touch events ────────────────────────────────────────────
        keyboardEl.addEventListener('touchstart', function (e) {
            // Allow touch events to propagate to key elements only
            if (!e.target.classList.contains('key')) return;
        }, { passive: true });

        keyboardEl.addEventListener('touchstart', function (e) {
            var touch = e.changedTouches[0];
            activeTouchId = touch.identifier;
            var key = findKeyAtPoint(touch.clientX, touch.clientY);
            if (!key) return;
            e.preventDefault();
            activateKey(key);
        }, { passive: false });

        keyboardEl.addEventListener('touchmove', function (e) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                var touch = e.changedTouches[i];
                if (touch.identifier !== activeTouchId) continue;
                var key = findKeyAtPoint(touch.clientX, touch.clientY);
                activateKey(key); // null if finger slid off keyboard
            }
        }, { passive: false });

        keyboardEl.addEventListener('touchend', function (e) {
            for (var i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === activeTouchId) {
                    resetActiveKey();
                    break;
                }
            }
        }, { passive: false });

        keyboardEl.addEventListener('touchcancel', function (e) {
            resetActiveKey();
        });

        // ── Mouse events (desktop testing) ──────────────────────────
        var mouseDown = false;

        keyboardEl.addEventListener('mousedown', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;
            e.preventDefault();
            mouseDown = true;
            activateKey(key);
        });

        keyboardEl.addEventListener('mousemove', function (e) {
            if (!mouseDown) return;
            var key = findKeyAtPoint(e.clientX, e.clientY);
            activateKey(key);
        });

        keyboardEl.addEventListener('mouseup', function (e) {
            if (!mouseDown) return;
            mouseDown = false;
            resetActiveKey();
        });

        keyboardEl.addEventListener('mouseleave', function (e) {
            if (!mouseDown) return;
            mouseDown = false;
            resetActiveKey();
        });
    }

    // ── Label toggle ──────────────────────────────────────────────
    function toggleLabels() {
        labelsVisible = !labelsVisible;
        if (labelsVisible) {
            keyboardEl.setAttribute('data-labels', 'true');
            localStorage.setItem('piano_showLabels', 'true');
        } else {
            keyboardEl.removeAttribute('data-labels');
            localStorage.setItem('piano_showLabels', 'false');
        }
        updateLabelToggleIcon();
    }

    function updateLabelToggleIcon() {
        if (labelToggleBtn) {
            labelToggleBtn.textContent = labelsVisible ? '🏷️' : '🔤';
        }
    }

    // ── Orientation unlock ────────────────────────────────────────
    function unlockOrientation() {
        if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
            var ScreenOrientation = window.Capacitor?.Plugins?.ScreenOrientation;
            if (ScreenOrientation && typeof ScreenOrientation.unlock === 'function') {
                ScreenOrientation.unlock().catch(function (err) {
                    console.warn('[Piano] Failed to unlock orientation:', err);
                });
            }
        }
    }

    // ── Exit (used by UI back button AND hardware back button) ────
    function exit() {
        PianoAudio.destroy();
        unlockOrientation();
        window.location.href = '../index.html';
    }

    // ── Navigation ────────────────────────────────────────────────
    function goToHub() {
        exit();
    }

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        backBtn         = document.getElementById('piano-back');
        keyboardEl      = document.getElementById('piano-keyboard');
        labelToggleBtn  = document.getElementById('label-toggle');

        if (backBtn) backBtn.addEventListener('click', goToHub);
        if (labelToggleBtn) {
            labelToggleBtn.addEventListener('click', toggleLabels);
        }

        // Register Capacitor hardware back button (overrides mini-app-back.js)
        if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
            var AppPlugin = window.Capacitor?.Plugins?.App;
            if (AppPlugin && typeof AppPlugin.addListener === 'function') {
                AppPlugin.addListener('backButton', function () {
                    exit();
                });
            }
        }

        // Lock orientation to landscape (Capacitor plugin)
        // In Capacitor 8, plugins are accessed via window.Capacitor.Plugins.{PluginId}
        var lockDone = function () {
            PianoAudio.init();
            renderKeyboard();
            wireTouchHandling();
        };

        if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
            var ScreenOrientation = window.Capacitor?.Plugins?.ScreenOrientation;
            if (ScreenOrientation && typeof ScreenOrientation.lock === 'function') {
                ScreenOrientation.lock({ type: 'landscape' }).then(lockDone).catch(function (err) {
                    console.warn('[Piano] Failed to lock orientation:', err);
                    lockDone();
                });
            } else {
                // Plugin not available — render immediately
                lockDone();
            }
        } else {
            // Non-Android platform — render immediately
            lockDone();
        }

        // Restore label state
        var savedLabels = localStorage.getItem('piano_showLabels');
        if (savedLabels === 'true') {
            labelsVisible = true;
            keyboardEl.setAttribute('data-labels', 'true');
        }
        updateLabelToggleIcon();

        // Re-render on resize (keys may need to expand/shrink)
        var resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                renderKeyboard();
            }, 300);
        });

        isInitialized = true;
    }

    // ── Public API ────────────────────────────────────────────────
    return {
        init: init
    };

})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', Piano.init);
