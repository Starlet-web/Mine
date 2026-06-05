// ============ PANIC SYSTEM MODULE ============
const PanicSystem = (function() {
  'use strict';
  
  let isActive = false;
  let panicStartTime = null;
  let panicTimerInterval = null;
  
  // ============ ACTIVATE/DEACTIVATE ============
  
  function activate() {
    if (isActive) return;
    
    isActive = true;
    panicStartTime = Date.now();
    
    // Show panic overlay
    Utils.$('panicOverlay').classList.add('active');
    
    // Hide any sensitive content
    hideSensitiveContent();
    
    // Clear any stealth mode
    if (StealthMode.isActive()) {
      StealthMode.deactivate();
    }
    
    // Update panic timer
    startPanicTimer();
    
    // Track
    HistorySystem.addEntry('security', 'Panic Activated', 'Emergency panic mode activated');
    
    // Vibrate discreetly
    Utils.vibrate([50]);
    
    // Auto-deactivate after 5 minutes if not manually deactivated
    setTimeout(() => {
      if (isActive) {
        deactivate();
        Utils.showToast('Panic mode auto-deactivated');
      }
    }, 300000);
  }
  
  function deactivate() {
    if (!isActive) return;
    
    isActive = false;
    panicStartTime = null;
    
    Utils.$('panicOverlay').classList.remove('active');
    stopPanicTimer();
    
    // Restore content
    showSensitiveContent();
    
    // Track
    const duration = Math.round((Date.now() - (panicStartTime || Date.now())) / 1000);
    HistorySystem.addEntry('security', 'Panic Deactivated', `Panic mode deactivated after ${duration}s`);
  }
  
  function toggle() {
    if (isActive) deactivate();
    else activate();
  }
  
  // ============ TIMER ============
  
  function startPanicTimer() {
    stopPanicTimer();
    panicTimerInterval = setInterval(() => {
      if (panicStartTime) {
        const elapsed = Math.round((Date.now() - panicStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        // Update if there's a timer display in panic overlay
        const timerEl = Utils.$1('.panic-timer');
        if (timerEl) {
          timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }, 1000);
  }
  
  function stopPanicTimer() {
    if (panicTimerInterval) {
      clearInterval(panicTimerInterval);
      panicTimerInterval = null;
    }
  }
  
  // ============ SENSITIVE CONTENT ============
  
  function hideSensitiveContent() {
    // Hide network info
    const networkDisplay = Utils.$('networkDisguise');
    if (networkDisplay) networkDisplay.style.opacity = '0.5';
    
    // Hide decoy indicator
    const decoyIndicator = Utils.$('decoyIndicator');
    if (decoyIndicator) decoyIndicator.style.display = 'none';
    
    // Hide stealth elements
    document.querySelectorAll('.stealth-item').forEach(el => {
      el.style.opacity = '0.3';
    });
    
    // Hide emergency banner
    const emergencyBanner = Utils.$('emergencyAlert');
    if (emergencyBanner) emergencyBanner.style.display = 'none';
    
    // Change page title
    document.title = 'Google Classroom | CSIR NET Study Material';
    
    // Clear any toasts
    const toast = Utils.$('toast');
    if (toast) toast.classList.remove('show');
  }
  
  function showSensitiveContent() {
    const networkDisplay = Utils.$('networkDisguise');
    if (networkDisplay) networkDisplay.style.opacity = '1';
    
    document.querySelectorAll('.stealth-item').forEach(el => {
      el.style.opacity = '1';
    });
    
    document.title = 'CSIR NET Life Sciences | NTA Advanced Research & Analytics Portal';
  }
  
  // ============ KEYBOARD SHORTCUT ============
  
  function initialize() {
    // Panic button listeners
    Utils.$('panicBtn')?.addEventListener('click', activate);
    Utils.$('panicBtn2')?.addEventListener('click', activate);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+P for panic
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        toggle();
      }
      
      // Escape to deactivate
      if (e.key === 'Escape' && isActive) {
        deactivate();
      }
    });
    
    // Double-tap on body to activate panic (mobile)
    let lastTap = 0;
    document.body.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        toggle();
      }
      
      lastTap = currentTime;
    });
    
    // Three-finger tap for panic (alternative)
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 3) {
        e.preventDefault();
        toggle();
      }
    });
  }
  
  // ============ EXPORT ============
  
  return {
    activate,
    deactivate,
    toggle,
    isActive: () => isActive,
    initialize
  };
})();