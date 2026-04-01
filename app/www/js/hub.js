/**
 * SproutPlay - Hub Launcher
 * Main hub interface for displaying and launching mini-apps
 */

const Hub = (function() {
  // State
  let isInitialized = false;
  let isLoading = false;
  let lastTapTime = 0;
  const TAP_DEBOUNCE = 500; // ms
  
  // DOM elements
  let appGrid = null;
  let settingsTrigger = null;
  
  /**
   * Initialize the hub
   */
  function init() {
    if (isInitialized) {
      console.log('Hub: Already initialized');
      return;
    }
    
    // Get DOM elements
    appGrid = document.getElementById('app-grid');
    settingsTrigger = document.getElementById('settings-trigger');
    
    if (!appGrid) {
      console.error('Hub: App grid not found');
      return;
    }
    
    console.log('Hub: Initializing');
    
    // Render app icons
    renderAppIcons();
    
    // Setup settings trigger (long-press)
    setupSettingsTrigger();
    
    // Setup placeholder view back button
    setupPlaceholderBack();
    
    isInitialized = true;
    console.log('Hub: Initialized');
  }
  
  /**
   * Render app icons from registry
   */
  function renderAppIcons() {
    if (!appGrid) return;
    
    // Clear existing content
    appGrid.innerHTML = '';
    
    // Get apps from registry
    const apps = typeof AppRegistry !== 'undefined' ? AppRegistry.getAll() : [];
    
    if (apps.length === 0) {
      // No apps - show "coming soon" message
      appGrid.innerHTML = `
        <div class="placeholder-content" style="grid-column: 1 / -1;">
          <div class="placeholder-icon">🌱</div>
          <h3>Welcome to SproutPlay!</h3>
          <p>Fun apps are growing here!</p>
        </div>
      `;
      return;
    }
    
    // Render each app
    apps.forEach((app, index) => {
      const card = createAppCard(app, index);
      appGrid.appendChild(card);
    });
  }
  
  /**
   * Create an app card element
   * @param {Object} app - App metadata
   * @param {number} index - App index for coloring
   * @returns {Element} App card element
   */
  function createAppCard(app, index) {
    const card = document.createElement('div');
    card.className = `app-card touch-target ${app.backgroundColor || 'color-' + ((index % 8) + 1)}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', app.name + ': ' + (app.description || 'Fun app'));
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'app-card-icon';
    icon.textContent = app.icon;
    
    // Name
    const name = document.createElement('div');
    name.className = 'app-card-name';
    name.textContent = app.name;
    
    card.appendChild(icon);
    card.appendChild(name);
    
    // Click/tap handler
    card.addEventListener('click', function(event) {
      event.stopPropagation();
      handleAppTap(app);
    });
    
    // Keyboard handler for accessibility
    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleAppTap(app);
      }
    });
    
    return card;
  }
  
  /**
   * Handle app icon tap
   * @param {Object} app - App metadata
   */
  function handleAppTap(app) {
    const now = Date.now();
    
    // Rapid tap prevention
    if (now - lastTapTime < TAP_DEBOUNCE) {
      console.log('Hub: Ignoring rapid tap');
      return;
    }
    lastTapTime = now;
    
    console.log('Hub: Tapped app:', app.name);
    
    // Navigate to placeholder view
    if (typeof Router !== 'undefined') {
      // Set the placeholder title
      const titleEl = document.getElementById('placeholder-title');
      if (titleEl) {
        titleEl.textContent = app.name;
      }
      
      Router.navigate('placeholder', { app: app });
    }
  }
  
  /**
   * Setup settings trigger (long-press corner)
   */
  function setupSettingsTrigger() {
    if (!settingsTrigger) {
      console.warn('Hub: Settings trigger not found');
      return;
    }
    
    if (typeof Gesture !== 'undefined') {
      Gesture.init(settingsTrigger, function() {
        console.log('Hub: Opening settings');
        if (typeof Router !== 'undefined') {
          Router.navigate('settings');
        }
      });
    }
  }
  
  /**
   * Setup back button for placeholder view
   */
  function setupPlaceholderBack() {
    const backButton = document.getElementById('placeholder-back');
    if (backButton) {
      backButton.addEventListener('click', function() {
        if (typeof Router !== 'undefined') {
          Router.back();
        }
      });
    }
  }
  
  /**
   * Refresh the app grid (call after registry changes)
   */
  function refresh() {
    renderAppIcons();
  }
  
  // Public API
  return {
    init,
    refresh
  };
})();

// Initialize hub on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  Hub.init();
});
