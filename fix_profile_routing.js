const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// 1. Fix navigate
const navStart = c.indexOf('function navigate(page) {');
const navEnd = c.indexOf('function refreshPage(page) {');
if (navStart > -1 && navEnd > -1) {
    let navStr = c.substring(navStart, navEnd);
    // If navigating to profile directly (not via viewProfile), reset currentProfileView
    navStr = navStr.replace('currentPage = page;', `
      if (page === 'profile' && !window._isViewProfileCall) {
         window.currentProfileView = null;
      }
      window._isViewProfileCall = false;
      currentPage = page;`);
    c = c.substring(0, navStart) + navStr + c.substring(navEnd);
}

// 2. Fix refreshPage
const refStart = c.indexOf('function refreshPage(page) {');
const refEnd = c.indexOf('function refreshUI() {');
if (refStart > -1 && refEnd > -1) {
    let refStr = c.substring(refStart, refEnd);
    refStr = refStr.replace("case 'profile': loadProfile(); break;", "case 'profile': loadProfile(window.currentProfileView || currentUser?.id); break;");
    c = c.substring(0, refStart) + refStr + c.substring(refEnd);
}

// 3. Fix viewProfile
const vpStart = c.indexOf('function viewProfile(userId) {');
const vpEnd = c.indexOf('function updateBadges() {');
if (vpStart > -1 && vpEnd > -1) {
    let vpStr = c.substring(vpStart, vpEnd);
    vpStr = `function viewProfile(userId) {
      window.currentProfileView = userId;
      window._isViewProfileCall = true;
      navigate('profile');
    }

    // ═══════════════════════════════════════════════════════════
    // BADGES
    // ═══════════════════════════════════════════════════════════
    `;
    c = c.substring(0, vpStart) + vpStr + c.substring(vpEnd);
}

// 4. Update photo upload logic to DEFINITELY update the DB and UI!
// Let's check saveEditedProfile again.
// In saveEditedProfile, we use `currentAvatarBase64`.
const sepStart = c.indexOf('if (currentAvatarBase64) {');
if (sepStart > -1) {
    // We must ensure that we CLEAR currentAvatarBase64 when opening the modal
    const openMod = c.indexOf("document.getElementById('epAvatarInput').value = '';");
    if (openMod > -1) {
        c = c.replace("document.getElementById('epAvatarInput').value = '';", "document.getElementById('epAvatarInput').value = '';\n      currentAvatarBase64 = null;");
    }
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log("Fixed profile view routing and photo upload variables!");
