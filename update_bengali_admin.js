const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// 1. Time in Bengali
c = c.replace("const time = now.toLocaleTimeString('en-GB');", "const time = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });");

// 2. Change 'এমপ্লয়ী ডিরেক্টরি' in sidebar to 'এমপ্লয়ী' and make it admin-only
const oldNav = `<div class="nav-item" onclick="navigate('employees')" data-page="employees">
            <div class="nav-item-left"><i class="fa-solid fa-users"></i> এমপ্লয়ী ডিরেক্টরি</div>
          </div>`;
const newNav = `<div class="nav-item admin-only" onclick="navigate('employees')" data-page="employees" style="display:none">
            <div class="nav-item-left"><i class="fa-solid fa-users"></i> এমপ্লয়ী</div>
          </div>`;
c = c.replace(oldNav, newNav);

// 3. Add Employee Management card in Settings page
const newSettingCard = `
            <!-- Manage Employees -->
            <div class="setting-card">
              <h4><i class="fa-solid fa-users" style="color:var(--emerald-500)"></i> এমপ্লয়ী ম্যানেজমেন্ট</h4>
              <p style="font-size:12px;color:var(--slate-500);margin-bottom:14px;margin-top:-10px">
                <i class="fa-solid fa-info-circle"></i> নতুন এমপ্লয়ী যোগ করুন এবং তথ্য আপডেট করুন
              </p>
              <button class="btn btn-primary" onclick="showAddEmployeeModal()" style="width:100%">
                <i class="fa-solid fa-user-plus"></i> নতুন এমপ্লয়ী যোগ করুন
              </button>
            </div>
`;
const empTypeManageTarget = '<!-- Employee Types Management -->';
if (c.includes(empTypeManageTarget)) {
    c = c.replace(empTypeManageTarget, newSettingCard + '\n            ' + empTypeManageTarget);
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Modifications done.');
