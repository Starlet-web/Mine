// ============ HISTORY SYSTEM MODULE ============
const HistorySystem = (function() {
  'use strict';
  
  let activityHistory = [];
  let historyIdCounter = 0;
  
  // ============ INITIALIZE ============
  
  function initialize() {
    loadHistory();
    
    // Generate fake history if empty
    if (activityHistory.length === 0) {
      generateFakeHistory();
    }
    
    // Set up periodic cleanup
    setInterval(cleanupOldHistory, 86400000); // Daily
  }
  
  function loadHistory() {
    activityHistory = Utils.getStorage('activityHistory', []);
    historyIdCounter = Utils.getStorage('historyIdCounter', 0);
  }
  
  function saveHistory() {
    Utils.setStorage('activityHistory', activityHistory);
    Utils.setStorage('historyIdCounter', historyIdCounter);
  }
  
  // ============ ADD ENTRY ============
  
  function addEntry(type, title, detail, metadata = {}) {
    historyIdCounter++;
    
    const entry = {
      id: historyIdCounter,
      type: type,
      title: title,
      detail: detail,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
      metadata: metadata
    };
    
    activityHistory.unshift(entry);
    
    // Limit history size
    if (activityHistory.length > CONFIG.history.maxItems) {
      activityHistory = activityHistory.slice(0, CONFIG.history.maxItems);
    }
    
    saveHistory();
    return entry;
  }
  
  // ============ RENDER ============
  
  function render(filteredHistory = null) {
    const container = Utils.$('historyContainer');
    if (!container) return;
    
    const history = filteredHistory || activityHistory;
    
    // Render header with stats
    let html = renderHeader(history);
    
    if (history.length === 0) {
      html += renderEmptyState();
    } else {
      html += renderTimeline(history);
    }
    
    container.innerHTML = html;
    
    // Set up event listeners
    setupEventListeners();
  }
  
  function renderHeader(history) {
    const today = new Date().toDateString();
    const todayItems = history.filter(h => h.date === today);
    
    return `
      <div class="history-header">
        <h3>📜 Research Activity History</h3>
        <div class="history-actions-bar">
          <button class="header-btn" onclick="HistorySystem.clearAll()">🗑 Clear All</button>
          <button class="header-btn" onclick="HistorySystem.exportData()">📥 Export</button>
        </div>
      </div>
      
      <div class="history-search-bar">
        <input type="text" id="historySearch" class="history-search-input" 
               placeholder="🔍 Search history..." oninput="HistorySystem.filter()">
        <select id="historyTypeFilter" class="history-filter-select" onchange="HistorySystem.filter()">
          <option value="all">All Activities</option>
          <option value="message">💬 Messages</option>
          <option value="search">🔍 Searches</option>
          <option value="test">📝 Tests</option>
          <option value="video">🎥 Videos</option>
          <option value="notes">📚 Notes</option>
          <option value="bookmark">🔖 Bookmarks</option>
          <option value="login">🔐 Login</option>
          <option value="security">🛡️ Security</option>
          <option value="emergency">🆘 Emergency</option>
          <option value="voice">🎤 Voice</option>
        </select>
        <select id="historyDateFilter" class="history-filter-select" onchange="HistorySystem.filter()">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      
      <div class="history-stats-grid">
        <div class="history-stat-card">
          <div class="hsc-value">${todayItems.length}</div>
          <div class="hsc-label">Today</div>
        </div>
        <div class="history-stat-card">
          <div class="hsc-value">${history.length}</div>
          <div class="hsc-label">Total</div>
        </div>
        <div class="history-stat-card">
          <div class="hsc-value">${history.filter(h => h.type === 'message').length}</div>
          <div class="hsc-label">Messages</div>
        </div>
        <div class="history-stat-card">
          <div class="hsc-value">${history.filter(h => h.type === 'test').length}</div>
          <div class="hsc-label">Tests</div>
        </div>
      </div>
    `;
  }
  
  function renderTimeline(history) {
    // Group by date
    const grouped = {};
    history.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = [];
      grouped[item.date].push(item);
    });
    
    let html = '<div class="history-timeline">';
    
    for (let [date, items] of Object.entries(grouped)) {
      const dateLabel = Utils.getDateLabel(date);
      
      html += `
        <div class="history-date-header">📅 ${dateLabel}</div>
      `;
      
      items.forEach(item => {
        const time = new Date(item.timestamp);
        const iconData = getIconData(item.type);
        
        html += `
          <div class="history-timeline-item" data-id="${item.id}" data-type="${item.type}">
            <div class="hti-icon ${iconData.class}">${iconData.icon}</div>
            <div class="hti-content">
              <div class="hti-title">${Utils.sanitizeHTML(item.title)}</div>
              <div class="hti-detail">${Utils.sanitizeHTML(item.detail)}</div>
              <div class="hti-time">🕐 ${Utils.formatTime(time)}</div>
            </div>
            <div class="hti-actions">
              <button class="hti-btn" onclick="event.stopPropagation(); BookmarkSystem.addFromHistory(${item.id})" title="Bookmark">🔖</button>
              <button class="hti-btn hti-delete" onclick="event.stopPropagation(); HistorySystem.deleteItem(${item.id})" title="Delete">🗑</button>
            </div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    return html;
  }
  
  function renderEmptyState() {
    return `
      <div class="history-empty">
        <div class="he-icon">📜</div>
        <div class="he-title">No Activity History</div>
        <div class="he-subtitle">Your research activities will appear here</div>
      </div>
    `;
  }
  
  function getIconData(type) {
    const icons = {
      message: { icon: '💬', class: 'icon-message' },
      search: { icon: '🔍', class: 'icon-search' },
      test: { icon: '📝', class: 'icon-test' },
      video: { icon: '🎥', class: 'icon-video' },
      notes: { icon: '📚', class: 'icon-notes' },
      bookmark: { icon: '🔖', class: 'icon-bookmark' },
      login: { icon: '🔐', class: 'icon-login' },
      security: { icon: '🛡️', class: 'icon-security' },
      emergency: { icon: '🆘', class: 'icon-emergency' },
      voice: { icon: '🎤', class: 'icon-voice' },
      navigation: { icon: '🧭', class: 'icon-navigation' },
      decoy: { icon: '📋', class: 'icon-decoy' }
    };
    
    return icons[type] || { icon: '📌', class: 'icon-default' };
  }
  
  // ============ FILTER ============
  
  function filter() {
    const searchTerm = (Utils.$('historySearch')?.value || '').toLowerCase();
    const typeFilter = Utils.$('historyTypeFilter')?.value || 'all';
    const dateFilter = Utils.$('historyDateFilter')?.value || 'all';
    
    let filtered = [...activityHistory];
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(h => h.type === typeFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = now.toDateString();
      const yesterday = new Date(now - 86400000).toDateString();
      const weekAgo = new Date(now - 7 * 86400000);
      const monthAgo = new Date(now - 30 * 86400000);
      
      filtered = filtered.filter(h => {
        const itemDate = new Date(h.date);
        switch(dateFilter) {
          case 'today': return h.date === today;
          case 'yesterday': return h.date === yesterday;
          case 'week': return itemDate >= weekAgo;
          case 'month': return itemDate >= monthAgo;
          default: return true;
        }
      });
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(h =>
        h.title.toLowerCase().includes(searchTerm) ||
        h.detail.toLowerCase().includes(searchTerm) ||
        h.type.toLowerCase().includes(searchTerm)
      );
    }
    
    render(filtered);
  }
  
  // ============ DELETE ============
  
  function deleteItem(id) {
    if (confirm('Delete this history item?')) {
      activityHistory = activityHistory.filter(h => h.id !== id);
      saveHistory();
      filter();
      Utils.showToast('🗑 History item deleted');
    }
  }
  
  function clearAll() {
    if (confirm('Clear ALL activity history? This cannot be undone.')) {
      activityHistory = [];
      saveHistory();
      render();
      Utils.showToast('📜 All history cleared');
    }
  }
  
  // ============ EXPORT ============
  
  function exportData() {
    let exportText = 'RESEARCH ACTIVITY HISTORY\n';
    exportText += '='.repeat(50) + '\n';
    exportText += `Exported: ${new Date().toLocaleString()}\n\n`;
    
    activityHistory.forEach(item => {
      const time = new Date(item.timestamp).toLocaleString('en-IN');
      exportText += `[${time}] ${item.type.toUpperCase()}\n`;
      exportText += `  Title: ${item.title}\n`;
      exportText += `  Detail: ${item.detail}\n`;
      exportText += '-'.repeat(40) + '\n';
    });
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-history-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('📥 History exported');
  }
  
  // ============ FAKE HISTORY ============
  
  function generateFakeHistory() {
    const fakeTemplates = [
      { type: 'search', titles: [
        'DNA replication mechanisms CSIR NET', 'Enzyme kinetics problems',
        'Ecological succession PYQs', 'Hardy Weinberg equilibrium numericals',
        'Transcription factors eukaryotes', 'CRISPR gene editing applications',
        'Population genetics formulas', 'Mendelian genetics ratio problems'
      ]},
      { type: 'test', titles: [
        'Mock Test 1 - Full Syllabus', 'Daily Quiz - Ecology Unit',
        'PYQ Practice - 2023 Paper', 'Topic Test - Molecular Biology'
      ]},
      { type: 'video', titles: [
        'DNA Replication - Shomu\'s Biology', 'Enzyme Kinetics - Unacademy',
        'Immunology Crash Course - IFAS', 'Genetics Problem Solving - VedPrep'
      ]},
      { type: 'notes', titles: [
        'Molecular Biology Notes Review', 'Ecology Unit 4 Study',
        'Biochemistry Formula Revision', 'Immunology Chapter Summary'
      ]}
    ];
    
    const now = new Date();
    let fakeItems = [];
    
    for (let i = 0; i < CONFIG.history.fakeHistoryCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now - daysAgo * 86400000);
      const category = Utils.randomItem(fakeTemplates);
      const title = Utils.randomItem(category.titles);
      
      fakeItems.push({
        id: historyIdCounter + i + 1,
        type: category.type,
        title: title,
        detail: `Research activity: ${title}`,
        timestamp: date.toISOString(),
        date: date.toDateString(),
        metadata: { fake: true }
      });
    }
    
    activityHistory.push(...fakeItems);
    historyIdCounter += fakeItems.length;
    
    // Sort by timestamp
    activityHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    saveHistory();
  }
  
  // ============ CLEANUP ============
  
  function cleanupOldHistory() {
    const cutoffDate = new Date(Date.now() - CONFIG.history.retentionDays * 86400000).toDateString();
    const oldCount = activityHistory.filter(h => new Date(h.date) < new Date(cutoffDate)).length;
    
    if (oldCount > 0) {
      activityHistory = activityHistory.filter(h => new Date(h.date) >= new Date(cutoffDate));
      saveHistory();
    }
  }
  
  // ============ EVENT LISTENERS ============
  
  function setupEventListeners() {
    // Click on history item to view details
    document.querySelectorAll('.history-timeline-item').forEach(item => {
      item.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const entry = activityHistory.find(h => h.id === id);
        if (entry) {
          Utils.showToast(`${entry.type.toUpperCase()}: ${entry.detail}`, 5000, 'info');
        }
      });
    });
  }
  
  // ============ GET ITEM ============
  
  function getItem(id) {
    return activityHistory.find(h => h.id === id);
  }
  
  // ============ EXPORT ============
  
  return {
    initialize,
    addEntry,
    render,
    filter,
    deleteItem,
    clearAll,
    exportData,
    getItem,
    getAll: () => [...activityHistory]
  };
})();