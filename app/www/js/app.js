/**
 * SproutPlay - Main App Entry Point
 * Initializes the app and wires everything together
 */

const App = (function() {
  /**
   * Initialize the application
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
    
    // Setup hardware back button handler (Android)
    setupBackButton();
  }
  
  /**
   * Called when DOM is ready
   */
  function onReady() {
    // Ensure orientation is unlocked (safety net for killed WebView)
    unlockOrientation();

    // Load settings
    if (typeof Settings !== 'undefined') {
      Settings.load();
    }

    // Initialize registry (auto-init in registry.js)
    // AppRegistry should already be initialized

    // Initialize router (auto-init in router.js)
    // Router should already be initialized

    // Initialize hub
    if (typeof Hub !== 'undefined') {
      Hub.init();
    }

    // Setup settings screen
    setupSettingsScreen();

    // Setup hardware back button handler (after Capacitor is ready)
    setupBackButton();
  }
  
  /**
   * Setup settings screen interactions
   */
  function setupSettingsScreen() {
    // Settings back button
    const settingsBack = document.getElementById('settings-back');
    if (settingsBack) {
      settingsBack.addEventListener('click', function() {
        if (typeof Router !== 'undefined') {
          Router.back();
        }
      });
    }
    
    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      // Load saved state (default on)
      const soundEnabled = typeof Settings !== 'undefined' ? Settings.get('soundEnabled') : true;
      soundToggle.checked = soundEnabled !== false;
      if (typeof Sound !== 'undefined') Sound.setEnabled(soundToggle.checked);

      // Listen for changes
      soundToggle.addEventListener('change', function() {
        if (typeof Settings !== 'undefined') Settings.set('soundEnabled', this.checked);
        if (typeof Sound !== 'undefined') Sound.setEnabled(this.checked);
      });
    }

    // Lock icon (visible when lock is enabled)
    const lockBtn = document.getElementById('lock-btn');
    if (lockBtn && typeof Settings !== 'undefined') {
      // Set initial state from saved settings
      const locked = Settings.isScreenLocked();
      if (locked) {
        Lock.setLockedState(true);
      }
    }

    // Lock SproutPlay toggle in Settings
    const screenLockToggle = document.getElementById('screen-lock-toggle');
    if (screenLockToggle && typeof Settings !== 'undefined') {
      // Set initial state
      screenLockToggle.checked = Settings.isScreenLocked();

      // Listen for changes
      screenLockToggle.addEventListener('change', function() {
        Settings.setScreenLocked(this.checked);
        // Update lock icon visibility
        if (typeof Lock !== 'undefined') {
          Lock.setLockedState(this.checked);
        }
      });
    }
  }
  
  /**
   * Unlock orientation to device default (safety net).
   * When the OS kills the WebView while a mini-app had orientation locked,
   * the lock persists. This ensures the hub always starts unlocked.
   */
  function unlockOrientation() {
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.ScreenOrientation) {
      Capacitor.Plugins.ScreenOrientation.unlock().catch(function(err) {
        console.warn('[App] Failed to unlock orientation:', err);
      });
    }
  }

  /**
   * Setup hardware back button handler
   */
  function setupBackButton() {
    // Use Capacitor's App plugin for Android back button
    const setupCapacitorBackButton = function() {
      if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.addListener('backButton', function(event) {
          if (typeof Router !== 'undefined') {
            Router.handleBackButton();
          }
        }).catch(function(err) {
          console.warn('Back button listener error:', err);
        });
      }
    };

    // Try to register immediately
    setupCapacitorBackButton();

    // Also handle browser back button for testing
    window.addEventListener('popstate', function(event) {
      if (typeof Router !== 'undefined' && !Router.isOnHub()) {
        Router.back();
      }
    });
  }
  
  // Public API
  return {
    init
  };
})();

// Start the app
App.init();
