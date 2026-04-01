/**
 * SproutPlay - Router
 * Simple navigation between views (hub, apps, settings)
 */

const Router = (function() {
  // Current view tracking
  let currentView = 'hub';
  let previousView = null;
  
  // View cache
  const views = {};
  
  /**
   * Initialize router and cache view elements
   */
  function init() {
    // Cache view elements
    views.hub = document.getElementById('hub-view');
    views.placeholder = document.getElementById('placeholder-view');
    views.settings = document.getElementById('settings-view');
    
    if (!views.hub) {
      console.error('Router: Hub view not found');
    }
    
    console.log('Router: Initialized');
  }
  
  /**
   * Navigate to a different view
   * @param {string} viewName - The view to navigate to
   * @param {Object} data - Optional data to pass to the view
   */
  function navigate(viewName, data = {}) {
    if (!views[viewName] && viewName !== 'hub') {
      console.error('Router: View not found:', viewName);
      return false;
    }
    
    console.log('Router: Navigating to', viewName, data);
    
    // Hide all views
    Object.values(views).forEach(view => {
      if (view) {
        view.classList.add('hidden');
        view.classList.remove('active');
      }
    });
    
    // Show target view
    const targetView = viewName === 'hub' ? views.hub : views[viewName];
    if (targetView) {
      targetView.classList.remove('hidden');
      targetView.classList.add('active');
    }
    
    // Track navigation
    previousView = currentView;
    currentView = viewName;
    
    // Mark first launch complete
    if (typeof Settings !== 'undefined') {
      Settings.completeFirstLaunch();
    }
    
    return true;
  }
  
  /**
   * Go back to the previous view (hub)
   * @returns {boolean} True if navigation succeeded
   */
  function back() {
    console.log('Router: Going back from', currentView);
    
    // Check parental gate
    if (typeof Settings !== 'undefined' && Settings.isParentalGateEnabled()) {
      // For Phase 1, just log - gate challenge will be added in Phase 2
      console.log('Router: Parental gate is enabled - would show challenge');
      // In Phase 2, this will trigger the hold-button challenge
    }
    
    // Always return to hub for now
    return navigate('hub');
  }
  
  /**
   * Get the current view name
   * @returns {string} Current view name
   */
  function getCurrentView() {
    return currentView;
  }
  
  /**
   * Check if we're currently on the hub
   * @returns {boolean} True if on hub view
   */
  function isOnHub() {
    return currentView === 'hub';
  }
  
  /**
   * Handle hardware back button
   */
  function handleBackButton() {
    if (!isOnHub()) {
      back();
      return true;
    }
    
    // On hub - check parental gate
    if (typeof Settings !== 'undefined' && Settings.isParentalGateEnabled()) {
      // In Phase 1, just prevent exit
      console.log('Router: Back pressed on hub with gate enabled');
      return true; // Prevent default back behavior
    }
    
    // Allow exit if gate disabled
    return false;
  }
  
  // Public API
  return {
    init,
    navigate,
    back,
    getCurrentView,
    isOnHub,
    handleBackButton
  };
})();

// Initialize router on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  Router.init();
});
