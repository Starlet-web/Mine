// ============ XP & ACHIEVEMENT SYSTEM ============
const XPSystem = (function() {
  'use strict';
  
  let studyXP = 0;
  let studyStreak = 0;
  let lastStudyDate = null;
  
  // ============ INITIALIZE ============
  
  function initialize() {
    studyXP = Utils.getStorage('studyXP', 0);
    studyStreak = Utils.getStorage('studyStreak', 0);
    lastStudyDate = Utils.getStorage('lastStudyDate', null);
    
    updateDisplay();
  }
  
  // ============ ADD XP ============
  
  function addXP(points) {
    studyXP += points;
    Utils.setStorage('studyXP', studyXP);
    updateStreak();
    updateDisplay();
    checkAchievements();
  }
  
  // ============ STREAK ============
  
  function updateStreak() {
    const today = new Date().toDateString();
    
    if (lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (lastStudyDate === yesterday) {
        studyStreak++;
      } else {
        studyStreak = 1;
      }
      
      lastStudyDate = today;
      Utils.setStorage('studyStreak', studyStreak);
      Utils.setStorage('lastStudyDate', today);
    }
  }
  
  // ============ DISPLAY ============
  
  function updateDisplay() {
    const display = Utils.$('studyStreakDisplay');
    if (display) {
      display.textContent = `🔥 Streak: ${studyStreak} | XP: ${studyXP}`;
    }
  }
  
  // ============ ACHIEVEMENTS ============
  
  function checkAchievements() {
    const badges = [];
    
    if (studyStreak >= 7) badges.push('🔥 7-Day Streak');
    if (studyStreak >= 30) badges.push('👑 Monthly Warrior');
    if (studyStreak >= 100) badges.push('💎 Centurion');
    if (studyXP >= 500) badges.push('📚 Scholar');
    if (studyXP >= 1000) badges.push('🎓 Research Scholar');
    if (studyXP >= 5000) badges.push('🧬 PhD Candidate');
    if (studyXP >= 10000) badges.push('🏆 Nobel Laureate');
    
    badges.forEach(badge => {
      const key = `badge_${badge}`;
      if (!Utils.getStorage(key, false)) {
        Utils.setStorage(key, true);
        Utils.showToast(`🏅 Achievement Unlocked: ${badge}`, 5000);
        HistorySystem.addEntry('achievement', 'Achievement Unlocked', badge);
      }
    });
  }
  
  function getAchievements() {
    const badges = [
      '🔥 7-Day Streak', '👑 Monthly Warrior', '💎 Centurion',
      '📚 Scholar', '🎓 Research Scholar', '🧬 PhD Candidate', '🏆 Nobel Laureate'
    ];
    
    return badges.filter(badge => Utils.getStorage(`badge_${badge}`, false));
  }
  
  // ============ EXPORT ============
  
  return {
    initialize,
    addXP,
    getXP: () => studyXP,
    getStreak: () => studyStreak,
    getAchievements,
    updateDisplay
  };
})();