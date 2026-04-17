/**
 * SproutPlay - Phonics Audio Loader
 * Pre-loads all phonics audio files on page load
 */

const PhonicsAudio = (function() {
  var audioMap = {};
  var loaded = false;
  var loadPromise = null;

  /**
   * Pre-load all phonics audio files
   */
  function preload() {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise(function(resolve) {
      var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      var remaining = letters.length;

      letters.forEach(function(letter) {
        var audio = new Audio();
        audio.preload = 'auto';
        audio.src = 'sounds/phonics/' + letter + '.mp3';

        audio.addEventListener('canplaythrough', function() {
          audioMap[letter] = audio;
          remaining--;
          if (remaining === 0) {
            loaded = true;
            console.log('PhonicsAudio: All ' + letters.length + ' sounds loaded');
            resolve();
          }
        });

        audio.addEventListener('error', function() {
          console.warn('PhonicsAudio: Failed to load ' + letter + '.mp3');
          remaining--;
          if (remaining === 0) {
            loaded = true;
            resolve();
          }
        });
      });
    });

    return loadPromise;
  }

  /**
   * Play phonics for a letter
   */
  function play(letter) {
    var audio = audioMap[letter.toUpperCase()];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(function(err) {
        console.warn('PhonicsAudio: play failed', letter, err);
      });
    } else {
      console.warn('PhonicsAudio: no audio loaded for', letter);
    }
  }

  return {
    preload: preload,
    play: play,
    isLoaded: function() { return loaded; }
  };
})();

// Auto-preload on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  PhonicsAudio.preload();
});
