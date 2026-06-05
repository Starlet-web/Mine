// ============ AUTHENTICATION MODULE ============
const Auth = (function() {
  'use strict';
  
  let currentUser = null;
  let isLoginMode = true;
  let authStateListeners = [];
  
  // Initialize Firebase Auth
  const auth = firebase.auth();
  
  // Auth state observer
  auth.onAuthStateChanged(async (user) => {
    const wasLoggedIn = !!currentUser;
    currentUser = user;
    
    if (user) {
      // Verify allowed email
      if (!CONFIG.allowedEmails.includes(user.email)) {
        await auth.signOut();
        Utils.showToast('Unauthorized email address', 5000, 'error');
        return;
      }
      
      if (!wasLoggedIn) {
        // User just logged in
        await Database.setPresence(user.email, true);
        Utils.setStorage('lastLogin', new Date().toISOString());
        HistorySystem.addEntry('login', 'Portal Login', 'User logged into research portal');
      }
      
      // Notify listeners
      authStateListeners.forEach(listener => listener(user, 'login'));
    } else {
      if (wasLoggedIn) {
        // User logged out
        authStateListeners.forEach(listener => listener(null, 'logout'));
      }
      currentUser = null;
    }
  });
  
  // Get current user
  function getCurrentUser() {
    return currentUser;
  }
  
  // Check if logged in
  function isLoggedIn() {
    return !!currentUser;
  }
  
  // Get partner email
  function getPartnerEmail() {
    if (!currentUser) return null;
    return CONFIG.allowedEmails.find(e => e !== currentUser.email) || null;
  }
  
  // Login
  async function login(email, password) {
    if (!email || !password) {
      throw new Error('Please fill all fields');
    }
    
    try {
      await auth.signInWithEmailAndPassword(email.toLowerCase().trim(), password);
      return true;
    } catch (error) {
      let message = 'Authentication failed';
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Try again later';
          break;
      }
      throw new Error(message);
    }
  }
  
  // Register
  async function register(email, password) {
    if (!email || !password) {
      throw new Error('Please fill all fields');
    }
    
    if (!CONFIG.allowedEmails.includes(email.toLowerCase().trim())) {
      throw new Error('This email is not authorized for registration');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    try {
      await auth.createUserWithEmailAndPassword(email.toLowerCase().trim(), password);
      return true;
    } catch (error) {
      let message = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
      }
      throw new Error(message);
    }
  }
  
  // Logout
  async function logout() {
    if (currentUser) {
      try {
        await Database.setPresence(currentUser.email, false);
      } catch (e) {}
      await auth.signOut();
    }
  }
  
  // Toggle login/register mode
  function toggleMode() {
    isLoginMode = !isLoginMode;
    return isLoginMode;
  }
  
  function getMode() {
    return isLoginMode;
  }
  
  // Add auth state listener
  function onAuthStateChange(callback) {
    authStateListeners.push(callback);
    
    // Immediately call with current state
    if (currentUser !== undefined) {
      callback(currentUser, currentUser ? 'init' : 'init');
    }
  }
  
  // Remove auth state listener
  function removeAuthStateListener(callback) {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  }
  
  // Initialize UI handlers
  function initUI() {
    const authActionBtn = Utils.$('authActionBtn');
    const toggleAuthBtn = Utils.$('toggleAuthBtn');
    const emailInput = Utils.$('emailInput');
    const passwordInput = Utils.$('passwordInput');
    const authError = Utils.$('authError');
    
    async function handleAuth() {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      
      authError.textContent = '';
      authActionBtn.disabled = true;
      
      try {
        if (isLoginMode) {
          await login(email, password);
        } else {
          await register(email, password);
        }
      } catch (error) {
        authError.textContent = error.message;
      } finally {
        authActionBtn.disabled = false;
      }
    }
    
    authActionBtn.addEventListener('click', handleAuth);
    
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAuth();
    });
    
    toggleAuthBtn.addEventListener('click', () => {
      toggleMode();
      authActionBtn.textContent = isLoginMode ? 'Access Research Portal' : 'Register Scholar';
      toggleAuthBtn.textContent = isLoginMode ? 'New Scholar? Register' : 'Login instead';
      authError.textContent = '';
    });
    
    Utils.$('logoutButton').addEventListener('click', logout);
  }
  
  // Export public API
  return {
    getCurrentUser,
    isLoggedIn,
    getPartnerEmail,
    login,
    register,
    logout,
    toggleMode,
    getMode,
    onAuthStateChange,
    removeAuthStateListener,
    initUI
  };
})();