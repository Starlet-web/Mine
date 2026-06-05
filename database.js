// ============ DATABASE MODULE ============
const Database = (function() {
  'use strict';
  
  // Initialize Firebase
  firebase.initializeApp(CONFIG.firebase);
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  // Enable offline persistence
  db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.log('Browser does not support persistence');
    }
  });
  
  // ============ MESSAGES COLLECTION ============
  
  // Send text message
  async function sendMessage(data) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const messageData = {
      type: data.type || 'text',
      text: data.text || '',
      senderId: auth.currentUser.uid,
      senderEmail: auth.currentUser.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      seen: false,
      selfDestruct: data.selfDestruct || false,
      stealthMode: data.stealthMode || false,
      isAutoResponse: data.isAutoResponse || false
    };
    
    // Add self-destruct expiry
    if (data.selfDestruct) {
      messageData.expiresAt = firebase.firestore.Timestamp.fromDate(
        new Date(Date.now() + CONFIG.message.selfDestructDuration * 1000)
      );
    }
    
    // Add image data
    if (data.type === 'image') {
      messageData.imageUrl = data.imageUrl;
      messageData.deleteUrl = data.deleteUrl;
    }
    
    // Add audio data
    if (data.type === 'voice') {
      messageData.audioUrl = data.audioUrl;
    }
    
    return await db.collection('messages').add(messageData);
  }
  
  // Listen to messages
  function listenToMessages(callback, onError) {
    return db.collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(messages, snapshot.docChanges());
      }, onError);
  }
  
  // Mark message as seen
  async function markAsSeen(messageIds) {
    if (!messageIds || messageIds.length === 0) return;
    
    const batch = db.batch();
    messageIds.forEach(id => {
      const ref = db.collection('messages').doc(id);
      batch.update(ref, { seen: true });
    });
    
    return await batch.commit();
  }
  
  // Delete messages
  async function deleteMessages(messageIds) {
    if (!messageIds || messageIds.length === 0) return;
    
    const batch = db.batch();
    messageIds.forEach(id => {
      const ref = db.collection('messages').doc(id);
      batch.delete(ref);
    });
    
    return await batch.commit();
  }
  
  // Delete all messages
  async function deleteAllMessages() {
    const snapshot = await db.collection('messages').get();
    if (snapshot.empty) return;
    
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return await batch.commit();
  }
  
  // Cleanup expired self-destruct messages
  async function cleanupExpiredMessages() {
    const now = firebase.firestore.Timestamp.now();
    const snapshot = await db.collection('messages')
      .where('expiresAt', '<=', now)
      .get();
    
    if (snapshot.empty) return;
    
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    return await batch.commit();
  }
  
  // ============ PRESENCE COLLECTION ============
  
  async function setPresence(email, online) {
    return await db.collection('presence').doc(email).set({
      email: email,
      online: online,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
  
  function listenToPresence(email, callback) {
    return db.collection('presence').doc(email).onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data());
      } else {
        callback({ online: false, email: email });
      }
    });
  }
  
  // ============ TYPING INDICATOR ============
  
  async function setTyping(email, isTyping) {
    return await db.collection('typing').doc(email).set({
      isTyping: isTyping,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
  
  function listenToTyping(email, callback) {
    return db.collection('typing').doc(email).onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data());
      } else {
        callback({ isTyping: false });
      }
    });
  }
  
  // ============ IMAGE UPLOAD (ImgBB) ============
  
  async function uploadImage(file) {
    // Compress image first
    const compressed = await compressImage(file);
    
    const formData = new FormData();
    formData.append('image', compressed);
    formData.append('key', CONFIG.imgbb.apiKey);
    
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        url: data.data.url,
        deleteUrl: data.data.delete_url,
        thumbnail: data.data.thumb?.url || data.data.url
      };
    }
    
    throw new Error('Image upload failed');
  }
  
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > CONFIG.imgbb.maxWidth) {
            height *= CONFIG.imgbb.maxWidth / width;
            width = CONFIG.imgbb.maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Compression failed'));
            }
          }, 'image/jpeg', 0.7);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // ============ CLEANUP ============
  
  // Run cleanup every 60 seconds
  setInterval(cleanupExpiredMessages, 60000);
  
  // Initial cleanup
  cleanupExpiredMessages();
  
  // ============ EXPORT ============
  
  return {
    db,
    sendMessage,
    listenToMessages,
    markAsSeen,
    deleteMessages,
    deleteAllMessages,
    cleanupExpiredMessages,
    setPresence,
    listenToPresence,
    setTyping,
    listenToTyping,
    uploadImage,
    compressImage
  };
})();