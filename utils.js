// ============ UTILITY MODULE ============
const Utils = (function() {
  'use strict';
  
  // DOM Helper
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);
  const $1 = (selector) => document.querySelector(selector);
  
  // Toast System
  let toastTimer = null;
  
  function showToast(message, duration = 3000, type = 'info') {
    const toast = $('toast');
    if (!toast) return;
    
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast show toast-${type}`;
    
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
  
  // Emergency Toast
  function showEmergencyToast(message, duration = 8000) {
    const container = $('emergencyToastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'emergency-toast-item';
    toast.innerHTML = `
      🆘 <strong>EMERGENCY!</strong><br>
      <span>${message}</span>
      <br><small>Click to dismiss</small>
    `;
    toast.onclick = () => toast.remove();
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, duration);
  }
  
  // Badge Update
  function updateBadge(count) {
    const badge = $('notificationBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.style.display = 'flex';
      badge.textContent = count > 99 ? '99+' : count;
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Time Formatting
  function formatTime(date) {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  function formatDate(date) {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  function formatShortDate(date) {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  
  // Get today/yesterday labels
  function getDateLabel(dateString) {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return dateString;
  }
  
  // Scroll to bottom
  function scrollToBottom(containerId = 'messagesContainer') {
    const container = $(containerId);
    if (container) {
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }
  
  // LocalStorage helpers
  function getStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
  
  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
  
  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttle function
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Generate unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Sanitize HTML
  function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // Escape regex special chars
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Truncate text
  function truncate(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  
  // Copy to clipboard
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('📋 Copied to clipboard');
      return true;
    } catch (e) {
      showToast('Failed to copy');
      return false;
    }
  }
  
  // Shuffle array
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Get random item from array
  function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // Check if device is mobile
  function isMobile() {
    return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || window.innerWidth < 768;
  }
  
  // Check if browser supports notifications
  function supportsNotifications() {
    return 'Notification' in window;
  }
  
  // Request notification permission
  async function requestNotificationPermission() {
    if (!supportsNotifications()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      return false;
    }
  }
  
  // Send notification
  function sendNotification(title, body, options = {}) {
    if (!supportsNotifications() || Notification.permission !== 'granted') return;
    
    try {
      new Notification(title, {
        body: body,
        icon: '🔬',
        requireInteraction: options.requireInteraction || false,
        vibrate: options.vibrate || [200, 100, 200],
        ...options
      });
    } catch (e) {
      console.log('Notification failed:', e);
    }
  }
  
  // Vibration pattern
  function vibrate(pattern = [200]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
  
  // Audio context for sounds
  let audioCtx = null;
  
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }
  
  function playBeep(frequency = 800, duration = 0.2, volume = 0.3) {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not available
    }
  }
  
  function playEmergencySound() {
    try {
      const beeps = [
        { freq: 800, dur: 0.2, gap: 0.1 },
        { freq: 800, dur: 0.2, gap: 0.1 },
        { freq: 800, dur: 0.2, gap: 0.3 },
        { freq: 1000, dur: 0.4, gap: 0.2 },
        { freq: 1000, dur: 0.4, gap: 0.2 }
      ];
      
      let startTime = getAudioContext().currentTime;
      beeps.forEach(beep => {
        const osc = getAudioContext().createOscillator();
        const gain = getAudioContext().createGain();
        osc.connect(gain);
        gain.connect(getAudioContext().destination);
        osc.frequency.value = beep.freq;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + beep.dur);
        osc.start(startTime);
        osc.stop(startTime + beep.dur);
        startTime += beep.dur + beep.gap;
      });
    } catch (e) {}
  }
  
  // Export public API
  return {
    $, $$, $1,
    showToast,
    showEmergencyToast,
    updateBadge,
    formatTime,
    formatDate,
    formatShortDate,
    getDateLabel,
    scrollToBottom,
    getStorage,
    setStorage,
    removeStorage,
    debounce,
    throttle,
    generateId,
    sanitizeHTML,
    escapeRegex,
    truncate,
    copyToClipboard,
    shuffleArray,
    randomItem,
    isMobile,
    supportsNotifications,
    requestNotificationPermission,
    sendNotification,
    vibrate,
    playBeep,
    playEmergencySound,
    getAudioContext
  };
})();