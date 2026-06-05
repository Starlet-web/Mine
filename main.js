// ============ MAIN ENTRY POINT ============
(function() {
  'use strict';
  
  // Initialize all modules on DOM ready
  function initializeApp() {
    console.log('🔬 Initializing CSIR NET Research Portal...');
    
    // Initialize utility modules first
    // (Utils is already initialized as IIFE)
    
    // Initialize XP System
    XPSystem.initialize();
    
    // Initialize History System
    HistorySystem.initialize();
    
    // Initialize Bookmark System
    BookmarkSystem.initialize();
    
    // Initialize Stealth Mode
    StealthMode.initialize();
    
    // Initialize Decoy System
    DecoySystem.initialize();
    
    // Initialize Emergency System
    EmergencySystem.initialize();
    
    // Initialize Voice System
    VoiceSystem.initialize();
    
    // Initialize Panic System
    PanicSystem.initialize();
    
    // Initialize Network Disguise
    NetworkDisguise.initialize();
    
    // Initialize Auth UI
    Auth.initUI();
    
    // Initialize Message System
    MessageSystem.initialize();
    
    // Initialize App Controller
    App.initialize();
    
    // Auth state handler
    Auth.onAuthStateChange((user, event) => {
      if (user && event === 'login') {
        // User logged in
        Utils.$('authScreen').style.display = 'none';
        Utils.$('appWorkspace').style.display = 'flex';
        
        MessageSystem.startListening();
        Utils.scrollToBottom();
        Utils.showToast('Research portal initialized');
        
      } else if (!user && event === 'logout') {
        // User logged out
        Utils.$('authScreen').style.display = 'flex';
        Utils.$('appWorkspace').style.display = 'none';
        MessageSystem.stopListening();
        
        Utils.$('emailInput').value = '';
        Utils.$('passwordInput').value = '';
      }
    });
    
    // Show auth screen initially
    Utils.$('authScreen').style.display = 'flex';
    Utils.$('appWorkspace').style.display = 'none';
    
    // Update streak display
    XPSystem.updateDisplay();
    
    // Set up periodic cleanup
    setInterval(() => {
      Database.cleanupExpiredMessages();
    }, 60000);
    
    // Block screen recording
    blockScreenRecording();
    
    // Detect DevTools
    detectDevTools();
    
    console.log('✅ CSIR NET Research Portal initialized successfully');
  }
  
  // ============ SCREEN RECORDING BLOCKER ============
  
  function blockScreenRecording() {
    if (typeof navigator.mediaDevices !== 'undefined') {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      
      navigator.mediaDevices.getDisplayMedia = function() {
        Utils.showToast('⚠️ Screen recording blocked - Academic Integrity Policy', 5000, 'warning');
        return Promise.reject(new Error('Screen recording not allowed'));
      };
    }
  }
  
  // ============ DEVTOOLS DETECTION ============
  
  function detectDevTools() {
    let devtoolsOpen = false;
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          Utils.showToast('⚠️ Developer tools detected - Research mode only', 5000, 'warning');
          HistorySystem.addEntry('security', 'DevTools Detected', 'Developer tools opened');
        }
      } else {
        devtoolsOpen = false;
      }
    }, 1000);
  }
  
  // ============ SERVICE WORKER REGISTRATION ============
  
  if ('serviceWorker' in navigator) {
    // Create inline service worker for offline support
    const swCode = `
      self.addEventListener('install', (event) => {
        self.skipWaiting();
      });
      
      self.addEventListener('activate', (event) => {
        event.waitUntil(clients.claim());
      });
      
      self.addEventListener('fetch', (event) => {
        event.respondWith(
          fetch(event.request).catch(() => {
            return new Response('Offline - Research Portal', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          })
        );
      });
    `;
    
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Service worker registration failed - not critical
    });
  }
  
  // ============ ERROR HANDLING ============
  
  window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    HistorySystem.addEntry('security', 'Error Detected', event.error?.message || 'Unknown error');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    HistorySystem.addEntry('security', 'Promise Error', event.reason?.message || 'Unknown rejection');
  });
  
  // ============ STARTUP ============
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
})();