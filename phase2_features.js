// =========================================================
// PHASE 2 FEATURES (ATS, Performance, Expense)
// =========================================================

// =========================================================
// 1. RECRUITMENT / ATS
// =========================================================
async function renderRecruitment() {
  if (!App.isAdmin) return `<div class="empty-state"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3></div>`;
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: white;">
      <div>
        <h1 style="color:white">রিক্রুটমেন্ট (ATS)</h1>
        <p style="color:#e0f2fe">জব সার্কুলার দিন এবং প্রার্থীদের সিভি ম্যানেজ করুন</p>
      </div>
      <button class="btn btn-primary" onclick="openNewJobModal()">
        <i class="fa-solid fa-briefcase"></i> নতুন জব পোস্ট
      </button>
      <button class="btn btn-secondary" style="margin-left:10px" onclick="openNewAppModal()">
        <i class="fa-solid fa-file-pdf"></i> সিভি আপলোড
      </button>
    </div>
    
    <div class="tabs" id="atsTabs">
      <div class="tab active" onclick="switchAtsTab('jobs', this)">জব পোস্টিংস</div>
      <div class="tab" onclick="switchAtsTab('apps', this)">অ্যাপ্লিকেশন / সিভি</div>
    </div>
    
    <div id="atsTabContent">
      <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
    </div>
  `;
}

window.switchAtsTab = function(tab, el) {
  document.querySelectorAll('#atsTabs .tab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  
  if (tab === 'jobs') refreshJobPostings();
  else if (tab === 'apps') refreshApplications();
};

window.refreshJobPostings = async function() {
  const container = document.getElementById('atsTabContent');
  if (!container) return;
  try {
    const { data, error } = await sb.from('job_postings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>কোনো জব পোস্ট নেই।</p></div>`;
      return;
    }
    let html = `<table class="data-table"><tr><th>পদবী</th><th>ডিপার্টমেন্ট</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr>`;
    data.forEach(job => {
      html += `<tr>
        <td><b>${job.title}</b></td>
        <td>${job.department || '-'}</td>
        <td>${job.is_active ? '<span class="leave-status approved">Active</span>' : '<span class="leave-status pending">Closed</span>'}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="toggleJobStatus(${job.id}, ${!job.is_active})">
            ${job.is_active ? 'Close' : 'Activate'}
          </button>
        </td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

window.refreshApplications = async function() {
  const container = document.getElementById('atsTabContent');
  if (!container) return;
  try {
    const { data, error } = await sb.from('job_applications').select('*, job_postings(title)').order('applied_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>কোনো অ্যাপ্লিকেশন পাওয়া যায়নি।</p></div>`;
      return;
    }
    let html = `<table class="data-table"><tr><th>প্রার্থী</th><th>পদের নাম</th><th>ইমেইল</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr>`;
    data.forEach(app => {
      const statusClr = app.status === 'Hired' ? 'approved' : app.status === 'Rejected' ? 'pending' : '';
      html += `<tr>
        <td><b>${app.applicant_name}</b></td>
        <td>${app.job_postings ? app.job_postings.title : '-'}</td>
        <td>${app.email}<br>${app.cv_url ? `<a href="${app.cv_url}" target="_blank" style="font-size:12px; color:var(--brand-color);"><i class="fa-solid fa-file-pdf"></i> CV দেখুন</a>` : '<span style="font-size:12px;color:gray">CV নেই</span>'}</td>
        <td><span class="leave-status ${statusClr}">${app.status}</span></td>
        <td>
           <select class="form-select form-select-sm" style="width:100px; display:inline-block" onchange="updateAppStatus(${app.id}, this.value)">
             <option value="Pending" ${app.status==='Pending'?'selected':''}>Pending</option>
             <option value="Interview" ${app.status==='Interview'?'selected':''}>Interview</option>
             <option value="Hired" ${app.status==='Hired'?'selected':''}>Hired</option>
             <option value="Rejected" ${app.status==='Rejected'?'selected':''}>Rejected</option>
           </select>
        </td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

window.updateAppStatus = async function(id, status) {
  try {
    await sb.from('job_applications').update({ status }).eq('id', id);
    showToast('স্ট্যাটাস আপডেট হয়েছে', 'success');
  } catch(e) {
    showToast('Error', 'error');
  }
}

window.openNewAppModal = async function() {
  const { data: jobs } = await sb.from('job_postings').select('id, title').eq('is_active', true);
  const opts = (jobs||[]).map(j => `<option value="${j.id}">${j.title}</option>`).join('');
  
  showModal(
    `<i class="fa-solid fa-file-pdf"></i> নতুন অ্যাপ্লিকেশন (CV) যোগ করুন`,
    `
    <div class="form-group"><label>জব পোস্ট</label><select id="appJobId" class="form-input">${opts}</select></div>
    <div class="form-group"><label>প্রার্থীর নাম</label><input type="text" id="appName" class="form-input"></div>
    <div class="form-group"><label>ইমেইল</label><input type="email" id="appEmail" class="form-input"></div>
    <div class="form-group"><label>CV (PDF/DOCX)</label><input type="file" id="appCV" class="form-input" accept=".pdf,.doc,.docx"></div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="saveApp()"><i class="fa-solid fa-upload"></i> সেভ করুন</button>
    `
  );
}

window.saveApp = async function() {
  const jobId = document.getElementById('appJobId').value;
  const name = document.getElementById('appName').value;
  const email = document.getElementById('appEmail').value;
  const fileInput = document.getElementById('appCV');
  
  if(!name || !email) return showToast('নাম ও ইমেইল দিন', 'error');
  
  let cvUrl = null;
  if(fileInput.files && fileInput.files.length > 0) {
     const file = fileInput.files[0];
     const ext = file.name.split('.').pop();
     const fileName = `cv_${Date.now()}.${ext}`;
     showToast('CV আপলোড হচ্ছে...', 'warning');
     const { error: upErr } = await sb.storage.from('hr_documents').upload(fileName, file);
     if(!upErr) {
        const { data: urlData } = sb.storage.from('hr_documents').getPublicUrl(fileName);
        cvUrl = urlData.publicUrl;
     }
  }
  
  try {
    await sb.from('job_applications').insert({ job_id: jobId, applicant_name: name, email: email, status: 'Pending', cv_url: cvUrl });
    showToast('অ্যাপ্লিকেশন সেভ হয়েছে', 'success');
    closeModal();
    refreshApplications();
  } catch(e) {
    showToast('Error: '+e.message, 'error');
  }
}

window.openNewJobModal = function() {
  showModal(
    `<i class="fa-solid fa-briefcase"></i> নতুন জব পোস্ট`,
    `
    <div class="form-group"><label>পদের নাম (Job Title)</label><input type="text" id="jobTitle" class="form-input"></div>
    <div class="form-group"><label>ডিপার্টমেন্ট</label><input type="text" id="jobDept" class="form-input"></div>
    <div class="form-group"><label>বিবরণ (Description)</label><textarea id="jobDesc" class="form-input" style="height:100px"></textarea></div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="saveJob()"><i class="fa-solid fa-check"></i> পোস্ট করুন</button>
    `
  );
}

window.saveJob = async function() {
  const title = document.getElementById('jobTitle').value;
  const dept = document.getElementById('jobDept').value;
  const desc = document.getElementById('jobDesc').value;
  if(!title) return showToast('পদের নাম দিন', 'error');
  try {
    await sb.from('job_postings').insert({ title, department: dept, description: desc });
    showToast('জব পোস্ট করা হয়েছে', 'success');
    closeModal();
    refreshJobPostings();
  } catch(e) {
    showToast('Error: '+e.message, 'error');
  }
}

// =========================================================
// 2. PERFORMANCE MANAGEMENT
// =========================================================
async function renderPerformance() {
  const isAdmin = App.isAdmin;
  return `
    <div style="display:flex; justify-content:flex-end; margin-bottom:15px; gap: 10px;">
      ${isAdmin ? `<button class="btn btn-primary" onclick="openNewGoalModal()" style="border-radius: 50px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);"><i class="fa-solid fa-bullseye"></i> নতুন টার্গেট</button>` : ''}
      ${isAdmin ? `<button class="btn btn-secondary" onclick="openNewReviewModal()" style="border-radius: 50px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); background: #f59e0b; color: white; border: none;"><i class="fa-solid fa-star"></i> নতুন রেটিং</button>` : ''}
    </div>
    
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
      <div class="card" style="border:none; box-shadow:0 4px 15px rgba(0,0,0,0.03); border-radius:16px; margin:0;">
         <div class="card-title" style="color:var(--gray-700); font-size:16px; font-weight:700;"><i class="fa-solid fa-bullseye" style="color:#8b5cf6;"></i> লক্ষ্য ও টার্গেটসমূহ</div>
        <div id="goalsList" style="margin-top:10px;">লোড হচ্ছে...</div>
      </div>
      
      <div class="card" style="border:none; box-shadow:0 4px 15px rgba(0,0,0,0.03); border-radius:16px; margin:0;">
         <div class="card-title" style="color:var(--gray-700); font-size:16px; font-weight:700;"><i class="fa-solid fa-star" style="color:#f59e0b;"></i> মাসিক রেটিং</div>
        <div id="reviewsList" style="margin-top:10px;">লোড হচ্ছে...</div>
      </div>
    </div>
  `;
}

window.refreshPerformance = async function() {
    refreshGoals();
    refreshReviews();
}

window.refreshGoals = async function() {
    const el = document.getElementById('goalsList');
    if(!el) return;
    try {
        let q = sb.from('performance_goals').select('*, profiles(full_name)');
        if(!App.isAdmin) q = q.eq('user_id', App.user.id);
        const { data } = await q.order('created_at', { ascending: false });
        
        if(!data || data.length === 0) {
            el.innerHTML = '<p class="empty-state">কোনো গোল সেট করা নেই।</p>';
            return;
        }
        let html = `<table class="data-table"><tr><th>এমপ্লয়ি</th><th>টার্গেট/গোল</th><th>স্ট্যাটাস</th></tr>`;
        data.forEach(g => {
            html += `<tr><td>${g.profiles ? g.profiles.full_name : '-'}</td><td>${g.goal_title}</td><td><span class="leave-status">${g.status}</span></td></tr>`;
        });
        html += `</table>`;
        el.innerHTML = html;
    } catch(e) {
        el.innerHTML = 'Error loading goals';
    }
}

window.refreshReviews = async function() {
    const el = document.getElementById('reviewsList');
    if(!el) return;
    try {
        let q = sb.from('performance_reviews').select('*, profiles(full_name)');
        if(!App.isAdmin) q = q.eq('user_id', App.user.id);
        const { data } = await q.order('created_at', { ascending: false });
        
        if(!data || data.length === 0) {
            el.innerHTML = '<p class="empty-state">কোনো রেটিং নেই।</p>';
            return;
        }
        let html = `<table class="data-table"><tr><th>এমপ্লয়ি</th><th>মাস</th><th>রেটিং</th><th>মন্তব্য</th></tr>`;
        data.forEach(r => {
            html += `<tr><td>${r.profiles ? r.profiles.full_name : '-'}</td><td>${r.review_month}</td><td><b>${r.rating}/5</b> ⭐</td><td>${r.feedback||'-'}</td></tr>`;
        });
        html += `</table>`;
        el.innerHTML = html;
    } catch(e) {
        el.innerHTML = 'Error loading reviews';
    }
}

window.openNewGoalModal = async function() {
  const { data: emps } = await sb.from('profiles').select('id, full_name').eq('is_active', true);
  const opts = (emps||[]).map(e => `<option value="${e.id}">${e.full_name}</option>`).join('');
  showModal(
    `<i class="fa-solid fa-bullseye"></i> নতুন টার্গেট সেট করুন`,
    `
    <div class="form-group"><label>এমপ্লয়ী</label><select id="goalUserId" class="form-input">${opts}</select></div>
    <div class="form-group"><label>টার্গেটের নাম</label><input type="text" id="goalTitle" class="form-input"></div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="saveGoal()"><i class="fa-solid fa-check"></i> সেভ করুন</button>
    `
  );
}

window.saveGoal = async function() {
  const user_id = document.getElementById('goalUserId').value;
  const goal_title = document.getElementById('goalTitle').value;
  if(!goal_title) return showToast('টার্গেটের নাম দিন', 'error');
  try {
    await sb.from('performance_goals').insert({ user_id, goal_title, status: 'On Track' });
    showToast('টার্গেট সেভ হয়েছে', 'success');
    closeModal();
    refreshGoals();
  } catch(e) {
    showToast('Error: '+e.message, 'error');
  }
}

window.openNewReviewModal = async function() {
  const { data: emps } = await sb.from('profiles').select('id, full_name').eq('is_active', true);
  const opts = (emps||[]).map(e => `<option value="${e.id}">${e.full_name}</option>`).join('');
  const month = new Date().toISOString().slice(0, 7);
  showModal(
    `<i class="fa-solid fa-star"></i> মাসিক রেটিং দিন`,
    `
    <div class="form-group"><label>এমপ্লয়ী</label><select id="revUserId" class="form-input">${opts}</select></div>
    <div class="form-group"><label>মাস</label><input type="month" id="revMonth" class="form-input" value="${month}"></div>
    <div class="form-group"><label>রেটিং (1-5)</label><input type="number" min="1" max="5" id="revRating" class="form-input" value="5"></div>
    <div class="form-group"><label>মতামত (Feedback)</label><textarea id="revFeedback" class="form-input" style="height:60px"></textarea></div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="saveReview()"><i class="fa-solid fa-check"></i> সেভ করুন</button>
    `
  );
}

window.saveReview = async function() {
  const payload = {
    user_id: document.getElementById('revUserId').value,
    review_month: document.getElementById('revMonth').value,
    rating: parseInt(document.getElementById('revRating').value),
    feedback: document.getElementById('revFeedback').value
  };
  try {
    await sb.from('performance_reviews').insert(payload);
    showToast('রেটিং সেভ হয়েছে', 'success');
    closeModal();
    refreshReviews();
  } catch(e) {
    showToast('Error: '+e.message, 'error');
  }
}

// =========================================================
// 3. EXPENSE MANAGEMENT
// =========================================================
async function renderExpense() {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap: wrap; gap: 10px;">
      <h3 style="font-size:18px; font-weight:700; color:var(--gray-700); margin:0;"><i class="fa-solid fa-receipt" style="color:#f43f5e;"></i> অফিসিয়াল খরচের তালিকা</h3>
      <button class="btn btn-primary" onclick="openNewExpenseModal()" style="border-radius: 50px; background:linear-gradient(135deg, #e11d48, #be123c); border:none; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);">
        <i class="fa-solid fa-plus"></i> বিল সাবমিট
      </button>
    </div>
    
    <div id="expenseList" style="background:white; border-radius:16px; padding:20px; box-shadow:0 4px 15px rgba(0,0,0,0.03); min-height:400px; border:1px solid var(--gray-100);">
      <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
    </div>
  `;
}

window.refreshExpense = async function() {
  const el = document.getElementById('expenseList');
  if (!el) return;
  try {
    let q = sb.from('expenses').select('*, profiles(full_name)').order('created_at', { ascending: false });
    if (!App.isAdmin) q = q.eq('user_id', App.user.id);
    const { data, error } = await q;
    
    if (!data || data.length === 0) {
      el.innerHTML = `<div class="empty-state"><p>কোনো খরচের রেকর্ড নেই।</p></div>`;
      return;
    }
    
    let html = `<table class="data-table"><tr><th>এমপ্লয়ি</th><th>ক্যাটাগরি</th><th>পরিমাণ</th><th>স্ট্যাটাস</th>${App.isAdmin ? '<th>অ্যাকশন</th>' : ''}</tr>`;
    data.forEach(ex => {
      let statusBadge = ex.status === 'Approved' ? 'approved' : ex.status === 'Rejected' ? 'pending' : '';
      html += `<tr>
        <td>${ex.profiles ? ex.profiles.full_name : '-'}</td>
        <td>${ex.category || '-'}</td>
        <td><b>৳${ex.amount}</b></td>
        <td><span class="leave-status ${statusBadge}">${ex.status}</span></td>
        ${App.isAdmin ? `
        <td>
           ${ex.status === 'Pending' ? `
           <button class="btn btn-sm btn-success" onclick="updateExStatus(${ex.id}, 'Approved')"><i class="fa-solid fa-check"></i></button>
           <button class="btn btn-sm btn-danger" onclick="updateExStatus(${ex.id}, 'Rejected')"><i class="fa-solid fa-xmark"></i></button>
           ` : '-'}
        </td>` : ''}
      </tr>`;
    });
    html += `</table>`;
    el.innerHTML = html;
  } catch (err) {
    el.innerHTML = `<p style="color:red">Error loading expenses.</p>`;
  }
}

window.updateExStatus = async function(id, status) {
  try {
    await sb.from('expenses').update({ status }).eq('id', id);
    showToast('স্ট্যাটাস আপডেট হয়েছে', 'success');
    refreshExpense();
  } catch(e) {
    showToast('Error', 'error');
  }
}

window.openNewExpenseModal = function() {
  showModal(
    `<i class="fa-solid fa-file-invoice"></i> নতুন খরচের বিল সাবমিট`,
    `
    <div class="form-group"><label>ক্যাটাগরি</label>
      <select id="expCat" class="form-input">
        <option value="Travel">যাতায়াত (Travel)</option>
        <option value="Food">খাবার (Food)</option>
        <option value="Supplies">অফিস সাপ্লাই (Supplies)</option>
        <option value="Other">অন্যান্য</option>
      </select>
    </div>
    <div class="form-group"><label>পরিমাণ (৳)</label><input type="number" id="expAmount" class="form-input" value="0"></div>
    <div class="form-group"><label>বিবরণ</label><textarea id="expDesc" class="form-input" style="height:60px"></textarea></div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="saveExpense()"><i class="fa-solid fa-paper-plane"></i> সাবমিট করুন</button>
    `
  );
}

window.saveExpense = async function() {
  const payload = {
    user_id: App.user.id,
    category: document.getElementById('expCat').value,
    amount: parseFloat(document.getElementById('expAmount').value || 0),
    description: document.getElementById('expDesc').value,
    status: 'Pending'
  };
  if(payload.amount <= 0) return showToast('সঠিক পরিমাণ দিন', 'error');
  try {
    await sb.from('expenses').insert(payload);
    showToast('বিল সাবমিট হয়েছে, অ্যাপ্রুভালের অপেক্ষায়', 'success');
    closeModal();
    refreshExpense();
  } catch(e) {
    showToast('Error: '+e.message, 'error');
  }
}

// =========================================================
// HR TOOLS UNIFIED DASHBOARD
// =========================================================
window.renderHRTools = async function() {
  const isAdmin = App.isAdmin;
  const initialTool = isAdmin ? 'payroll' : 'performance';
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: white;">
      <div>
        <h1 style="color:white">এইচআর টুলস ড্যাশবোর্ড</h1>
        <p style="color:#c7d2fe">সব এইচআর ফিচার একসাথে পরিচালনা করুন</p>
      </div>
    </div>
    
    <div style="background: white; border-radius: var(--r-xl); box-shadow: var(--shadow-sm); border: 1px solid var(--border); margin-bottom: 20px; padding: 10px; overflow-x: auto;">
      <div style="display: flex; gap: 10px; min-width: max-content;" id="hrToolsTabs">
        ${isAdmin ? `
        <button class="hr-tab-btn active" onclick="switchHRTool('payroll', this)">
          <i class="fa-solid fa-money-bill-wave" style="color: #10b981;"></i> পেরোল
        </button>
        <button class="hr-tab-btn" onclick="switchHRTool('onboarding', this)">
          <i class="fa-solid fa-user-plus" style="color: #3b82f6;"></i> অনবোর্ডিং
        </button>
        ` : ''}
        <button class="hr-tab-btn ${!isAdmin ? 'active' : ''}" onclick="switchHRTool('performance', this)">
          <i class="fa-solid fa-star" style="color: #8b5cf6;"></i> পারফরম্যান্স
        </button>
        <button class="hr-tab-btn" onclick="switchHRTool('expenses', this)">
          <i class="fa-solid fa-receipt" style="color: #f43f5e;"></i> অফিসিয়াল খরচ
        </button>
      </div>
    </div>

    <style>
      .hr-tab-btn {
        padding: 12px 20px;
        border: none;
        background: transparent;
        border-radius: 12px;
        font-family: inherit;
        font-weight: 700;
        font-size: 14px;
        color: var(--gray-600);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }
      .hr-tab-btn:hover {
        background: var(--gray-50);
        color: var(--gray-900);
      }
      .hr-tab-btn.active {
        background: var(--purple-50);
        color: var(--purple-700);
        box-shadow: inset 0 0 0 1px var(--purple-200);
      }
      .hr-tab-btn i { font-size: 16px; }
    </style>

    <div id="hrToolsContent">
      <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
    </div>
    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" onload="setTimeout(()=>switchHRTool('${initialTool}', document.querySelector('#hrToolsTabs .hr-tab-btn.active')), 100)" style="display:none;">
  `;
}

window.switchHRTool = async function(tool, el) {
  if(el) {
    document.querySelectorAll('#hrToolsTabs .hr-tab-btn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
  }

  const container = document.getElementById('hrToolsContent');
  if(!container) return;

  container.innerHTML = '<div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>';

  try {
    let content = '';
    
    if (tool === 'payroll') {
        content = await window.renderPayroll();
    }
    else if (tool === 'onboarding') {
        content = await window.renderOnboarding();
    }
    else if (tool === 'performance') {
        content = await window.renderPerformance();
    }
    else if (tool === 'expenses') {
        content = await window.renderExpense();
    }
    
    container.innerHTML = content;

    setTimeout(() => {
      if (tool === 'payroll') window.switchPayrollTab('records', document.querySelector('#payrollTabs .tab'));
      else if (tool === 'onboarding') window.switchOnboardingTab('tasks', document.querySelector('#onboardingTabs .tab'));
      else if (tool === 'performance') window.refreshPerformance();
      else if (tool === 'expenses') window.refreshExpense();
    }, 50);

  } catch (err) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Error</h3><p>${err.message}</p></div>`;
  }
}

window.renderHRTools = renderHRTools;
window.renderRecruitment = renderRecruitment;
window.renderPerformance = renderPerformance;
window.renderExpense = renderExpense;

// =========================================================
// LIVE LOCATION MODULE (Admin Dashboard)
// =========================================================
window.renderLiveLocation = async function() {
  if (!App.isAdmin) return `<div class="empty-state"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3></div>`;
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white;">
      <div>
        <h1 style="color:white">লাইভ লোকেশন ট্র্যাকিং</h1>
        <p style="color:#bfdbfe">এমপ্লয়ীদের লোকেশন এবং রুট চেক করুন</p>
      </div>
    </div>
    
    <div class="card" style="padding:15px; margin-bottom:20px; display:flex; gap:10px; align-items:center;">
      <input type="date" id="liveLocDate" class="input-field" value="" onchange="refreshLiveLocation()" style="width:150px">
      <select id="liveLocEmp" class="input-field" style="width:200px" onchange="refreshLiveLocation()">
        <option value="all">সব এমপ্লয়ী</option>
      </select>
      <button class="btn btn-primary" onclick="refreshLiveLocation()"><i class="fa-solid fa-rotate-right"></i> রিফ্রেশ</button>
    </div>
    
    <div class="card" style="padding:0; overflow:hidden; margin-bottom:20px;">
      <div id="liveMap" style="width:100%; height:450px; z-index:1;"></div>
    </div>
    
    <div class="card">
      <h3 style="margin-bottom:15px; font-size:16px; color:var(--gray-700);"><i class="fa-solid fa-route"></i> লোকেশন হিস্টোরি — আজকের রুট</h3>
      <div id="routeTimeline" style="position:relative; margin-left:10px; border-left:2px solid var(--purple-200); padding-left:20px;">
        <!-- Timeline items -->
      </div>
    </div>
  `;
}
