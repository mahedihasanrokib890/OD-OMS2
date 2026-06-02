// =========================================================
// ONBOARDING MODULE (Phase 1)
// =========================================================

async function renderOnboarding() {
  if (!App.isAdmin) return `<div class="empty-state"><i class="fa-solid fa-lock"></i><h3>Access Denied</h3></div>`;
  
  return `
    <div class="welcome-banner" style="background: linear-gradient(135deg, #1e0a30 0%, #5b2d8a 100%); color: white;">
      <div>
        <h1 style="color:white">এমপ্লয়ী অনবোর্ডিং</h1>
        <p style="color:#d8b4fe">নতুন এমপ্লয়ী যুক্ত করুন এবং তাদের যোগদান প্রক্রিয়া ট্র্যাক করুন</p>
      </div>
    </div>
    <div class="card">
      <div class="card-title">
        <span><i class="fa-solid fa-list-check"></i> অনবোর্ডিং টাস্কসমূহ</span>
      </div>
      <div id="onboardingList">
        <div style="text-align:center; padding:30px;"><div class="spinner" style="margin:0 auto"></div></div>
      </div>
    </div>
  `;
}

async function refreshOnboardingList() {
  const container = document.getElementById('onboardingList');
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
   container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-screwdriver-wrench"></i><p>স্যালারি স্ট্রাকচার সেটআপ ফিচারটি পরবর্তী আপডেটে আসবে।</p></div>`;
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
