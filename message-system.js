// ============ MESSAGE SYSTEM MODULE ============
const MessageSystem = (function() {
  'use strict';
  
  let selfDestructMode = false;
  let unsubscribeMessages = null;
  let unsubscribeTyping = null;
  let unsubscribePresence = null;
  let lastReadTimestamp = firebase.firestore.Timestamp.now();
  let unreadCount = 0;
  let currentSection = 'ai-assistant';
  let messageListener = null;
  
  // Secret code system for message encoding
  const secretCodes = {
    'meet': 'research collaboration session',
    'call': 'academic discussion',
    'chat': 'study group meeting',
    'photo': 'research diagram',
    'video': 'lecture recording',
    'love': 'appreciation for subject',
    'miss': 'require clarification',
    'home': 'research facility',
    'food': 'nutrition study',
    'sleep': 'rest period analysis',
    'movie': 'documentary review',
    'game': 'simulation exercise',
    'party': 'academic conference',
    'drink': 'hydration protocol',
    'date': 'peer review session',
    'urgent': 'priority research',
    'secret': 'confidential data',
    'hide': 'encrypted information',
    'danger': 'biohazard protocol'
  };
  
  function encodeMessage(text) {
    let encoded = text;
    Object.entries(secretCodes).forEach(([key, value]) => {
      const regex = new RegExp(key, 'gi');
      encoded = encoded.replace(regex, value);
    });
    return encoded;
  }
  
  function decodeMessage(text) {
    let decoded = text;
    Object.entries(secretCodes).forEach(([key, value]) => {
      const regex = new RegExp(Utils.escapeRegex(value), 'gi');
      decoded = decoded.replace(regex, key);
    });
    return decoded;
  }
  
  // ============ SEND MESSAGE ============
  
  async function send(text = null) {
    if (!Auth.isLoggedIn()) return;
    
    const inputText = text || Utils.$('messageInput').value.trim();
    if (!inputText) return;
    
    // Clear input
    if (!text) Utils.$('messageInput').value = '';
    
    // Encode message
    const encoded = encodeMessage(inputText);
    
    // Clear typing indicator
    try {
      await Database.setTyping(Auth.getCurrentUser().email, false);
    } catch (e) {}
    
    // Send message
    try {
      await Database.sendMessage({
        type: 'text',
        text: encoded,
        selfDestruct: selfDestructMode,
        stealthMode: StealthMode.isActive()
      });
      
      // Track in history
      HistorySystem.addEntry('message', 'Message Sent', Utils.truncate(inputText, 60), {
        fullText: inputText,
        direction: 'sent',
        encoded: encoded
      });
      
      // Add XP
      XPSystem.addXP(10);
      
      // Simulate response typing
      setTimeout(() => simulateTyping(), 1000);
      
    } catch (e) {
      Utils.showToast('Failed to send message', 3000, 'error');
    }
  }
  
  // ============ TOGGLE SELF-DESTRUCT ============
  
  function toggleSelfDestruct() {
    selfDestructMode = !selfDestructMode;
    const btn = Utils.$('selfDestructToggle');
    
    if (btn) {
      btn.classList.toggle('active', selfDestructMode);
    }
    
    Utils.showToast(
      selfDestructMode ? '⏱️ Self-destruct mode ON (5 min)' : '⏱️ Self-destruct mode OFF'
    );
  }
  
  function isSelfDestructMode() {
    return selfDestructMode;
  }
  
  // ============ TYPING INDICATOR ============
  
  function simulateTyping(duration = 2000) {
    const typingIndicator = Utils.$('typingIndicator');
    if (!typingIndicator) return;
    
    typingIndicator.classList.add('show');
    Utils.scrollToBottom();
    
    setTimeout(() => {
      typingIndicator.classList.remove('show');
    }, duration);
  }
  
  async function setMyTyping(isTyping) {
    if (!Auth.isLoggedIn()) return;
    try {
      await Database.setTyping(Auth.getCurrentUser().email, isTyping);
    } catch (e) {}
  }
  
  // ============ LISTEN TO MESSAGES ============
  
  function startListening() {
    stopListening();
    
    unsubscribeMessages = Database.listenToMessages(
      (messages, changes) => {
        renderMessages(messages);
        
        // Check for new messages from partner
        changes.forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.senderId !== Auth.getCurrentUser()?.uid) {
              handleNewMessage(data, change.doc.id);
            }
          }
        });
      },
      (error) => {
        console.error('Message listener error:', error);
      }
    );
  }
  
  function stopListening() {
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }
    if (unsubscribeTyping) {
      unsubscribeTyping();
      unsubscribeTyping = null;
    }
    if (unsubscribePresence) {
      unsubscribePresence();
      unsubscribePresence = null;
    }
  }
  
  // ============ HANDLE NEW MESSAGE ============
  
  function handleNewMessage(data, messageId) {
    // Check for emergency
    if (data.type === 'text') {
      const decoded = decodeMessage(data.text || '');
      EmergencySystem.checkMessage(decoded, data.senderEmail);
    }
    
    // If decoy mode is active, clear it
    if (DecoySystem.isActive()) {
      DecoySystem.clear(true);
    }
    
    // Update unread count if not in assistant section
    if (currentSection !== 'ai-assistant') {
      unreadCount++;
      Utils.updateBadge(unreadCount);
      
      // Show notification
      Utils.$('newMsgNotification')?.classList.add('show');
      
      // Browser notification
      if (document.hidden) {
        const preview = data.type === 'text' ? 
          Utils.truncate(decodeMessage(data.text || ''), 100) : 
          'Research attachment received';
        Utils.sendNotification('Research Response', preview, {
          requireInteraction: true
        });
      }
    }
    
    // Track in history
    if (data.type === 'text') {
      HistorySystem.addEntry('message', 'Message Received', 
        `From: ${data.senderEmail} - ${Utils.truncate(decodeMessage(data.text || ''), 60)}`,
        { direction: 'received', sender: data.senderEmail }
      );
    }
  }
  
  // ============ RENDER MESSAGES ============
  
  function renderMessages(messages) {
    const container = Utils.$('messagesContainer');
    if (!container) return;
    
    // Keep persistent messages
    const persistentMessages = container.querySelectorAll('.persistent-mock');
    container.innerHTML = '';
    persistentMessages.forEach(msg => container.appendChild(msg));
    
    let lastDate = '';
    
    messages.forEach((msg) => {
      // Skip expired self-destruct messages
      if (msg.selfDestruct && msg.expiresAt && msg.expiresAt.toMillis() < Date.now()) {
        return;
      }
      
      const msgDate = msg.timestamp?.toDate?.();
      if (msgDate) {
        const dateString = msgDate.toDateString();
        if (dateString !== lastDate) {
          lastDate = dateString;
          const dateDiv = document.createElement('div');
          dateDiv.className = 'date-divider';
          dateDiv.textContent = Utils.getDateLabel(dateString);
          container.appendChild(dateDiv);
        }
      }
      
      const isOwn = msg.senderId === Auth.getCurrentUser()?.uid;
      const div = document.createElement('div');
      div.className = `message-bubble ${isOwn ? 'own' : ''} ${msg.selfDestruct ? 'self-destruct' : ''} ${msg.isEmergency ? 'emergency-message' : ''}`;
      
      let label = isOwn ? '🧑‍🔬 Research Query' : '🤖 AI Research Analysis';
      if (msg.stealthMode) label += ' 🔒';
      if (msg.isAutoResponse) label += ' 🤖';
      if (msg.selfDestruct) label += ' ⏱️';
      
      let contentHtml = '';
      
      if (msg.type === 'image' && msg.imageUrl) {
        contentHtml = `<img src="${msg.imageUrl}" onclick="Utils.$('fullscreenOverlay').classList.add('active'); Utils.$('fullscreenImage').src='${msg.imageUrl}';" loading="lazy" alt="Research diagram">`;
      } else if (msg.type === 'voice' && msg.audioUrl) {
        contentHtml = `<audio controls src="${msg.audioUrl}" style="width:100%;height:30px;"></audio>`;
      } else {
        const displayText = msg.stealthMode && isOwn ? 
          Utils.sanitizeHTML(decodeMessage(msg.text || '')) : 
          Utils.sanitizeHTML(msg.text || '');
        contentHtml = displayText;
      }
      
      let metaHtml = `<span>${msgDate ? Utils.formatTime(msgDate) : ''}</span>`;
      if (isOwn && msg.seen) metaHtml += '<span class="seen-tick">✓✓</span>';
      else if (isOwn) metaHtml += '<span class="seen-tick single">✓</span>';
      if (msg.selfDestruct) metaHtml += ' <span class="destruct-icon">⏱️</span>';
      
      div.innerHTML = `
        <span class="msg-label">${label}</span>
        ${contentHtml}
        <div class="message-meta">${metaHtml}</div>
        <button class="bookmark-msg-btn" onclick="BookmarkSystem.addFromMessage('${Utils.sanitizeHTML(msg.text || '').substring(0, 100)}', '${msg.type}')" title="Bookmark">🔖</button>
      `;
      
      container.appendChild(div);
    });
    
    Utils.scrollToBottom();
  }
  
  // ============ LISTEN TO TYPING ============
  
  function startTypingListener() {
    if (unsubscribeTyping) unsubscribeTyping();
    
    const partnerEmail = Auth.getPartnerEmail();
    if (!partnerEmail) return;
    
    unsubscribeTyping = Database.listenToTyping(partnerEmail, (data) => {
      const typingIndicator = Utils.$('typingIndicator');
      if (typingIndicator) {
        if (data.isTyping) {
          typingIndicator.classList.add('show');
          Utils.scrollToBottom();
        } else {
          typingIndicator.classList.remove('show');
        }
      }
    });
  }
  
  // ============ LISTEN TO PRESENCE ============
  
  function startPresenceListener() {
    if (unsubscribePresence) unsubscribePresence();
    
    const partnerEmail = Auth.getPartnerEmail();
    if (!partnerEmail) {
      updatePartnerStatus(false);
      return;
    }
    
    unsubscribePresence = Database.listenToPresence(partnerEmail, (data) => {
      updatePartnerStatus(data.online);
    });
  }
  
  function updatePartnerStatus(online) {
    const dot = Utils.$('statusDot');
    const name = Utils.$('partnerDisplayName');
    
    if (dot) dot.className = online ? 'status-dot' : 'status-dot offline';
    if (name) name.textContent = online ? 'AI Online' : 'AI Offline';
  }
  
  // ============ IMAGE HANDLING ============
  
  async function handleImageUpload(file) {
    if (!file || !Auth.isLoggedIn()) return;
    
    if (!file.type.startsWith('image/')) {
      Utils.showToast('Only images allowed', 3000, 'error');
      return;
    }
    
    if (file.size > CONFIG.imgbb.maxSize) {
      Utils.showToast('Max 10MB', 3000, 'error');
      return;
    }
    
    // Show uploading indicator
    const container = Utils.$('messagesContainer');
    const tempDiv = document.createElement('div');
    tempDiv.className = 'message-bubble own';
    tempDiv.innerHTML = '<span class="msg-label">📤 Uploading Research Diagram...</span>';
    container.appendChild(tempDiv);
    Utils.scrollToBottom();
    
    try {
      const result = await Database.uploadImage(file);
      tempDiv.remove();
      
      await Database.sendMessage({
        type: 'image',
        imageUrl: result.url,
        deleteUrl: result.deleteUrl
      });
      
      HistorySystem.addEntry('message', 'Image Sent', 'Research diagram uploaded');
      XPSystem.addXP(20);
      
    } catch (e) {
      tempDiv.innerHTML = '<span style="color:#c6453a;">❌ Upload failed</span>';
      setTimeout(() => tempDiv.remove(), 2500);
    }
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    // Start listeners
    startListening();
    startTypingListener();
    startPresenceListener();
    
    // Input event listeners
    const messageInput = Utils.$('messageInput');
    const sendButton = Utils.$('sendButton');
    
    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      });
      
      // Typing indicator
      let typingTimeout;
      messageInput.addEventListener('input', () => {
        setMyTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setMyTyping(false), 2000);
      });
    }
    
    if (sendButton) {
      sendButton.addEventListener('click', () => send());
    }
    
    // File upload listeners
    Utils.$('fileInput')?.addEventListener('change', (e) => {
      handleImageUpload(e.target.files[0]);
      e.target.value = '';
    });
    
    Utils.$('cameraInput')?.addEventListener('change', (e) => {
      handleImageUpload(e.target.files[0]);
      e.target.value = '';
    });
    
    // Self-destruct toggle
    Utils.$('selfDestructToggle')?.addEventListener('click', toggleSelfDestruct);
    
    // Clear chat
    Utils.$('clearChatBtn')?.addEventListener('click', () => {
      Utils.$('deleteModal').classList.add('active');
    });
    
    Utils.$('cancelDeleteBtn')?.addEventListener('click', () => {
      Utils.$('deleteModal').classList.remove('active');
    });
    
    Utils.$('confirmDeleteBtn')?.addEventListener('click', async () => {
      Utils.$('confirmDeleteBtn').disabled = true;
      Utils.$('deleteProgress').textContent = 'Resetting...';
      
      try {
        await Database.deleteAllMessages();
        Utils.showToast('Session reset');
      } catch (e) {
        Utils.showToast('Error resetting', 3000, 'error');
      } finally {
        Utils.$('deleteModal').classList.remove('active');
        Utils.$('confirmDeleteBtn').disabled = false;
        Utils.$('deleteProgress').textContent = '';
      }
    });
    
    // Notification bell
    Utils.$('notificationBellBtn')?.addEventListener('click', () => {
      unreadCount = 0;
      Utils.updateBadge(0);
      lastReadTimestamp = firebase.firestore.Timestamp.now();
      App.navigateTo('ai-assistant');
    });
    
    // Request notification permission
    Utils.requestNotificationPermission();
  }
  
  // ============ SECTION TRACKING ============
  
  function setCurrentSection(section) {
    currentSection = section;
    
    if (section === 'ai-assistant') {
      Utils.$('newMsgNotification')?.classList.remove('show');
      lastReadTimestamp = firebase.firestore.Timestamp.now();
      unreadCount = 0;
      Utils.updateBadge(0);
    }
  }
  
  // ============ EXPORT ============
  
  return {
    send,
    toggleSelfDestruct,
    isSelfDestructMode,
    encodeMessage,
    decodeMessage,
    startListening,
    stopListening,
    setCurrentSection,
    handleImageUpload,
    initialize,
    getUnreadCount: () => unreadCount
  };
})();