const fs = require('fs');
const path = 'e:\\New project 2\\index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Add CSS for card headers, collapse, and avatar upload
const cssRegex = /(\.p-card h3 \{.*?\})/m;
const newCss = `.p-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--slate-100); padding-bottom: 12px; }
    .p-card-header h3 { margin-bottom: 0; font-size: 16px; font-weight: 800; color: var(--slate-800); }
    .p-card-actions { display: flex; gap: 8px; }
    .p-card-btn { background: var(--purple-50); color: var(--purple-700); border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .p-card-btn:hover { background: var(--purple-100); transform: scale(1.05); }
    .p-card-body { transition: max-height 0.3s ease, opacity 0.3s ease; overflow: hidden; opacity: 1; max-height: 2000px; }
    .p-card.collapsed .p-card-body { max-height: 0; opacity: 0; margin-top: -10px; }
    .p-card.collapsed .p-card-header { border-bottom: none; margin-bottom: 0; }
    .avatar-upload-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 20px; }
    .avatar-preview { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--purple-100); }`;
content = content.replace(cssRegex, newCss);


// 2. Add Modal Upload UI
const modalRegex = /<div class="modal-header">\s*<i class="fa-solid fa-user-pen"><\/i> প্রোফাইল সম্পাদনা\s*<\/div>\s*<div style="max-height: 60vh; overflow-y: auto; padding-right: 10px; margin-bottom: 20px;">\s*<input type="hidden" id="editProfId">/m;
const newModal = `<div class="modal-header">
        <i class="fa-solid fa-user-pen"></i> প্রোফাইল সম্পাদনা
      </div>
      
      <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px; margin-bottom: 20px;">
        <div class="avatar-upload-wrap">
          <img src="" id="epAvatarPreview" class="avatar-preview">
          <div class="btn btn-sm btn-outline-primary" style="position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-camera"></i> ছবি পরিবর্তন করুন
            <input type="file" id="epAvatarInput" accept="image/*" onchange="previewAvatar(this)" style="position: absolute; top: 0; right: 0; min-width: 100%; min-height: 100%; opacity: 0; cursor: pointer;">
          </div>
        </div>
        <input type="hidden" id="editProfId">`;
content = content.replace(modalRegex, newModal);


// 3. Update loadProfile and add new JS functions
const jsRegex = /function loadProfile\(userId\) \{(.|\n)*?function viewProfile\(userId\) \{/m;
const newJs = `let currentAvatarBase64 = null;

    function previewAvatar(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('epAvatarPreview').src = e.target.result;
          currentAvatarBase64 = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
      }
    }

    function toggleCard(cardId) {
      const card = document.getElementById(cardId);
      if (!card) return;
      const isCollapsed = card.classList.toggle('collapsed');
      const icon = card.querySelector('.fa-minus, .fa-plus');
      if (icon) {
        icon.className = isCollapsed ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
      }
    }

    function loadProfile(userId) {
      const users = DB.get('users') || [];
      const user = userId ? users.find(u => u.id === userId) : currentUser;
      if (!user) return;

      const isAdmin = currentUser?.role === 'admin';
      const isSelf = user.id === currentUser?.id;

      // Status colors
      const isStatusActive = (user.status || 'কর্মরত') === 'কর্মরত';
      const isJobTemp = (user.jobType || 'স্থায়ী') !== 'স্থায়ী';

      document.getElementById('profileHeaderArea').innerHTML = \`
        <div class="profile-hero">
          <div class="profile-hero-left">
            <img src="\${getAvatar(user)}" alt="\${user.name}">
            <div class="profile-hero-info">
              <h2>\${user.name}</h2>
              <div class="p-role">\${user.designation || getUserTypeName(user.role)}</div>
              <div class="p-detail"><i class="fa-solid fa-id-badge"></i> কর্মী আইডি: \${user.empId || '—'}</div>
              <div class="p-detail"><i class="fa-solid fa-envelope"></i> ই-মেইল: \${user.email || '—'}</div>
              <div class="p-detail"><i class="fa-solid fa-phone"></i> মোবাইল: \${user.phone || '—'}</div>
              <div class="p-detail"><i class="fa-solid fa-calendar-day"></i> জয়েনের তারিখ: \${user.joinDate || '—'}</div>
              <div class="p-detail">
                <i class="fa-solid fa-briefcase"></i> চাকরির অবস্থা: 
                <span class="badge \${isJobTemp ? 'badge-amber' : 'badge-green'}" style="margin-left:4px; font-size:10px">\${user.jobType || 'স্থায়ী'}</span>
              </div>
            </div>
          </div>
          <div class="profile-hero-right">
            <div class="p-right-item">
              <i class="fa-regular fa-user"></i>
              <div><span>বিভাগ</span><strong>\${user.department || '—'}</strong></div>
            </div>
            <div class="p-right-item">
              <i class="fa-regular fa-id-card"></i>
              <div><span>পদবি</span><strong>\${user.designation || '—'}</strong></div>
            </div>
            <div class="p-right-item">
              <i class="fa-solid fa-location-dot"></i>
              <div><span>কর্মস্থল</span><strong>\${user.workplace || '—'}</strong></div>
            </div>
            <div class="p-right-item">
              <i class="fa-solid fa-user-tie"></i>
              <div><span>রিপোর্টিং টু</span><strong>\${user.reportTo || '—'}</strong></div>
            </div>
          </div>
        </div>
      \`;

      const editBtn = (isAdmin || isSelf) ? \`<button class="p-card-btn" onclick="openEditProfileModal('\${user.id}')" title="সম্পাদনা"><i class="fa-solid fa-pen"></i></button>\` : '';

      // Define tab contents
      const tPersonal = \`
        <div class="p-grid">
          <div class="p-card" id="card-p1">
            <div class="p-card-header">
              <h3>ব্যক্তিগত তথ্য</h3>
              <div class="p-card-actions">
                \${editBtn}
                <button class="p-card-btn" onclick="toggleCard('card-p1')" title="লুকান/দেখান"><i class="fa-solid fa-minus"></i></button>
              </div>
            </div>
            <div class="p-card-body">
              <table class="p-table">
                <tr><td>পূর্ণ নাম</td><td>\${user.name || '—'}</td></tr>
                <tr><td>পিতার নাম</td><td>\${user.fname || '—'}</td></tr>
                <tr><td>মাতার নাম</td><td>\${user.mname || '—'}</td></tr>
                <tr><td>জন্ম তারিখ</td><td>\${user.dob || '—'}</td></tr>
                <tr><td>লিঙ্গ</td><td>\${user.gender || '—'}</td></tr>
                <tr><td>রক্তের গ্রুপ</td><td>\${user.bloodGroup || '—'}</td></tr>
                <tr><td>বৈবাহিক অবস্থা</td><td>\${user.marital || '—'}</td></tr>
                <tr><td>জাতীয়তা</td><td>\${user.nationality || 'বাংলাদেশী'}</td></tr>
                <tr><td>ধর্ম</td><td>\${user.religion || '—'}</td></tr>
                <tr><td>স্থায়ী ঠিকানা</td><td>\${user.address || '—'}</td></tr>
              </table>
            </div>
          </div>
          <div class="p-card" id="card-p2">
            <div class="p-card-header">
              <h3>যোগাযোগ তথ্য</h3>
              <div class="p-card-actions">
                \${editBtn}
                <button class="p-card-btn" onclick="toggleCard('card-p2')" title="লুকান/দেখান"><i class="fa-solid fa-minus"></i></button>
              </div>
            </div>
            <div class="p-card-body">
              <table class="p-table">
                <tr><td>ই-মেইল</td><td>\${user.email || '—'}</td></tr>
                <tr><td>মোবাইল</td><td>\${user.phone || '—'}</td></tr>
                <tr><td>বিকল্প/বিকাশ</td><td>\${user.altPhone || '—'}</td></tr>
              </table>
            </div>
          </div>
        </div>
      \`;

      const tJob = \`
        <div class="p-grid">
          <div class="p-card" id="card-j1">
            <div class="p-card-header">
              <h3>চাকরির তথ্য</h3>
              <div class="p-card-actions">
                \${editBtn}
                <button class="p-card-btn" onclick="toggleCard('card-j1')" title="লুকান/দেখান"><i class="fa-solid fa-minus"></i></button>
              </div>
            </div>
            <div class="p-card-body">
              <table class="p-table">
                <tr><td>কর্মী আইডি</td><td>\${user.empId || '—'}</td></tr>
                <tr><td>বিভাগ</td><td>\${user.department || '—'}</td></tr>
                <tr><td>পদবি</td><td>\${user.designation || '—'}</td></tr>
                <tr><td>জয়েনের তারিখ</td><td>\${user.joinDate || '—'}</td></tr>
                <tr><td>চাকরির ধরন</td><td>\${user.jobType || 'স্থায়ী'}</td></tr>
                <tr><td>কর্মস্থল</td><td>\${user.workplace || '—'}</td></tr>
                <tr><td>রিপোর্টিং টু</td><td>\${user.reportTo || '—'}</td></tr>
                <tr><td>বেতন গ্রেড</td><td>\${user.grade || '—'}</td></tr>
                <tr><td>কর্মরত অবস্থা</td><td><span class="badge \${isStatusActive ? 'badge-green' : 'badge-red'}">\${user.status || 'কর্মরত'}</span></td></tr>
              </table>
            </div>
          </div>
        </div>
      \`;

      const tBank = \`
        <div class="p-grid">
          <div class="p-card" id="card-b1">
            <div class="p-card-header">
              <h3>ব্যাংক তথ্য</h3>
              <div class="p-card-actions">
                \${editBtn}
                <button class="p-card-btn" onclick="toggleCard('card-b1')" title="লুকান/দেখান"><i class="fa-solid fa-minus"></i></button>
              </div>
            </div>
            <div class="p-card-body">
              <table class="p-table">
                <tr><td>ব্যাংকের নাম</td><td>\${user.bankName || '—'}</td></tr>
                <tr><td>অ্যাকাউন্ট নাম্বার</td><td>\${user.bankAcc || '—'}</td></tr>
                <tr><td>রাউটিং নাম্বার</td><td>\${user.bankRouting || '—'}</td></tr>
                <tr><td>শাখা</td><td>\${user.bankBranch || '—'}</td></tr>
              </table>
            </div>
          </div>
        </div>
      \`;

      const tEmpty = (icon, msg) => \`
        <div class="empty-state" style="margin-top:40px">
          <i class="fa-solid \${icon}"></i>
          <h3>\${msg}</h3>
          <p>এই ফিচারটি শীঘ্রই আসছে</p>
        </div>
      \`;

      // Store tab contents globally to switch easily
      window._profileTabs = {
        'p-personal': tPersonal,
        'p-job': tJob,
        'p-bank': tBank,
        'p-edu': tEmpty('fa-graduation-cap', 'শিক্ষাগত যোগ্যতার তথ্য নেই'),
        'p-docs': tEmpty('fa-file-lines', 'কোনো ডকুমেন্টস নেই')
      };

      // Ensure active tab defaults to personal
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      const defaultTab = document.querySelector('.profile-tab');
      if (defaultTab) defaultTab.classList.add('active');
      document.getElementById('profileContentArea').innerHTML = \`<div class="profile-content-section active">\${tPersonal}</div>\`;
    }

    function switchProfileTab(tabId) {
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      event.currentTarget.classList.add('active');
      
      const contentHtml = window._profileTabs ? window._profileTabs[tabId] : '';
      document.getElementById('profileContentArea').innerHTML = \`<div class="profile-content-section active">\${contentHtml}</div>\`;
    }

    function openEditProfileModal(userId) {
      const users = DB.get('users') || [];
      const user = users.find(u => u.id === userId);
      if (!user) return;

      document.getElementById('editProfId').value = user.id;
      
      currentAvatarBase64 = user.photo || null;
      document.getElementById('epAvatarPreview').src = getAvatar(user);
      document.getElementById('epAvatarInput').value = '';

      // Basic / Job
      document.getElementById('epName').value = user.name || '';
      document.getElementById('epEmail').value = user.email || '';
      document.getElementById('epEmpId').value = user.empId || '';
      document.getElementById('epPhone').value = user.phone || '';
      document.getElementById('epDept').value = user.department || '';
      document.getElementById('epDesig').value = user.designation || '';
      document.getElementById('epReportTo').value = user.reportTo || '';
      document.getElementById('epWorkplace').value = user.workplace || '';
      document.getElementById('epJoinDate').value = user.joinDate || '';
      document.getElementById('epJobType').value = user.jobType || 'স্থায়ী';
      document.getElementById('epGrade').value = user.grade || '';
      document.getElementById('epStatus').value = user.status || 'কর্মরত';

      // Personal
      document.getElementById('epFName').value = user.fname || '';
      document.getElementById('epMName').value = user.mname || '';
      document.getElementById('epDOB').value = user.dob || '';
      document.getElementById('epGender').value = user.gender || 'পুরুষ';
      document.getElementById('epBlood').value = user.bloodGroup || '';
      document.getElementById('epMarital').value = user.marital || 'অবিবাহিত';
      document.getElementById('epNationality').value = user.nationality || 'বাংলাদেশী';
      document.getElementById('epReligion').value = user.religion || '';
      document.getElementById('epAddress').value = user.address || '';
      document.getElementById('epAltPhone').value = user.altPhone || '';

      // Bank
      document.getElementById('epBankName').value = user.bankName || '';
      document.getElementById('epBankAcc').value = user.bankAcc || '';
      document.getElementById('epBankRouting').value = user.bankRouting || '';
      document.getElementById('epBankBranch').value = user.bankBranch || '';

      openModal('editProfileModal');
    }

    function saveEditedProfile() {
      const userId = document.getElementById('editProfId').value;
      const users = DB.get('users') || [];
      const uIndex = users.findIndex(u => u.id === userId);
      if (uIndex === -1) return;

      const user = users[uIndex];

      if (currentAvatarBase64) {
        user.photo = currentAvatarBase64;
      }

      user.name = document.getElementById('epName').value;
      user.email = document.getElementById('epEmail').value;
      user.empId = document.getElementById('epEmpId').value;
      user.phone = document.getElementById('epPhone').value;
      user.department = document.getElementById('epDept').value;
      user.designation = document.getElementById('epDesig').value;
      user.reportTo = document.getElementById('epReportTo').value;
      user.workplace = document.getElementById('epWorkplace').value;
      user.joinDate = document.getElementById('epJoinDate').value;
      user.jobType = document.getElementById('epJobType').value;
      user.grade = document.getElementById('epGrade').value;
      user.status = document.getElementById('epStatus').value;

      user.fname = document.getElementById('epFName').value;
      user.mname = document.getElementById('epMName').value;
      user.dob = document.getElementById('epDOB').value;
      user.gender = document.getElementById('epGender').value;
      user.bloodGroup = document.getElementById('epBlood').value;
      user.marital = document.getElementById('epMarital').value;
      user.nationality = document.getElementById('epNationality').value;
      user.religion = document.getElementById('epReligion').value;
      user.address = document.getElementById('epAddress').value;
      user.altPhone = document.getElementById('epAltPhone').value;

      user.bankName = document.getElementById('epBankName').value;
      user.bankAcc = document.getElementById('epBankAcc').value;
      user.bankRouting = document.getElementById('epBankRouting').value;
      user.bankBranch = document.getElementById('epBankBranch').value;

      users[uIndex] = user;
      DB.set('users', users);
      
      if (currentUser?.id === userId) {
        currentUser = user;
        sessionStorage.setItem('odms_me', JSON.stringify(currentUser));
        updateSidebarUser();
      }

      closeModal('editProfileModal');
      showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      loadProfile(userId);
    }

    function viewProfile(userId) {`;

content = content.replace(jsRegex, newJs);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully applied UI fixes for edit button, collapsible cards, and avatar upload.');
