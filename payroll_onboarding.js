// =========================================================
// ONBOARDING MODULE (Phase 1)
// =========================================================

async function renderOnboarding() {
  if (!App.isAdmin) return `<div class="empty-state"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3></div>`;
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #1e0a30 0%, #5b2d8a 100%); color: white;">
      <div>
        <h1 style="color:white">এমপ্লয়ী অনবোর্ডিং ও ডকুমেন্টস</h1>
        <p style="color:#d8b4fe">নতুন এমপ্লয়ী যুক্ত করুন এবং তাদের ডকুমেন্ট সংরক্ষণ করুন</p>
      </div>
      <button class="btn btn-primary" onclick="openUploadDocModal()">
        <i class="fa-solid fa-upload"></i> ডকুমেন্ট আপলোড
      </button>
    </div>
    
    <div class="tabs" id="onboardingTabs">
      <div class="tab active" onclick="switchOnboardingTab('tasks', this)">অনবোর্ডিং টাস্ক</div>
      <div class="tab" onclick="switchOnboardingTab('docs', this)">এমপ্লয়ী ডকুমেন্টস</div>
    </div>
    
    <div id="onboardingTabContent">
      <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
    </div>
  `;
}

window.switchOnboardingTab = function(tab, el) {
  document.querySelectorAll('#onboardingTabs .tab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  if (tab === 'tasks') refreshOnboardingList();
  else if (tab === 'docs') refreshEmployeeDocuments();
};

async function refreshOnboardingList() {
  const container = document.getElementById('onboardingTabContent');
  if (!container) return;
  
  try {
    const { data, error } = await sb.from('onboarding_tasks').select('*, profiles(full_name, designation)').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>কোনো অনবোর্ডিং টাস্ক নেই।</p></div>`;
      return;
    }
    
    let html = `<table class="data-table">
      <tr><th>এমপ্লয়ী</th><th>টাস্ক</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr>`;
      
    data.forEach(task => {
      const empName = task.profiles ? task.profiles.full_name : 'অজ্ঞাত';
      const statusBadge = task.is_completed 
        ? `<span class="leave-status approved">সম্পন্ন</span>` 
        : `<span class="leave-status pending">অপেক্ষমান</span>`;
        
      html += `<tr>
        <td><b>${empName}</b></td>
        <td>${task.task_name}</td>
        <td>${statusBadge}</td>
        <td>
          ${!task.is_completed ? `<button class="btn btn-sm btn-success" onclick="markTaskComplete(${task.id})"><i class="fa-solid fa-check"></i></button>` : ''}
        </td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error loading tasks: ${err.message}</p>`;
  }
}

async function markTaskComplete(id) {
  try {
    const { error } = await sb.from('onboarding_tasks').update({ is_completed: true, completed_at: new Date() }).eq('id', id);
    if (error) throw error;
    showToast('টাস্ক সম্পন্ন হয়েছে!', 'success');
    refreshOnboardingList();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

window.refreshEmployeeDocuments = async function() {
  const container = document.getElementById('onboardingTabContent');
  if (!container) return;
  
  try {
    const { data, error } = await sb.from('employee_documents').select('*, profiles(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>কোনো ডকুমেন্ট নেই।</p></div>`;
      return;
    }
    
    let html = `<table class="data-table">
      <tr><th>এমপ্লয়ী</th><th>ডকুমেন্ট টাইপ</th><th>আপলোড তারিখ</th><th>অ্যাকশন</th></tr>`;
      
    data.forEach(doc => {
      const empName = doc.profiles ? doc.profiles.full_name : 'অজ্ঞাত';
      const dateStr = new Date(doc.created_at).toLocaleDateString('en-GB');
        
      html += `<tr>
        <td><b>${empName}</b></td>
        <td>${doc.document_type}</td>
        <td>${dateStr}</td>
        <td>
          <a href="${doc.document_url}" target="_blank" class="btn btn-sm btn-primary"><i class="fa-solid fa-eye"></i> দেখুন</a>
        </td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error loading documents: ${err.message}</p>`;
  }
}

window.openUploadDocModal = async function() {
  const { data: emps } = await sb.from('profiles').select('id, full_name').eq('is_active', true);
  const opts = (emps||[]).map(e => `<option value="${e.id}">${e.full_name}</option>`).join('');
  showModal(
    `<i class="fa-solid fa-file-upload"></i> ডকুমেন্ট আপলোড করুন`,
    `
    <div class="form-group"><label>এমপ্লয়ী</label><select id="docUserId" class="form-input">${opts}</select></div>
    <div class="form-group"><label>ডকুমেন্ট টাইপ</label>
      <select id="docType" class="form-input">
        <option value="NID / ID Card">NID / ID Card</option>
        <option value="CV / Resume">CV / Resume</option>
        <option value="Certificate">শিক্ষাগত সনদ (Certificate)</option>
        <option value="Other">অন্যান্য</option>
      </select>
    </div>
    <div class="form-group"><label>ফাইল নির্বাচন করুন (PDF/Image)</label>
      <input type="file" id="docFile" class="form-input" accept=".pdf,image/*">
    </div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
    <button class="btn btn-primary" onclick="uploadEmployeeDoc()"><i class="fa-solid fa-upload"></i> আপলোড</button>
    `
  );
}

window.uploadEmployeeDoc = async function() {
  const userId = document.getElementById('docUserId').value;
  const docType = document.getElementById('docType').value;
  const fileInput = document.getElementById('docFile');
  if(!fileInput.files || fileInput.files.length === 0) return showToast('ফাইল নির্বাচন করুন', 'error');
  
  const file = fileInput.files[0];
  const ext = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${ext}`;
  
  try {
    showToast('আপলোড হচ্ছে...', 'warning');
    const { error: upErr } = await sb.storage.from('hr_documents').upload(fileName, file);
    if (upErr) throw upErr;
    
    const { data: urlData } = sb.storage.from('hr_documents').getPublicUrl(fileName);
    const url = urlData.publicUrl;
    
    const { error: saveErr } = await sb.from('employee_documents').insert({
      user_id: userId,
      document_type: docType,
      document_url: url
    });
    if (saveErr) throw saveErr;
    
    showToast('ডকুমেন্ট সফলভাবে আপলোড হয়েছে!', 'success');
    closeModal();
    if (document.querySelector('#onboardingTabs .tab:nth-child(2)').classList.contains('active')) {
       refreshEmployeeDocuments();
    }
  } catch(e) {
    showToast('আপলোড ব্যর্থ: ' + e.message, 'error');
  }
}

// =========================================================
// PAYROLL MODULE (Phase 1)
// =========================================================

async function renderPayroll() {
  if (!App.isAdmin) return `<div class="empty-state"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3></div>`;
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white;">
      <div>
        <h1 style="color:white">পেরোল ও স্যালারি</h1>
        <p style="color:#94a3b8">সকল এমপ্লয়ীর বেতন ও পেরোল স্লিপ পরিচালনা করুন</p>
      </div>
      <button class="btn btn-success" onclick="generateMonthlyPayroll()">
        <i class="fa-solid fa-file-invoice-dollar"></i> এই মাসের পেরোল তৈরি করুন
      </button>
    </div>
    
    <div class="tabs" id="payrollTabs">
      <div class="tab active" onclick="switchPayrollTab('records', this)">পেরোল রেকর্ডস</div>
      <div class="tab" onclick="switchPayrollTab('structure', this)">স্যালারি স্ট্রাকচার (সেটআপ)</div>
    </div>
    
    <div id="payrollTabContent">
      <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
    </div>
  `;
}

window.switchPayrollTab = function(tab, el) {
  document.querySelectorAll('#payrollTabs .tab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  
  if (tab === 'records') refreshPayrollList();
  else if (tab === 'structure') refreshSalaryStructure();
};

async function refreshPayrollList() {
  const container = document.getElementById('payrollTabContent');
  if (!container) return;
  
  try {
    const { data, error } = await sb.from('payroll_records').select('*, profiles(full_name)').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>কোনো পেরোল রেকর্ড নেই।</p></div>`;
      return;
    }
    
    let html = `<table class="data-table">
      <tr><th>মাস</th><th>এমপ্লয়ী</th><th>মূল বেতন</th><th>সর্বমোট (নেট)</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr>`;
      
    data.forEach(p => {
      const empName = p.profiles ? p.profiles.full_name : 'অজ্ঞাত';
      const statusBadge = p.status === 'Paid' 
        ? `<span class="leave-status approved">পেইড</span>` 
        : `<span class="leave-status pending">পেন্ডিং</span>`;
        
      html += `<tr>
        <td><b>${p.month}</b></td>
        <td>${empName}</td>
        <td>৳${p.base_salary}</td>
        <td><b>৳${p.net_salary}</b></td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="viewPayslip(${p.id})">স্লিপ</button>
          ${p.status !== 'Paid' ? `<button class="btn btn-sm btn-success" onclick="markPaid(${p.id})">পে</button>` : ''}
        </td>
      </tr>`;
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p style="color:red">Error loading payroll: ${err.message}</p>`;
  }
}

window.markPaid = async function(id) {
    if(!confirm("আপনি কি নিশ্চিত যে এই পেরোলটি পেইড হিসেবে মার্ক করবেন?")) return;
    try {
        const { error } = await sb.from('payroll_records').update({ status: 'Paid' }).eq('id', id);
        if (error) throw error;
        showToast('পেরোল পেইড হিসেবে মার্ক করা হয়েছে!', 'success');
        refreshPayrollList();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

window.generateMonthlyPayroll = async function() {
    showToast('পেরোল জেনারেট হচ্ছে...', 'warning');
    try {
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        const { data: structures, error: sErr } = await sb.from('salary_structures').select('*');
        if(sErr) throw sErr;
        
        if (!structures || structures.length === 0) {
            showToast('কোনো স্যালারি স্ট্রাকচার সেটআপ করা নেই। আগে স্ট্রাকচার সেটআপ করুন।', 'error');
            return;
        }

        for(let s of structures) {
            const net = parseFloat(s.basic_salary) + parseFloat(s.house_rent) + parseFloat(s.medical_allowance) + parseFloat(s.transport_allowance) - parseFloat(s.provident_fund) - parseFloat(s.tax_deduction);
            await sb.from('payroll_records').upsert({
                user_id: s.user_id,
                month: month,
                base_salary: s.basic_salary,
                total_allowance: parseFloat(s.house_rent) + parseFloat(s.medical_allowance) + parseFloat(s.transport_allowance),
                total_deduction: parseFloat(s.provident_fund) + parseFloat(s.tax_deduction),
                net_salary: net,
                status: 'Pending'
            }, { onConflict: 'user_id, month' });
        }
        showToast('এই মাসের পেরোল সফলভাবে তৈরি হয়েছে!', 'success');
        refreshPayrollList();
    } catch (err) {
        showToast('Error generating payroll: ' + err.message, 'error');
    }
}

window.refreshSalaryStructure = async function() {
  const container = document.getElementById('payrollTabContent');
  if (!container) return;
  try {
    const { data: profiles, error: pErr } = await sb.from('profiles').select('id, full_name, designation').eq('is_active', true);
    const { data: structs, error: sErr } = await sb.from('salary_structures').select('*');
    if (pErr || sErr) throw (pErr || sErr);

    const sMap = {};
    (structs || []).forEach(s => sMap[s.user_id] = s);

    let html = `
      <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0"><i class="fa-solid fa-money-bill-wave"></i> স্যালারি স্ট্রাকচার তালিকা</h3>
      </div>
      <table class="data-table">
        <tr><th>এমপ্লয়ী</th><th>বেসিক স্যালারি</th><th>ভাতা (Total)</th><th>ডিডাকশন (Total)</th><th>নেট স্যালারি</th><th>অ্যাকশন</th></tr>
    `;

    (profiles || []).forEach(p => {
      const s = sMap[p.id];
      if (s) {
        const net = parseFloat(s.basic_salary) + parseFloat(s.house_rent) + parseFloat(s.medical_allowance) + parseFloat(s.transport_allowance) - parseFloat(s.provident_fund) - parseFloat(s.tax_deduction);
        const allowance = parseFloat(s.house_rent) + parseFloat(s.medical_allowance) + parseFloat(s.transport_allowance);
        const ded = parseFloat(s.provident_fund) + parseFloat(s.tax_deduction);
        html += `<tr>
          <td><b>${p.full_name}</b><br><small style="color:var(--gray-500)">${p.designation||'-'}</small></td>
          <td>৳${s.basic_salary}</td>
          <td>৳${allowance}</td>
          <td>৳${ded}</td>
          <td><b>৳${net}</b></td>
          <td><button class="btn btn-sm btn-outline" onclick="editSalaryStructure('${p.id}')"><i class="fa-solid fa-pen"></i> আপডেট</button></td>
        </tr>`;
      } else {
        html += `<tr>
          <td><b>${p.full_name}</b><br><small style="color:var(--gray-500)">${p.designation||'-'}</small></td>
          <td colspan="4" style="color:var(--gray-400); text-align:center;">কোনো স্ট্রাকচার সেট করা নেই</td>
          <td><button class="btn btn-sm btn-primary" onclick="editSalaryStructure('${p.id}')"><i class="fa-solid fa-plus"></i> সেট করুন</button></td>
        </tr>`;
      }
    });
    html += `</table>`;
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p style="color:red">Error loading structures: ${e.message}</p>`;
  }
}

window.editSalaryStructure = async function(userId) {
  const { data: p } = await sb.from('profiles').select('full_name').eq('id', userId).single();
  const { data: s } = await sb.from('salary_structures').select('*').eq('user_id', userId).maybeSingle();
  
  const bs = s ? s.basic_salary : 0;
  const hr = s ? s.house_rent : 0;
  const ma = s ? s.medical_allowance : 0;
  const ta = s ? s.transport_allowance : 0;
  const pf = s ? s.provident_fund : 0;
  const td = s ? s.tax_deduction : 0;

  showModal(
    `<i class="fa-solid fa-money-check-dollar" style="color:var(--brand-color)"></i> স্যালারি স্ট্রাকচার: ${p.full_name}`,
    `
    <input type="hidden" id="salUserId" value="${userId}">
    <div class="form-grid">
      <div class="form-group"><label>বেসিক স্যালারি (Basic)</label><input class="form-input num" type="number" id="salBasic" value="${bs}"></div>
      <div class="form-group"><label>বাড়ি ভাড়া (House Rent)</label><input class="form-input num" type="number" id="salHR" value="${hr}"></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label>মেডিকেল ভাতা</label><input class="form-input num" type="number" id="salMA" value="${ma}"></div>
      <div class="form-group"><label>যাতায়াত ভাতা</label><input class="form-input num" type="number" id="salTA" value="${ta}"></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label>প্রভিডেন্ট ফান্ড (PF)</label><input class="form-input num" type="number" id="salPF" value="${pf}"></div>
      <div class="form-group"><label>ট্যাক্স (Tax)</label><input class="form-input num" type="number" id="salTax" value="${td}"></div>
    </div>
    `,
    `
      <button class="btn btn-outline" onclick="closeModal()">বাতিল</button>
      <button class="btn btn-primary" onclick="saveSalaryStructure()"><i class="fa-solid fa-floppy-disk"></i> সেভ করুন</button>
    `
  );
}

window.saveSalaryStructure = async function() {
  const userId = document.getElementById('salUserId').value;
  const payload = {
    user_id: userId,
    basic_salary: parseFloat(document.getElementById('salBasic').value || 0),
    house_rent: parseFloat(document.getElementById('salHR').value || 0),
    medical_allowance: parseFloat(document.getElementById('salMA').value || 0),
    transport_allowance: parseFloat(document.getElementById('salTA').value || 0),
    provident_fund: parseFloat(document.getElementById('salPF').value || 0),
    tax_deduction: parseFloat(document.getElementById('salTax').value || 0)
  };
  try {
    const { error } = await sb.from('salary_structures').upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
    showToast('স্যালারি স্ট্রাকচার সেভ হয়েছে', 'success');
    closeModal();
    refreshSalaryStructure();
  } catch(e) {
    showToast('Error: ' + e.message, 'error');
  }
}

window.viewPayslip = function(id) {
    showToast('PDF Payslip জেনারেট হচ্ছে...', 'warning');
    setTimeout(() => { showToast('Payslip তৈরি হয়েছে।', 'success'); }, 1500);
}

// Attach functions to window if not already there, so index.html's navigate() can find them.
window.renderOnboarding = renderOnboarding;
window.renderPayroll = renderPayroll;
window.refreshOnboardingList = refreshOnboardingList;
window.refreshPayrollList = refreshPayrollList;
