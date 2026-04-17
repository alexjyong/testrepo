/**
 * SproutPlay - Gesture Detector
 * Handles long-press gestures for parent-only interactions
 */

const Gesture = (function() {
  // Configuration
  const LONG_PRESS_DURATION = 500; // ms
  
  // State
  let pressTimer = null;
  let isPressed = false;
  let targetElement = null;
  
  /**
   * Initialize gesture detector
   * @param {Element} triggerElement - The element to detect long-press on
   * @param {Function} callback - Callback when long-press is detected
   */
  function init(triggerElement, callback) {
    if (!triggerElement) {
      console.error('Gesture: No trigger element provided');
      return;
    }
    
    targetElement = triggerElement;
    
    // Touch events (mobile)
    targetElement.addEventListener('touchstart', handleStart, { passive: true });
    targetElement.addEventListener('touchend', handleEnd);
    targetElement.addEventListener('touchcancel', handleCancel);
    
    // Mouse events (desktop testing)
    targetElement.addEventListener('mousedown', handleStart);
    targetElement.addEventListener('mouseup', handleEnd);
    targetElement.addEventListener('mouseleave', handleCancel);
    
    console.log('Gesture: Initialized on', targetElement);
  }
  
  /**
   * Handle press/touch start
   * @param {Event} event
   */
  function handleStart(event) {
    // Prevent default to avoid selection/scrolling
    if (event.type === 'touchstart') {
      // Don't prevent default on touch - let it propagate
    } else {
      event.preventDefault();
    }
    
    isPressed = true;
    
    // Visual feedback
    if (targetElement) {
      targetElement.classList.add('active');
    }
    
    // Start timer for long-press
    pressTimer = setTimeout(function() {
      if (isPressed) {
        console.log('Gesture: Long-press detected');
        // Trigger callback
        if (typeof callback === 'function') {
          callback();
        }
        // Reset
        handleEnd();
      }
    }, LONG_PRESS_DURATION);
  }
  
  /**
   * Handle press/touch end
   * @param {Event} event
   */
  function handleEnd(event) {
    isPressed = false;
    
    // Clear timer
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    
    // Remove visual feedback
    if (targetElement) {
      targetElement.classList.remove('active');
    }
  }
  
  /**
   * Handle press/touch cancel
   * @param {Event} event
   */
  function handleCancel(event) {
    handleEnd(event);
  }
  
  /**
   * Destroy gesture detector and remove listeners
   */
  function destroy() {
    handleEnd();
    
    if (targetElement) {
      targetElement.removeEventListener('touchstart', handleStart);
      targetElement.removeEventListener('touchend', handleEnd);
      targetElement.removeEventListener('touchcancel', handleCancel);
      targetElement.removeEventListener('mousedown', handleStart);
      targetElement.removeEventListener('mouseup', handleEnd);
      targetElement.removeEventListener('mouseleave', handleCancel);
    }
    
    targetElement = null;
  }
  
  // Public API
  return {
    init,
    destroy,
    LONG_PRESS_DURATION
  };
})();
