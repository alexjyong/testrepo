/**
 * SproutPlay - App Registry
 * Central registry for all mini-apps available in the hub
 */

const AppRegistry = (function() {
  // Internal storage for registered apps
  let apps = [];
  
  /**
   * Register a new mini-app
   * @param {Object} app - The mini-app metadata
   */
  function register(app) {
    // Validate required fields
    if (!app.id || !app.name || !app.icon) {
      console.error('AppRegistry: Missing required fields (id, name, icon)', app);
      return false;
    }
    
    // Check for duplicate ID
    const exists = apps.find(a => a.id === app.id);
    if (exists) {
      console.warn('AppRegistry: App with ID already exists:', app.id);
      return false;
    }
    
    // Set defaults
    const completeApp = {
      enabled: true,
      placeholder: true,
      backgroundColor: '#4ECDC4',
      description: '',
      path: '',
      ...app
    };
    
    apps.push(completeApp);
    console.log('AppRegistry: Registered app:', completeApp.name);
    return true;
  }
  
  /**
   * Get all registered apps
   * @returns {Array} Array of enabled mini-apps
   */
  function getAll() {
    return apps.filter(app => app.enabled);
  }
  
  /**
   * Get a specific app by ID
   * @param {string} id - The app ID
   * @returns {Object|undefined} The app metadata or undefined
   */
  function getById(id) {
    return apps.find(app => app.id === id);
  }
  
  /**
   * Launch an app by ID
   * @param {string} id - The app ID to launch
   * @returns {Object|null} The app metadata or null if not found
   */
  function launch(id) {
    const app = getById(id);
    if (!app) {
      console.error('AppRegistry: App not found:', id);
      return null;
    }
    
    if (!app.enabled) {
      console.warn('AppRegistry: App is disabled:', id);
      return null;
    }
    
    console.log('AppRegistry: Launching app:', app.name);
    return app;
  }
  
  /**
   * Initialize registry with default placeholder apps
   */
  function init() {
    // Register placeholder apps for Phase 1
    register({
      id: 'coming-soon-1',
      name: 'Coming Soon',
      icon: '🚀',
      description: 'Something fun is coming!',
      backgroundColor: 'color-1'
    });
    
    register({
      id: 'coming-soon-2',
      name: 'Stay Tuned',
      icon: '🎨',
      description: 'A creative app is being built',
      backgroundColor: 'color-2'
    });
    
    register({
      id: 'coming-soon-3',
      name: 'More Fun',
      icon: '🎮',
      description: 'Games coming soon!',
      backgroundColor: 'color-3'
    });
    
    register({
      id: 'coming-soon-4',
      name: 'Watch This',
      icon: '🌟',
      description: 'Exciting apps ahead!',
      backgroundColor: 'color-4'
    });
    
    console.log('AppRegistry: Initialized with', apps.length, 'apps');
  }
  
  // Public API
  return {
    register,
    getAll,
    getById,
    launch,
    init
  };
})();

// Auto-initialize on load
document.addEventListener('DOMContentLoaded', function() {
  AppRegistry.init();
});
