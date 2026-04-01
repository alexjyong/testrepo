/**
 * SproutPlay - Settings Manager
 * Handles user/parent settings persistence using localStorage
 */

const Settings = (function() {
  const STORAGE_KEY = 'sproutplay_settings';
  
  // Default settings
  const defaults = {
    parentalGateEnabled: false,
    parentalGateHoldDuration: 3000, // 3 seconds
    soundEnabled: true,
    firstLaunch: true
  };
  
  // Current settings
  let current = { ...defaults };
  
  /**
   * Load settings from localStorage
   */
  function load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        current = { ...defaults, ...parsed };
      }
      console.log('Settings: Loaded', current);
    } catch (e) {
      console.error('Settings: Failed to load from storage', e);
      current = { ...defaults };
    }
    return current;
  }
  
  /**
   * Save settings to localStorage
   */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      console.log('Settings: Saved', current);
    } catch (e) {
      console.error('Settings: Failed to save to storage', e);
    }
  }
  
  /**
   * Get a specific setting value
   * @param {string} key - The setting key
   * @returns {*} The setting value
   */
  function get(key) {
    return current[key];
  }
  
  /**
   * Set a specific setting value
   * @param {string} key - The setting key
   * @param {*} value - The setting value
   */
  function set(key, value) {
    current[key] = value;
    save();
  }
  
  /**
   * Toggle parental gate on/off
   * @param {boolean} enabled - Whether to enable parental gate
   */
  function setParentalGate(enabled) {
    current.parentalGateEnabled = enabled;
    save();
    console.log('Settings: Parental gate', enabled ? 'enabled' : 'disabled');
  }
  
  /**
   * Check if parental gate is enabled
   * @returns {boolean} True if parental gate is enabled
   */
  function isParentalGateEnabled() {
    return current.parentalGateEnabled === true;
  }
  
  /**
   * Get parental gate hold duration
   * @returns {number} Duration in milliseconds
   */
  function getParentalGateHoldDuration() {
    return current.parentalGateHoldDuration || 3000;
  }
  
  /**
   * Mark first launch as complete
   */
  function completeFirstLaunch() {
    if (current.firstLaunch) {
      current.firstLaunch = false;
      save();
    }
  }
  
  /**
   * Check if this is first launch
   * @returns {boolean} True if first launch
   */
  function isFirstLaunch() {
    return current.firstLaunch === true;
  }
  
  /**
   * Reset all settings to defaults
   */
  function reset() {
    current = { ...defaults };
    save();
    console.log('Settings: Reset to defaults');
  }
  
  // Public API
  return {
    load,
    save,
    get,
    set,
    setParentalGate,
    isParentalGateEnabled,
    getParentalGateHoldDuration,
    completeFirstLaunch,
    isFirstLaunch,
    reset
  };
})();

// Auto-load settings on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  Settings.load();
});
