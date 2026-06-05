// ============ BOOKMARK SYSTEM MODULE ============
const BookmarkSystem = (function() {
  'use strict';
  
  let bookmarks = [];
  let bookmarkIdCounter = 0;
  let currentFilter = 'all';
  let bookmarkFolders = ['all', 'molecular', 'ecology', 'physiology', 'genetics', 'important'];
  
  // ============ INITIALIZE ============
  
  function initialize() {
    loadBookmarks();
    loadFolders();
  }
  
  function loadBookmarks() {
    bookmarks = Utils.getStorage('researchBookmarks', []);
    bookmarkIdCounter = Utils.getStorage('bookmarkIdCounter', 0);
  }
  
  function loadFolders() {
    bookmarkFolders = Utils.getStorage('bookmarkFolders', bookmarkFolders);
  }
  
  function saveBookmarks() {
    Utils.setStorage('researchBookmarks', bookmarks);
    Utils.setStorage('bookmarkIdCounter', bookmarkIdCounter);
  }
  
  function saveFolders() {
    Utils.setStorage('bookmarkFolders', bookmarkFolders);
  }
  
  // ============ ADD BOOKMARK ============
  
  function addBookmark(title, preview, category = 'general', metadata = {}) {
    bookmarkIdCounter++;
    
    const bookmark = {
      id: bookmarkIdCounter,
      title: title,
      preview: preview,
      category: category,
      folder: 'all',
      pinned: false,
      createdAt: new Date().toISOString(),
      metadata: metadata
    };
    
    bookmarks.unshift(bookmark);
    saveBookmarks();
    
    HistorySystem.addEntry('bookmark', 'Bookmark Added', Utils.truncate(title, 60));
    return bookmark;
  }
  
  function addFromMessage(preview, type = 'message') {
    const bookmark = addBookmark(
      `Message: ${Utils.truncate(preview, 40)}`,
      preview,
      type,
      { source: 'message', type: type }
    );
    Utils.showToast('🔖 Message bookmarked');
    return bookmark;
  }
  
  function addFromHistory(historyId) {
    const entry = HistorySystem.getItem(historyId);
    if (entry) {
      addBookmark(entry.title, entry.detail, entry.type, { historyId: historyId });
      Utils.showToast('🔖 Added to bookmarks');
    }
  }
  
  // ============ BOOKMARK OPERATIONS ============
  
  function togglePin(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      bookmark.pinned = !bookmark.pinned;
      saveBookmarks();
      render();
      Utils.showToast(bookmark.pinned ? '📌 Pinned' : '📌 Unpinned');
    }
  }
  
  function deleteBookmark(id) {
    if (confirm('Remove this bookmark?')) {
      bookmarks = bookmarks.filter(b => b.id !== id);
      saveBookmarks();
      render();
      Utils.showToast('🗑 Bookmark removed');
    }
  }
  
  function moveToFolder(id, folder) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (bookmark) {
      bookmark.folder = folder;
      saveBookmarks();
      render();
      Utils.showToast(`📁 Moved to ${folder}`);
    }
  }
  
  // ============ RENDER ============
  
  function render() {
    const container = Utils.$('bookmarksContainer');
    if (!container) return;
    
    const searchTerm = (Utils.$('bookmarkSearch')?.value || '').toLowerCase();
    
    let filtered = [...bookmarks];
    
    // Folder filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(b => b.folder === currentFilter || b.category === currentFilter);
    }
    
    // Search
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(searchTerm) ||
        b.preview.toLowerCase().includes(searchTerm) ||
        b.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    let html = `
      <div class="bookmarks-header">
        <h3>🔖 Research Bookmarks</h3>
        <div class="bookmarks-actions-bar">
          <button class="header-btn" onclick="BookmarkSystem.addFolder()">📁 New Folder</button>
          <button class="header-btn" onclick="BookmarkSystem.exportData()">📥 Export</button>
        </div>
      </div>
      
      <div class="bookmark-folders-bar">
        ${bookmarkFolders.map(f => `
          <div class="bookmark-folder-tab ${currentFilter === f ? 'active' : ''}" 
               onclick="BookmarkSystem.setFilter('${f}')">
            ${getFolderIcon(f)} ${f === 'all' ? 'All' : f}
          </div>
        `).join('')}
      </div>
      
      <input type="text" id="bookmarkSearch" class="bookmark-search-input" 
             placeholder="🔍 Search bookmarks..." oninput="BookmarkSystem.render()">
      
      <div class="bookmarks-grid">
        ${filtered.length === 0 ? renderEmptyState() : filtered.map(b => renderBookmarkCard(b)).join('')}
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  function renderBookmarkCard(bookmark) {
    const time = Utils.formatShortDate(new Date(bookmark.createdAt));
    const categoryColors = {
      'molecular': '#e8f0f8', 'ecology': '#e8f5e9', 'physiology': '#fce4ec',
      'genetics': '#f3e5f5', 'biochemistry': '#fef3e0', 'immunology': '#e0f2f1',
      'message': '#f3e5f5', 'test': '#fff9c4', 'important': '#ffebee',
      'general': '#f5f5f5'
    };
    
    const bgColor = categoryColors[bookmark.category] || '#f5f5f5';
    
    return `
      <div class="bookmark-card ${bookmark.pinned ? 'pinned' : ''}" onclick="BookmarkSystem.openBookmark(${bookmark.id})">
        <span class="bm-category-tag" style="background:${bgColor};">${bookmark.category}</span>
        ${bookmark.pinned ? '<span class="bm-pin-icon">📌</span>' : ''}
        <div class="bm-title">${Utils.sanitizeHTML(bookmark.title)}</div>
        <div class="bm-preview">${Utils.sanitizeHTML(Utils.truncate(bookmark.preview, 80))}</div>
        <div class="bm-meta">
          <span>📅 ${time}</span>
          <div class="bm-actions" onclick="event.stopPropagation();">
            <button class="bm-btn bm-pin-btn ${bookmark.pinned ? 'active' : ''}" 
                    onclick="BookmarkSystem.togglePin(${bookmark.id})" title="Pin">📌</button>
            <select onchange="BookmarkSystem.moveToFolder(${bookmark.id}, this.value)" class="bm-folder-select">
              <option value="">📁</option>
              ${bookmarkFolders.filter(f => f !== 'all').map(f => 
                `<option value="${f}" ${bookmark.folder === f ? 'selected' : ''}>${f}</option>`
              ).join('')}
            </select>
            <button class="bm-btn bm-delete-btn" onclick="BookmarkSystem.deleteBookmark(${bookmark.id})" title="Delete">🗑</button>
          </div>
        </div>
      </div>
    `;
  }
  
  function renderEmptyState() {
    return `
      <div class="bookmarks-empty">
        <div class="be-icon">🔖</div>
        <div class="be-title">No Bookmarks Yet</div>
        <div class="be-subtitle">Bookmark messages and research content for quick access</div>
      </div>
    `;
  }
  
  function getFolderIcon(folder) {
    const icons = {
      'all': '📌', 'molecular': '🧬', 'ecology': '🌍', 'physiology': '🔬',
      'genetics': '🧬', 'important': '⭐', 'biochemistry': '🧪', 'immunology': '💉'
    };
    return icons[folder] || '📁';
  }
  
  // ============ FILTER ============
  
  function setFilter(folder) {
    currentFilter = folder;
    render();
  }
  
  // ============ OPEN BOOKMARK ============
  
  function openBookmark(id) {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;
    
    // Navigate based on category
    const sectionMap = {
      'message': 'ai-assistant',
      'test': 'mocktest',
      'video': 'videos',
      'notes': 'notes',
      'search': 'ai-assistant',
      'molecular': 'ai-assistant',
      'ecology': 'ai-assistant'
    };
    
    const section = sectionMap[bookmark.category] || 'ai-assistant';
    App.navigateTo(section);
    
    HistorySystem.addEntry('bookmark', 'Bookmark Opened', bookmark.title);
    Utils.showToast(`📖 Opened: ${bookmark.title}`);
  }
  
  // ============ FOLDER MANAGEMENT ============
  
  function addFolder() {
    const folderName = prompt('Enter new folder name:');
    if (folderName && folderName.trim()) {
      const slug = folderName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!bookmarkFolders.includes(slug)) {
        bookmarkFolders.push(slug);
        saveFolders();
        render();
        Utils.showToast(`📁 Folder "${folderName}" created`);
      } else {
        Utils.showToast('Folder already exists', 3000, 'warning');
      }
    }
  }
  
  // ============ EXPORT ============
  
  function exportData() {
    let exportText = 'RESEARCH BOOKMARKS\n' + '='.repeat(50) + '\n\n';
    
    const grouped = {};
    bookmarks.forEach(b => {
      if (!grouped[b.folder]) grouped[b.folder] = [];
      grouped[b.folder].push(b);
    });
    
    for (let [folder, items] of Object.entries(grouped)) {
      exportText += `📁 Folder: ${folder.toUpperCase()}\n${'-'.repeat(30)}\n`;
      items.forEach((b, i) => {
        exportText += `${i + 1}. ${b.title}\n   ${b.preview}\n   Category: ${b.category} | ${new Date(b.createdAt).toLocaleDateString()}\n\n`;
      });
    }
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-bookmarks-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('📥 Bookmarks exported');
  }
  
  // ============ EXPORT ============
  
  return {
    initialize,
    addBookmark,
    addFromMessage,
    addFromHistory,
    togglePin,
    deleteBookmark,
    moveToFolder,
    setFilter,
    openBookmark,
    addFolder,
    exportData,
    render
  };
})();