// ============ VOICE NOTE SYSTEM ============
const VoiceSystem = (function() {
  'use strict';
  
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingTimeout = null;
  
  // ============ TOGGLE RECORDING ============
  
  async function toggle() {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }
  
  async function startRecording() {
    if (!Auth.isLoggedIn()) {
      Utils.showToast('Please login first', 3000, 'error');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = handleRecordingStop;
      
      mediaRecorder.start(1000); // Collect data every second
      isRecording = true;
      
      // Update UI
      const voiceBtn = Utils.$('voiceBtn');
      if (voiceBtn) {
        voiceBtn.classList.add('recording');
        voiceBtn.textContent = '⏹️';
      }
      
      Utils.showToast('🎤 Recording research note...');
      
      // Auto-stop after max duration
      recordingTimeout = setTimeout(() => {
        if (isRecording) stopRecording();
      }, CONFIG.message.voiceMaxDuration);
      
      HistorySystem.addEntry('voice', 'Recording Started', 'Voice note recording initiated');
      
    } catch (err) {
      console.error('Recording error:', err);
      Utils.showToast('Microphone access denied', 3000, 'error');
    }
  }
  
  function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
    
    isRecording = false;
    clearTimeout(recordingTimeout);
    
    mediaRecorder.stop();
    
    // Stop all tracks
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    // Update UI
    const voiceBtn = Utils.$('voiceBtn');
    if (voiceBtn) {
      voiceBtn.classList.remove('recording');
      voiceBtn.textContent = '🎤';
    }
  }
  
  async function handleRecordingStop() {
    if (audioChunks.length === 0) return;
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Display voice note in chat
    displayVoiceNote(audioUrl);
    
    // Send to database
    try {
      await Database.sendMessage({
        type: 'voice',
        audioUrl: audioUrl
      });
      
      HistorySystem.addEntry('voice', 'Voice Note Sent', 'Voice recording sent');
      XPSystem.addXP(15);
      
    } catch (e) {
      Utils.showToast('Failed to send voice note', 3000, 'error');
    }
  }
  
  function displayVoiceNote(audioUrl) {
    const container = Utils.$('messagesContainer');
    const div = document.createElement('div');
    div.className = 'message-bubble own';
    div.innerHTML = `
      <span class="msg-label">🎤 Research Voice Note</span>
      <audio controls src="${audioUrl}" style="width:100%;height:30px;"></audio>
      <div class="message-meta">
        <span>${Utils.formatTime(new Date())}</span>
        <span class="seen-tick single">✓</span>
      </div>`;
    container.appendChild(div);
    Utils.scrollToBottom();
  }
  
  // ============ INITIALIZE ============
  
  function initialize() {
    Utils.$('voiceBtn')?.addEventListener('click', toggle);
    
    // Keyboard shortcut: Ctrl+Shift+V
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggle();
      }
    });
  }
  
  // ============ EXPORT ============
  
  return {
    toggle,
    startRecording,
    stopRecording,
    isRecording: () => isRecording,
    initialize
  };
})();