/**
 * SproutPlay - Sound Effects (Web Audio API)
 * Generated tones for kids app feedback sounds
 */

var Sound = (function() {
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
    if (!enabled) return;
    init(); // Self-heal: try to create/resume context
    if (!audioCtx) return;

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
    if (!enabled) return;
    tone(800, 50, 'sine', 0.2);
  }

  /**
   * Match found - happy ascending chime
   */
  function match() {
    if (!enabled) return;
    init();
    if (!audioCtx) return;
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
    if (!enabled) return;
    init();
    if (!audioCtx) return;
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
    if (!enabled) return;
    init();
    if (!audioCtx) return;
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

  // Track loaded native audio assets
  var _loadedNativeAudio = {};

  /**
   * Phonics sound for a letter — uses Capacitor Native Audio
   */
  function phonics(letter) {
    if (!enabled) return;
    init(); // Native audio might not need WebAudio context, but good for consistent behavior

    var letterUpper = letter.toUpperCase();
    var assetId = 'phonics_' + letterUpper;
    var dbg = window._debug || function(m) { console.log('[Sound]', m); };

    try {
      var NativeAudio = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.NativeAudio;
      if (!NativeAudio) {
        dbg('No NativeAudio, fallback tone');
        _phonicsTone(letter);
        return;
      }

      // If already loaded, just play
      if (_loadedNativeAudio[assetId]) {
        NativeAudio.play({ assetId: assetId }).catch(function() {
          _phonicsTone(letter);
        });
        return;
      }

      dbg('NativeAudio: ' + letterUpper);

      // NativeAudio path is relative to android assets/ folder
      NativeAudio.preload({
        assetId: assetId,
        assetPath: 'public/sounds/phonics/' + letterUpper + '.mp3',
        audioChannelNum: 1,
        isUrl: false
      }).then(function() {
        dbg('Loaded: ' + letterUpper);
        _loadedNativeAudio[assetId] = true;
        return NativeAudio.play({ assetId: assetId });
      }).then(function() {
        dbg('Playing: ' + letterUpper);
      }).catch(function(err) {
        dbg('NativeAudio ERR: ' + letterUpper + ' msg=' + (err.message || err.code || JSON.stringify(err)));
        console.warn('Sound: NativeAudio failed', letter, err);
        _phonicsTone(letter);
      });
    } catch (e) {
      dbg('NativeAudio EX: ' + letterUpper);
      console.warn('Sound: NativeAudio error', letter, e);
      _phonicsTone(letter);
    }
  }

  /**
   * Fallback phonics sound using Web Audio API tones
   */
  function _phonicsTone(letter) {
    if (!audioCtx) return;
    init();
    var now = audioCtx.currentTime;
    var charCode = letter.toUpperCase().charCodeAt(0) - 65;
    var baseFreq = 200 + (charCode * 15);
    var isVowel = 'AEIOU'.indexOf(letter.toUpperCase()) !== -1;

    if (isVowel) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = baseFreq;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  /**
   * "Speak" a word using phonics breakdown
   * Plays each letter sound in sequence, then a celebration chord
   */
  function speakWord(word) {
    if (!enabled) return;
    init();
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var chars = word.toUpperCase().split('');

    chars.forEach(function(letter, i) {
      var delay = i * 0.25;
      // Play each letter's phonics sound
      var charCode = letter.charCodeAt(0) - 65;
      var baseFreq = 200 + (charCode * 15);
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseFreq;
      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  /**
   * Speak a word or sentence using native TTS (Capacitor TextToSpeech plugin)
   * Falls back to phonics letter-by-letter if TTS unavailable
   * @param {string} text - Text to speak
   * @param {number} rate - Speech rate (0.5 = slow, 1.0 = normal). Default 0.8
   * @returns {Promise} resolves when speech finishes
   */
  function speak(text, rate) {
    if (!enabled) return Promise.resolve();
    var TTS = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech;
    if (!TTS) {
      console.warn('Sound: No TextToSpeech plugin, skipping speak');
      return Promise.resolve();
    }
    return TTS.speak({
      text: text,
      lang: 'en-US',
      rate: rate || 0.8,
      pitch: 1.1,
      volume: 1.0,
      category: 'ambient'
    }).catch(function(err) {
      console.warn('Sound: TTS speak failed', err);
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
    phonics, 
    speak, 
    speakWord, 
    setEnabled, 
    isEnabled, 
    tone 
  };
})();
