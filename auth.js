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
        try {
          await Database.setPresence(user.email, true);
        } catch(e) {}
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
      const result = await auth.signInWithEmailAndPassword(email.toLowerCase().trim(), password);
      console.log('Login successful:', result.user.email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
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
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        default:
          message = error.message;
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
      const result = await auth.createUserWithEmailAndPassword(email.toLowerCase().trim(), password);
      console.log('Registration successful:', result.user.email);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
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
        default:
          message = error.message;
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
    console.log('Initializing Auth UI...');
    
    const authActionBtn = Utils.$('authActionBtn');
    const toggleAuthBtn = Utils.$('toggleAuthBtn');
    const emailInput = Utils.$('emailInput');
    const passwordInput = Utils.$('passwordInput');
    const authError = Utils.$('authError');
    
    // Check if elements exist
    if (!authActionBtn) {
      console.error('Auth button not found!');
      return;
    }
    if (!emailInput) {
      console.error('Email input not found!');
      return;
    }
    if (!passwordInput) {
      console.error('Password input not found!');
      return;
    }
    
    console.log('Auth UI elements found successfully');
    
    async function handleAuth() {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      
      console.log('Attempting auth:', isLoginMode ? 'Login' : 'Register', email);
      
      if (authError) authError.textContent = '';
      authActionBtn.disabled = true;
      authActionBtn.textContent = 'Processing...';
      
      try {
        if (isLoginMode) {
          await login(email, password);
        } else {
          await register(email, password);
        }
        console.log('Auth successful!');
      } catch (error) {
        console.error('Auth failed:', error.message);
        if (authError) authError.textContent = error.message;
      } finally {
        authActionBtn.disabled = false;
        authActionBtn.textContent = isLoginMode ? 'Access Research Portal' : 'Register Scholar';
      }
    }
    
    // Remove old listeners by cloning
    const newBtn = authActionBtn.cloneNode(true);
    authActionBtn.parentNode.replaceChild(newBtn, authActionBtn);
    
    // Add click listener
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Auth button clicked!');
      handleAuth();
    });
    
    // Store reference back
    authActionBtn.id = 'authActionBtn';
    
    // Password enter key
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Enter pressed on password');
        handleAuth();
      }
    });
    
    // Toggle button
    if (toggleAuthBtn) {
      const newToggle = toggleAuthBtn.cloneNode(true);
      toggleAuthBtn.parentNode.replaceChild(newToggle, toggleAuthBtn);
      
      newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleMode();
        const btn = Utils.$('authActionBtn');
        if (btn) btn.textContent = isLoginMode ? 'Access Research Portal' : 'Register Scholar';
        this.textContent = isLoginMode ? 'New Scholar? Register' : 'Login instead';
        if (authError) authError.textContent = '';
      });
    }
    
    // Logout button
    const logoutBtn = Utils.$('logoutButton');
    if (logoutBtn) {
      const newLogout = logoutBtn.cloneNode(true);
      logoutBtn.parentNode.replaceChild(newLogout, logoutBtn);
      
      newLogout.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
    
    console.log('Auth UI initialized successfully');
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