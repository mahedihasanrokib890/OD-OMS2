const fs = require('fs');

const path = 'e:\\New project 2\\index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace CSS Profile View
const cssRegex = /\/\* Profile View \*\/(.|\n)*?@media\(max-width:768px\)\s*\{\s*\.profile-hero\s*\{\s*flex-direction:\s*column;\s*text-align:\s*center;\s*\}\s*\.profile-tags\s*\{\s*justify-content:\s*center;\s*\}\s*\}/m;

const newCss = `/* Profile View */
    .profile-hero {
      background: white; border-radius: var(--radius-lg); padding: 32px;
      border: 1px solid var(--border); margin-bottom: 0; box-shadow: var(--shadow-card);
      position: relative; overflow: hidden; display: flex; gap: 30px; justify-content: space-between;
    }
    .profile-hero::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, var(--purple-600), var(--pink-500));
    }
    .profile-hero-left { display: flex; gap: 24px; flex: 1; }
    .profile-hero img {
      width: 140px; height: 140px; border-radius: 20px; object-fit: cover;
      border: 4px solid var(--purple-100); flex-shrink: 0;
    }
    .profile-hero-info h2 { font-size: 24px; font-weight: 900; color: var(--slate-800); margin-bottom: 2px; }
    .profile-hero-info .p-role { color: var(--purple-600); font-weight: 700; font-size: 15px; margin-bottom: 12px; }
    .profile-hero-info .p-detail { font-size: 13px; color: var(--slate-600); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .profile-hero-info .p-detail i { color: var(--purple-400); width: 16px; text-align: center; }
    
    .profile-hero-right {
      min-width: 280px; padding-left: 30px; border-left: 1px solid var(--slate-100);
      display: flex; flex-direction: column; gap: 16px; justify-content: center;
    }
    .p-right-item { display: flex; align-items: start; gap: 12px; }
    .p-right-item i { font-size: 18px; color: var(--slate-400); margin-top: 2px; }
    .p-right-item div span { display: block; font-size: 11px; color: var(--slate-400); font-weight: 700; text-transform: uppercase; }
    .p-right-item div strong { display: block; font-size: 13px; color: var(--slate-800); font-weight: 700; }

    .profile-edit-btn { position: absolute; top: 20px; right: 20px; }

    .profile-tabs {
      display: flex; gap: 24px; margin-top: 16px; padding: 0 10px;
      border-bottom: 2px solid var(--border); overflow-x: auto;
    }
    .profile-tab {
      padding: 14px 4px; font-size: 14px; font-weight: 700; color: var(--slate-500);
      cursor: pointer; position: relative; transition: all 0.2s; white-space: nowrap;
      display: flex; align-items: center; gap: 8px;
    }
    .profile-tab i { font-size: 15px; }
    .profile-tab:hover { color: var(--purple-600); }
    .profile-tab.active { color: var(--purple-700); }
    .profile-tab.active::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px;
      background: var(--purple-700); border-radius: 3px 3px 0 0;
    }

    .profile-content-section { display: none; padding: 24px 0; }
    .profile-content-section.active { display: block; animation: fadeIn 0.4s ease; }
    
    .p-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; }
    .p-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 24px; }
    .p-card h3 { font-size: 16px; font-weight: 800; color: var(--slate-800); margin-bottom: 20px; border-bottom: 1px solid var(--slate-100); padding-bottom: 12px; }
    .p-table { width: 100%; border-collapse: collapse; }
    .p-table td { padding: 10px 0; border-bottom: 1px dashed var(--slate-100); font-size: 13px; }
    .p-table tr:last-child td { border-bottom: none; }
    .p-table td:first-child { color: var(--slate-500); font-weight: 600; width: 40%; }
    .p-table td:last-child { color: var(--slate-800); font-weight: 700; }

    @media(max-width:992px) {
      .profile-hero { flex-direction: column; }
      .profile-hero-right { border-left: none; padding-left: 0; border-top: 1px solid var(--slate-100); padding-top: 20px; }
    }
    @media(max-width:768px) {
      .profile-hero-left { flex-direction: column; align-items: center; text-align: center; }
      .profile-hero-info .p-detail { justify-content: center; }
      .profile-edit-btn { position: relative; top: 0; right: 0; margin-top: 16px; width: 100%; }
    }`;

content = content.replace(cssRegex, newCss);

// 2. Replace HTML Profile View
const htmlRegex = /<!-- ═══ PROFILE ═══ -->\s*<div class="page-section" id="page-profile">\s*<div class="profile-hero" id="profileHero">\s*<!-- Dynamically filled -->\s*<\/div>\s*<div class="card" id="profileDetails">\s*<!-- Dynamically filled -->\s*<\/div>\s*<\/div>/m;

const newHtml = `<!-- ═══ PROFILE ═══ -->
        <div class="page-section" id="page-profile">
          <div id="profileHeaderArea"></div>
          <div class="profile-tabs" id="profileTabs">
            <div class="profile-tab active" onclick="switchProfileTab('p-personal')"><i class="fa-regular fa-user"></i> ব্যক্তিগত তথ্য</div>
            <div class="profile-tab" onclick="switchProfileTab('p-job')"><i class="fa-solid fa-briefcase"></i> চাকরি তথ্য</div>
            <div class="profile-tab" onclick="switchProfileTab('p-bank')"><i class="fa-solid fa-building-columns"></i> ব্যাংক তথ্য</div>
            <div class="profile-tab" onclick="switchProfileTab('p-edu')"><i class="fa-solid fa-graduation-cap"></i> শিক্ষাগত যোগ্যতা</div>
            <div class="profile-tab" onclick="switchProfileTab('p-docs')"><i class="fa-solid fa-file-lines"></i> ডকুমেন্টস</div>
          </div>
          <div id="profileContentArea"></div>
        </div>`;

content = content.replace(htmlRegex, newHtml);

// 3. Inject Modal
const modalTarget = `<!-- ═══ MODALS ═══ -->`;
const newModal = `<!-- ═══ MODALS ═══ -->

  <!-- Edit Profile Modal -->
  <div class="modal-overlay hidden" id="editProfileModal">
    <div class="modal-card" style="width: 800px; max-width: 95vw;">
      <button class="modal-close" onclick="closeModal('editProfileModal')"><i class="fa-solid fa-xmark"></i></button>
      <div class="modal-header">
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
        <input type="hidden" id="editProfId">
        
        <h4 style="color:var(--purple-700); margin-bottom: 15px; border-bottom: 1px solid var(--slate-100); padding-bottom: 5px;">মৌলিক ও চাকরির তথ্য</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group"><label>পূর্ণ নাম</label><input type="text" class="form-input" id="epName"></div>
          <div class="form-group"><label>ইমেইল</label><input type="email" class="form-input" id="epEmail"></div>
          <div class="form-group"><label>কর্মী আইডি</label><input type="text" class="form-input" id="epEmpId" placeholder="যেমন: EXT-EMP-2024"></div>
          <div class="form-group"><label>মোবাইল</label><input type="text" class="form-input" id="epPhone"></div>
          <div class="form-group"><label>বিভাগ (Department)</label><input type="text" class="form-input" id="epDept"></div>
          <div class="form-group"><label>পদবি (Designation)</label><input type="text" class="form-input" id="epDesig"></div>
          <div class="form-group"><label>রিপোর্টিং টু</label><input type="text" class="form-input" id="epReportTo"></div>
          <div class="form-group"><label>কর্মস্থল (Workplace)</label><input type="text" class="form-input" id="epWorkplace"></div>
          <div class="form-group"><label>জয়েনের তারিখ</label><input type="date" class="form-input" id="epJoinDate"></div>
          <div class="form-group">
            <label>চাকরির ধরন</label>
            <select class="form-select" id="epJobType">
              <option value="স্থায়ী">স্থায়ী (Permanent)</option>
              <option value="অস্থায়ী">অস্থায়ী (Contractual)</option>
              <option value="প্রবেশনারি">প্রবেশনারি (Probation)</option>
              <option value="ইন্টার্ন">ইন্টার্ন (Intern)</option>
            </select>
          </div>
          <div class="form-group"><label>বেতন গ্রেড</label><input type="text" class="form-input" id="epGrade"></div>
          <div class="form-group">
            <label>কর্মরত অবস্থা</label>
            <select class="form-select" id="epStatus">
              <option value="কর্মরত">কর্মরত (Active)</option>
              <option value="পদত্যাগ করেছেন">পদত্যাগ করেছেন (Resigned)</option>
            </select>
          </div>
        </div>

        <h4 style="color:var(--purple-700); margin: 20px 0 15px; border-bottom: 1px solid var(--slate-100); padding-bottom: 5px;">ব্যক্তিগত তথ্য</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group"><label>পিতার নাম</label><input type="text" class="form-input" id="epFName"></div>
          <div class="form-group"><label>মাতার নাম</label><input type="text" class="form-input" id="epMName"></div>
          <div class="form-group"><label>জন্ম তারিখ</label><input type="date" class="form-input" id="epDOB"></div>
          <div class="form-group">
            <label>লিঙ্গ</label>
            <select class="form-select" id="epGender">
              <option value="পুরুষ">পুরুষ</option>
              <option value="নারী">নারী</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
          <div class="form-group"><label>রক্তের গ্রুপ</label><input type="text" class="form-input" id="epBlood"></div>
          <div class="form-group">
            <label>বৈবাহিক অবস্থা</label>
            <select class="form-select" id="epMarital">
              <option value="অবিবাহিত">অবিবাহিত</option>
              <option value="বিবাহিত">বিবাহিত</option>
            </select>
          </div>
          <div class="form-group"><label>জাতীয়তা</label><input type="text" class="form-input" id="epNationality" value="বাংলাদেশী"></div>
          <div class="form-group"><label>ধর্ম</label><input type="text" class="form-input" id="epReligion"></div>
          <div class="form-group" style="grid-column: 1 / -1;"><label>স্থায়ী ঠিকানা</label><textarea class="form-input" id="epAddress" rows="2"></textarea></div>
          <div class="form-group"><label>বিকল্প মোবাইল / বিকাশ</label><input type="text" class="form-input" id="epAltPhone"></div>
        </div>

        <h4 style="color:var(--purple-700); margin: 20px 0 15px; border-bottom: 1px solid var(--slate-100); padding-bottom: 5px;">ব্যাংক তথ্য</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group"><label>ব্যাংকের নাম</label><input type="text" class="form-input" id="epBankName"></div>
          <div class="form-group"><label>অ্যাকাউন্ট নাম্বার</label><input type="text" class="form-input" id="epBankAcc"></div>
          <div class="form-group"><label>রাউটিং নাম্বার</label><input type="text" class="form-input" id="epBankRouting"></div>
          <div class="form-group"><label>শাখা</label><input type="text" class="form-input" id="epBankBranch"></div>
        </div>

        <h4 style="color:var(--purple-700); margin: 20px 0 15px; border-bottom: 1px solid var(--slate-100); padding-bottom: 5px;">শিক্ষাগত যোগ্যতা</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group"><label>সর্বোচ্চ ডিগ্রি</label><input type="text" class="form-input" id="epEduDegree"></div>
          <div class="form-group"><label>প্রতিষ্ঠানের নাম</label><input type="text" class="form-input" id="epEduInstitute"></div>
          <div class="form-group"><label>পাসের সাল</label><input type="text" class="form-input" id="epEduYear"></div>
        </div>

        <h4 style="color:var(--purple-700); margin: 20px 0 15px; border-bottom: 1px solid var(--slate-100); padding-bottom: 5px;">ডকুমেন্টস</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group"><label>এনআইডি নম্বর</label><input type="text" class="form-input" id="epDocNID"></div>
          <div class="form-group"><label>পাসপোর্ট নম্বর</label><input type="text" class="form-input" id="epDocPassport"></div>
        </div>
      </div>
      
      <button class="btn btn-primary" onclick="saveEditedProfile()" style="width:100%">
        <i class="fa-solid fa-save"></i> সেভ করুন
      </button>
    </div>
  </div>`;
content = content.replace(modalTarget, newModal);

// 4. Replace JS Logic
const jsRegex = /function loadProfile\(userId\) \{(.|\n)*?function viewProfile\(userId\) \{/m;

const newJs = `function loadProfile(userId) {
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
          \${(isAdmin || isSelf) ? \`<button class="btn btn-primary btn-sm profile-edit-btn" onclick="openEditProfileModal('\${user.id}')"><i class="fa-solid fa-pen"></i> প্রোফাইল সম্পাদনা</button>\` : ''}
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

      // Define tab contents
      const tPersonal = \`
        <div class="p-grid">
          <div class="p-card">
            <h3>ব্যক্তিগত তথ্য</h3>
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
          <div class="p-card">
            <h3>যোগাযোগ তথ্য</h3>
            <table class="p-table">
              <tr><td>ই-মেইল</td><td>\${user.email || '—'}</td></tr>
              <tr><td>মোবাইল</td><td>\${user.phone || '—'}</td></tr>
              <tr><td>বিকল্প/বিকাশ</td><td>\${user.altPhone || '—'}</td></tr>
            </table>
          </div>
        </div>
      \`;

      const tJob = \`
        <div class="p-grid">
          <div class="p-card">
            <h3>চাকরির তথ্য</h3>
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
      \`;

      const tBank = \`
        <div class="p-grid">
          <div class="p-card">
            <h3>ব্যাংক তথ্য</h3>
            <table class="p-table">
              <tr><td>ব্যাংকের নাম</td><td>\${user.bankName || '—'}</td></tr>
              <tr><td>অ্যাকাউন্ট নাম্বার</td><td>\${user.bankAcc || '—'}</td></tr>
              <tr><td>রাউটিং নাম্বার</td><td>\${user.bankRouting || '—'}</td></tr>
              <tr><td>শাখা</td><td>\${user.bankBranch || '—'}</td></tr>
            </table>
          </div>
        </div>
      \`;

      const tEdu = \`
        <div class="p-grid">
          <div class="p-card">
            <h3>শিক্ষাগত যোগ্যতা</h3>
            <table class="p-table">
              <tr><td>সর্বোচ্চ ডিগ্রি</td><td>\${user.eduDegree || '—'}</td></tr>
              <tr><td>প্রতিষ্ঠানের নাম</td><td>\${user.eduInstitute || '—'}</td></tr>
              <tr><td>পাসের সাল</td><td>\${user.eduYear || '—'}</td></tr>
            </table>
          </div>
        </div>
      \`;

      const tDocs = \`
        <div class="p-grid">
          <div class="p-card">
            <h3>ডকুমেন্টস</h3>
            <table class="p-table">
              <tr><td>এনআইডি নম্বর</td><td>\${user.docNID || '—'}</td></tr>
              <tr><td>পাসপোর্ট নম্বর</td><td>\${user.docPassport || '—'}</td></tr>
            </table>
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
        'p-edu': tEdu,
        'p-docs': tDocs
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

      // Edu
      document.getElementById('epEduDegree').value = user.eduDegree || '';
      document.getElementById('epEduInstitute').value = user.eduInstitute || '';
      document.getElementById('epEduYear').value = user.eduYear || '';

      // Docs
      document.getElementById('epDocNID').value = user.docNID || '';
      document.getElementById('epDocPassport').value = user.docPassport || '';

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

      user.eduDegree = document.getElementById('epEduDegree').value;
      user.eduInstitute = document.getElementById('epEduInstitute').value;
      user.eduYear = document.getElementById('epEduYear').value;

      user.docNID = document.getElementById('epDocNID').value;
      user.docPassport = document.getElementById('epDocPassport').value;

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
console.log('Successfully updated profile logic.');
