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
        <td>${app.email}</td>
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
    <div class="welcome-banner" style="background: linear-gradient(135deg, #ca8a04 0%, #a16207 100%); color: white;">
      <div>
        <h1 style="color:white">পারফরম্যান্স (OKRs)</h1>
        <p style="color:#fef08a">এমপ্লয়ি টার্গেট এবং রেটিং ম্যানেজমেন্ট</p>
      </div>
    </div>
    
    <div class="card">
       <div class="card-title" style="display:flex;justify-content:space-between">
        <span><i class="fa-solid fa-bullseye"></i> লক্ষ্য ও টার্গেটসমূহ (Goals)</span>
        ${isAdmin ? `<button class="btn btn-sm btn-primary" onclick="openNewGoalModal()"><i class="fa-solid fa-plus"></i> নতুন টার্গেট</button>` : ''}
      </div>
      <div id="goalsList">লোড হচ্ছে...</div>
    </div>
    
    <div class="card" style="margin-top:20px;">
       <div class="card-title" style="display:flex;justify-content:space-between">
        <span><i class="fa-solid fa-star"></i> মাসিক রেটিং</span>
        ${isAdmin ? `<button class="btn btn-sm btn-primary" onclick="openNewReviewModal()"><i class="fa-solid fa-plus"></i> নতুন রেটিং</button>` : ''}
      </div>
      <div id="reviewsList">লোড হচ্ছে...</div>
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
    <div class="welcome-banner" style="background: linear-gradient(135deg, #be123c 0%, #881337 100%); color: white;">
      <div>
        <h1 style="color:white">অফিসিয়াল খরচ (Expenses)</h1>
        <p style="color:#fecdd3">ভাতা এবং খরচের বিল ভাউচার সাবমিট করুন</p>
      </div>
      <button class="btn btn-primary" onclick="openNewExpenseModal()">
        <i class="fa-solid fa-plus"></i> বিল সাবমিট
      </button>
    </div>
    
    <div id="expenseList" style="margin-top:20px;">
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

window.renderRecruitment = renderRecruitment;
window.renderPerformance = renderPerformance;
window.renderExpense = renderExpense;
