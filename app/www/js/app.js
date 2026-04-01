/**
 * SproutPlay - Main App Entry Point
 * Initializes the app and wires everything together
 */

const App = (function() {
  /**
   * Initialize the application
   */
  function init() {
    console.log('SproutPlay: Starting...');
    
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
    console.log('SproutPlay: DOM ready');
    
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
    
    console.log('SproutPlay: Initialized');
    console.log('SproutPlay: Welcome to SproutPlay!');
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
    
    // Parental gate toggle
    const parentalGateToggle = document.getElementById('parental-gate-toggle');
    if (parentalGateToggle && typeof Settings !== 'undefined') {
      // Set initial state
      parentalGateToggle.checked = Settings.isParentalGateEnabled();
      
      // Listen for changes
      parentalGateToggle.addEventListener('change', function() {
        Settings.setParentalGate(this.checked);
        console.log('App: Parental gate set to', this.checked);
      });
    }
  }
  
  /**
   * Setup hardware back button handler
   */
  function setupBackButton() {
    // Listen for back button (works in some webviews and Capacitor)
    document.addEventListener('backbutton', function(event) {
      event.preventDefault();
      
      if (typeof Router !== 'undefined') {
        const handled = Router.handleBackButton();
        if (!handled) {
          // Allow default behavior (exit app)
          if (navigator.app) {
            navigator.app.exitApp();
          }
        }
      }
    }, false);
    
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
