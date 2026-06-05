// ============ APPLICATION CONFIGURATION ============
const CONFIG = {
  // Firebase Configuration - आपका अपना
  firebase: {
    apiKey: "AIzaSyDS0rzCKglHblF2dlFEKE-ouV0yOu0z5UM",
    authDomain: "mine-a1e68.firebaseapp.com",
    projectId: "mine-a1e68",
    storageBucket: "mine-a1e68.firebasestorage.app",
    messagingSenderId: "48499757892",
    appId: "1:48499757892:web:d0fd281ab0df945e893d11"
  },
  
  // Image Upload - आपका अपना
  imgbb: {
    apiKey: "53fb01955a45c5462724b8f7d238500a",
    maxSize: 10 * 1024 * 1024,
    maxWidth: 800
  },
  
  // Allowed Users - आपकी emails
  allowedEmails: ["mgbhaukali@gmail.com", "manshi@gmail.com"],
  
  // Message Settings
  message: {
    selfDestructDuration: 300,
    maxMessageLength: 5000,
    voiceMaxDuration: 60000
  },
  
  // History Settings
  history: {
    maxItems: 500,
    retentionDays: 90,
    fakeHistoryCount: 50
  },
  
  // Network Disguise
  network: {
    wifiNames: [
      'NTA-Secure-Network',
      'CSIR-Research-WiFi',
      'NTA-Examination-Network',
      'CSIR-UGC-NET-Portal',
      'NTA-Academic-Server',
      'Research-Lab-Network'
    ],
    defaultName: 'NTA-Secure-Network',
    defaultSpeed: '100 Mbps',
    defaultSignal: 4,
    updateInterval: 30000
  },
  
  // Emergency Settings
  emergency: {
    keywords: [
      'what is', 'what are', "what's", 'whats',
      'who is', 'where is', 'when is', 'how to',
      'explain', 'meaning', 'define', 'urgent',
      'help', 'emergency', 'quick', 'asap'
    ],
    alertDuration: 30000,
    autoResponseDelay: 2000
  },
  
  // Stealth Mode
  stealth: {
    decoyTopics: ['molecular', 'ecology', 'genetics', 'biochemistry', 'immunology', 'physiology'],
    defaultTopic: 'molecular'
  },
  
  // Content
  quiz: {
    timeLimit: 900,
    questionCount: 15
  }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.firebase);
Object.freeze(CONFIG.imgbb);