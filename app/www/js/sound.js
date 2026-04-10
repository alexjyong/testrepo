/**
 * SproutPlay - Sound Effects (Web Audio API)
 * Generated tones for kids app feedback sounds
 */

const Sound = (function() {
  var audioCtx = null;
  var enabled = true;

  /**
   * Initialize the audio context (must be called after user gesture)
   */
  function init() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn('Sound: AudioContext not supported', e);
        enabled = false;
        return;
      }
    }
    // Force resume if suspended (user gesture should allow this)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /**
   * Play a single tone
   * @param {number} frequency - Hz
   * @param {number} duration - ms
   * @param {string} type - 'sine' | 'square' | 'triangle' | 'sawtooth'
   * @param {number} volume - 0.0 to 1.0
   */
  function tone(frequency, duration, type, volume) {
    if (!enabled || !audioCtx) return;

    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = type || 'sine';
      osc.frequency.value = frequency;
      gain.gain.value = volume || 0.3;
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (duration / 1000));

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + (duration / 1000));
    } catch (e) {
      // Ignore playback errors
    }
  }

  /**
   * Card flip sound - short click
   */
  function flip() {
    if (!enabled || !audioCtx) return;
    init();
    tone(800, 50, 'sine', 0.2);
  }

  /**
   * Match found - happy ascending chime
   */
  function match() {
    if (!enabled || !audioCtx) return;
    init();
    var now = audioCtx.currentTime;

    // Play 3 ascending notes
    [523, 659, 784].forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + (i * 0.12));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.12) + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + (i * 0.12));
      osc.stop(now + (i * 0.12) + 0.25);
    });
  }

  /**
   * No match - gentle descending boop
   */
  function noMatch() {
    if (!enabled || !audioCtx) return;
    init();
    var now = audioCtx.currentTime;

    [400, 300].forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + (i * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + (i * 0.1));
      osc.stop(now + (i * 0.1) + 0.2);
    });
  }

  /**
   * Celebration fanfare
   */
  function celebrate() {
    if (!enabled || !audioCtx) return;
    init();
    var now = audioCtx.currentTime;

    // Ascending scale
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25, now + (i * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + (i * 0.1));
      osc.stop(now + (i * 0.1) + 0.35);
    });
  }

  /**
   * Enable/disable sounds
   */
  function setEnabled(value) {
    enabled = value;
    if (enabled && audioCtx) {
      init();
    }
  }

  /**
   * Check if sound is enabled
   */
  function isEnabled() {
    return enabled;
  }

  return {
    init,
    flip,
    match,
    noMatch,
    celebrate,
    setEnabled,
    isEnabled
  };
})();
