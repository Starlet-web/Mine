// ============ NETWORK DISGUISE MODULE ============
const NetworkDisguise = (function() {
  'use strict';
  
  let updateInterval = null;
  let currentConfig = {
    wifiName: CONFIG.network.defaultName,
    signalStrength: CONFIG.network.defaultSignal,
    downloadSpeed: CONFIG.network.defaultSpeed,
    uploadSpeed: '50 Mbps',
    encryption: 'WPA3-Enterprise',
    server: 'NTA-Research-Delhi',
    ipPrefix: '192.168.1'
  };
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Set up network info display
    updateDisplay();
    
    // Start periodic updates
    startPeriodicUpdates();
    
    // Override network APIs
    overrideNetworkAPIs();
    
    // Block WebRTC leaks
    blockWebRTCLeaks();
    
    // Generate fake console logs
    generateFakeLogs();
    
    // Add keyboard shortcut for fake network issue
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        simulateNetworkIssue();
      }
    });
    
    HistorySystem.addEntry('security', 'Network Disguise', 'Network disguise system initialized');
  }
  
  // ============ DISPLAY ============
  
  function updateDisplay() {
    const nameEl = Utils.$('networkName');
    const speedEl = Utils.$('networkSpeed');
    const iconEl = Utils.$('wifiIcon');
    
    if (nameEl) nameEl.textContent = currentConfig.wifiName;
    if (speedEl) speedEl.textContent = currentConfig.downloadSpeed;
    
    if (iconEl) {
      const bars = ['🛜', '📶', '📶', '📶', '📶'];
      iconEl.textContent = bars[currentConfig.signalStrength] || '📶';
    }
  }
  
  function startPeriodicUpdates() {
    stopPeriodicUpdates();
    
    updateInterval = setInterval(() => {
      // Occasionally change network name (5% chance)
      if (Math.random() < 0.05) {
        currentConfig.wifiName = Utils.randomItem(CONFIG.network.wifiNames);
      }
      
      // Fluctuate signal (rarely drops below 3)
      if (Math.random() < 0.1) {
        currentConfig.signalStrength = Math.random() < 0.7 ? 4 : 3;
      }
      
      // Fluctuate speed
      const baseSpeed = 100;
      const variation = Math.floor(Math.random() * 20) - 10;
      const newSpeed = Math.max(50, Math.min(150, baseSpeed + variation));
      currentConfig.downloadSpeed = `${newSpeed} Mbps`;
      
      updateDisplay();
    }, CONFIG.network.updateInterval);
  }
  
  function stopPeriodicUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
  }
  
  // ============ TOOLTIP ============
  
  function toggleInfo() {
    const tooltip = Utils.$('networkTooltip');
    if (!tooltip) return;
    
    const isVisible = tooltip.style.display === 'block';
    
    if (isVisible) {
      tooltip.style.display = 'none';
    } else {
      const now = new Date();
      tooltip.innerHTML = `
        <div class="nt-header">📡 Network Status</div>
        <div class="nt-row"><span>🔒 Network:</span> <b>${currentConfig.wifiName}</b></div>
        <div class="nt-row"><span>📶 Signal:</span> <b>Excellent (${currentConfig.signalStrength}/4 bars)</b></div>
        <div class="nt-row"><span>⚡ Speed:</span> <b>${currentConfig.downloadSpeed} ↓ / ${currentConfig.uploadSpeed} ↑</b></div>
        <div class="nt-row"><span>🔐 Encryption:</span> <b>${currentConfig.encryption}</b></div>
        <div class="nt-row"><span>🛡️ Firewall:</span> <b>Active</b></div>
        <div class="nt-row"><span>🌐 IP:</span> <b>${currentConfig.ipPrefix}.***</b></div>
        <div class="nt-row"><span>📍 Server:</span> <b>${currentConfig.server}</b></div>
        <div class="nt-footer">Last checked: ${Utils.formatTime(now)}</div>
      `;
      tooltip.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        tooltip.style.display = 'none';
      }, 5000);
    }
  }
  
  // ============ NETWORK ISSUE SIMULATION ============
  
  function simulateNetworkIssue() {
    const overlay = document.createElement('div');
    overlay.className = 'network-issue-overlay';
    overlay.innerHTML = `
      <div class="ni-content">
        <div class="ni-icon">📡</div>
        <h3>Reconnecting to ${currentConfig.wifiName}</h3>
        <p>Checking network connectivity...</p>
        <div class="ni-progress-bar">
          <div class="ni-progress-fill" id="reconnectProgress"></div>
        </div>
        <p class="ni-subtext">This may take a few moments</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Simulate reconnection progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          overlay.remove();
          Utils.showToast('✅ Connected to ' + currentConfig.wifiName);
        }, 500);
      }
      
      const progressEl = Utils.$('reconnectProgress');
      if (progressEl) progressEl.style.width = progress + '%';
    }, 300);
    
    HistorySystem.addEntry('security', 'Network Issue', 'Simulated network reconnection');
  }
  
  // ============ API OVERRIDES ============
  
  function overrideNetworkAPIs() {
    // Override navigator.connection if available
    if ('connection' in navigator) {
      const originalConnection = navigator.connection;
      
      try {
        Object.defineProperty(navigator, 'connection', {
          get: () => ({
            effectiveType: '4g',
            downlink: 100,
            rtt: 10,
            type: 'wifi',
            saveData: false,
            addEventListener: () => {},
            removeEventListener: () => {}
          }),
          configurable: true
        });
      } catch (e) {
        // Fallback
      }
    }
    
    // Override fetch to add fake headers
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (args[1] && typeof args[1] === 'object') {
        args[1].headers = args[1].headers || {};
        args[1].headers['X-Network-Name'] = currentConfig.wifiName;
        args[1].headers['X-Network-Type'] = 'NTA-Secure';
      }
      return originalFetch.apply(this, args);
    };
  }
  
  function blockWebRTCLeaks() {
    // Block RTCPeerConnection IP leaks
    if (window.RTCPeerConnection) {
      const origRTCPeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = function(config, constraints) {
        // Filter out ICE servers that might leak IP
        if (config && config.iceServers) {
          config.iceServers = [];
        }
        return new origRTCPeerConnection(config, constraints);
      };
      window.RTCPeerConnection.prototype = origRTCPeerConnection.prototype;
    }
  }
  
  function generateFakeLogs() {
    const fakeLogs = [
      { type: 'HTTPS', url: 'nta.ac.in/api/research', status: 200, size: '1.2KB' },
      { type: 'HTTPS', url: 'csir.res.in/analytics', status: 200, size: '3.4KB' },
      { type: 'WebSocket', url: 'wss://nta-secure.in/sync', status: 101, size: '0.5KB' },
      { type: 'HTTPS', url: 'firestore.googleapis.com', status: 200, size: '2.1KB' },
      { type: 'HTTPS', url: 'cdn.nta.gov.in/assets', status: 304, size: '0KB' }
    ];
    
    // Override console.log for network entries
    const originalLog = console.log;
    console.log = function(...args) {
      if (typeof args[0] === 'string' && args[0].includes('[Network]')) {
        const fakeLog = Utils.randomItem(fakeLogs);
        originalLog(`[Network] ${fakeLog.type} ${fakeLog.url} - ${fakeLog.status} (${fakeLog.size})`);
      } else {
        originalLog.apply(console, args);
      }
    };
  }
  
  // ============ CLEANUP ============
  
  function destroy() {
    stopPeriodicUpdates();
  }
  
  // ============ EXPORT ============
  
  return {
    initialize,
    updateDisplay,
    toggleInfo,
    simulateNetworkIssue,
    getCurrentConfig: () => ({ ...currentConfig }),
    destroy
  };
})();