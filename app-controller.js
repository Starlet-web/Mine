// ============ APPLICATION CONTROLLER ============
const App = (function() {
  'use strict';
  
  let currentSection = 'ai-assistant';
  
  // Section loaders mapping
  const sectionLoaders = {
    'ai-assistant': () => {},
    'mocktest': ContentSections.loadMockTest,
    'pyq': ContentSections.loadPYQs,
    'videos': ContentSections.loadVideos,
    'notes': ContentSections.loadNotes,
    'formula': ContentSections.loadFormulas,
    'mindmap': ContentSections.loadMindMaps,
    'forum': ContentSections.loadForum,
    'daily': ContentSections.loadDailyMCQs,
    'leaderboard': ContentSections.loadLeaderboard,
    'progress': ContentSections.loadProgress,
    'history': HistorySystem.render,
    'bookmarks': BookmarkSystem.render
  };
  
  // Section names for history tracking
  const sectionNames = {
    'ai-assistant': 'AI Assistant',
    'mocktest': 'Mock Tests',
    'pyq': 'PYQ Database',
    'videos': 'Video Lectures',
    'notes': 'Study Notes',
    'formula': 'Formula Sheet',
    'mindmap': 'Mind Maps',
    'forum': 'Discussion Forum',
    'daily': 'Daily MCQs',
    'leaderboard': 'Leaderboard',
    'progress': 'Progress Analytics',
    'history': 'Activity History',
    'bookmarks': 'Bookmarks'
  };
  
  // ============ NAVIGATION ============
  
  function navigateTo(sectionId) {
    if (sectionId === currentSection && sectionId !== 'ai-assistant') return;
    
    currentSection = sectionId;
    
    // Update section panels
    document.querySelectorAll('.section-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    const panel = Utils.$('section-' + sectionId);
    if (panel) panel.classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionId) {
        item.classList.add('active');
      }
    });
    
    // Update sidebar
    document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.section === sectionId) {
        item.classList.add('active');
      }
    });
    
    // Load section content
    if (sectionLoaders[sectionId]) {
      sectionLoaders[sectionId]();
    }
    
    // Update message system
    MessageSystem.setCurrentSection(sectionId);
    
    // Track in history
    if (sectionNames[sectionId]) {
      HistorySystem.addEntry('navigation', `Viewed ${sectionNames[sectionId]}`, 
        `Switched to ${sectionNames[sectionId]} section`);
    }
    
    // Scroll to top of content area
    const contentArea = Utils.$('contentArea');
    if (contentArea) contentArea.scrollTop = 0;
  }
  
  // ============ MODALS ============
  
  function showModal(modalId) {
    const modal = Utils.$(modalId);
    if (modal) modal.classList.add('active');
  }
  
  function closeModal(modalId) {
    const modal = Utils.$(modalId);
    if (modal) modal.classList.remove('active');
  }
  
  function showDeleteModal() {
    showModal('deleteModal');
  }
  
  // ============ CLOCK ============
  
  function updateClock() {
    const clockEl = Utils.$('govtLiveTime');
    if (clockEl) {
      clockEl.textContent = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' IST';
    }
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Navigation event listeners
    Utils.$('navBar')?.addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (navItem && navItem.dataset.section) {
        navigateTo(navItem.dataset.section);
      }
    });
    
    // Sidebar event listeners
    Utils.$('sidebar')?.addEventListener('click', (e) => {
      const sidebarItem = e.target.closest('.sidebar-item[data-section]');
      if (sidebarItem && sidebarItem.dataset.section) {
        navigateTo(sidebarItem.dataset.section);
        
        // If topic is specified, pre-fill chat input
        if (sidebarItem.dataset.topic) {
          const topicQueries = {
            'dna': 'Explain DNA replication mechanism in prokaryotes',
            'transcription': 'What are the steps of transcription in eukaryotes?',
            'translation': 'Describe the process of translation initiation',
            'enzyme': 'Explain enzyme kinetics and Michaelis-Menten equation',
            'metabolism': 'Describe the complete glycolysis pathway',
            'population': 'Explain population growth models in ecology',
            'ecosystem': 'What is energy flow in ecosystems?',
            'mendelian': 'Explain Mendel\'s laws of inheritance',
            'popgen': 'What is Hardy-Weinberg equilibrium?'
          };
          
          const query = topicQueries[sidebarItem.dataset.topic];
          if (query && Utils.$('messageInput')) {
            Utils.$('messageInput').value = query;
            Utils.$('messageInput').focus();
          }
        }
      }
    });
    
    // Delete modal
    Utils.$('cancelDeleteBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    Utils.$('confirmDeleteBtn')?.addEventListener('click', async () => {
      Utils.$('confirmDeleteBtn').disabled = true;
      Utils.$('deleteProgress').textContent = 'Resetting...';
      
      try {
        await Database.deleteAllMessages();
        Utils.showToast('Session reset');
      } catch (e) {
        Utils.showToast('Error resetting', 3000, 'error');
      } finally {
        closeModal('deleteModal');
        Utils.$('confirmDeleteBtn').disabled = false;
        Utils.$('deleteProgress').textContent = '';
      }
    });
    
    // Fullscreen overlay
    Utils.$('fullscreenOverlay')?.addEventListener('click', function() {
      this.classList.remove('active');
    });
    
    // Close modals on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });
    
    // Initial section load
    navigateTo('ai-assistant');
    
    // Add default mock messages
    addDefaultMessages();
  }
  
  function addDefaultMessages() {
    const container = Utils.$('messagesContainer');
    if (!container) return;
    
    const defaults = [
      {
        type: 'own',
        label: '🧑‍🔬 Research Query',
        text: 'Analyzing molecular mechanisms of eukaryotic transcription for my dissertation. Can you explain transcription factor roles in gene regulation and connection to MAP kinase signaling?',
        time: '09:45 AM'
      },
      {
        type: 'received',
        label: '🤖 AI Research Analysis',
        text: 'Eukaryotic transcription involves coordinated assembly of general transcription factors (TFIIA, TFIIB, TFIID) at the core promoter. TBP subunit of TFIID recognizes TATA box, facilitating RNA Polymerase II recruitment. This connects to MAP kinase signaling through phosphorylation of c-Fos and c-Jun forming AP-1 complexes.',
        time: '09:46 AM'
      }
    ];
    
    defaults.forEach(msg => {
      const div = document.createElement('div');
      div.className = `message-bubble ${msg.type === 'own' ? 'own' : ''} persistent-mock`;
      div.innerHTML = `
        <span class="msg-label">${msg.label}</span>
        ${msg.text}
        <div class="message-meta">
          <span>${msg.time}</span>
          ${msg.type === 'own' ? '<span class="seen-tick">✓✓</span>' : ''}
        </div>`;
      container.appendChild(div);
    });
  }
  
  // ============ EXPORT ============
  
  return {
    navigateTo,
    showModal,
    closeModal,
    showDeleteModal,
    getCurrentSection: () => currentSection,
    initialize
  };
})();