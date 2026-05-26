const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const newCSS = `
/* Action Buttons Pro CSS */
.att-actions-pro {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
}
.att-btn-pro {
  background: white;
  border: 1px solid var(--slate-100);
  border-radius: 16px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  text-align: left;
}
.att-btn-pro:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}
.att-btn-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.att-in .att-btn-icon { background: rgba(16,185,129,0.1); color: var(--emerald-500); }
.att-out .att-btn-icon { background: rgba(236,72,153,0.1); color: var(--pink-500); }
.att-lunchout .att-btn-icon { background: rgba(245,158,11,0.1); color: var(--amber-500); }
.att-lunchin .att-btn-icon { background: rgba(59,130,246,0.1); color: var(--blue-500); }
.att-btn-label {
  display: block;
  font-weight: 700;
  font-size: 16px;
  color: var(--slate-800);
  margin-bottom: 2px;
}
.att-btn-sub {
  display: block;
  font-size: 12px;
  color: var(--slate-500);
}
.dark-mode .att-btn-pro { background: var(--card-bg); border-color: var(--border); }
.dark-mode .att-btn-label { color: #fff; }
</style>
`;

// Insert CSS
c = c.replace('</style>', newCSS);

// Now split page-attendance into page-emp-dashboard and page-attendance
const attIdx = c.indexOf('<div class="page-section" id="page-attendance">');
const tableIdx = c.indexOf('<!-- Attendance History Table -->', attIdx);

if (attIdx > -1 && tableIdx > -1) {
    let dashboardPart = c.substring(attIdx, tableIdx);
    dashboardPart = dashboardPart.replace('id="page-attendance"', 'id="page-emp-dashboard"');
    
    let tablePart = c.substring(tableIdx);
    let endOfAtt = tablePart.indexOf('<!-- ═══ NOTICE BOARD ═══ -->');
    let attendancePage = '\n        <div class="page-section" id="page-attendance">\n          ' + tablePart.substring(0, endOfAtt);
    
    c = c.substring(0, attIdx) + dashboardPart + attendancePage + tablePart.substring(endOfAtt);
}

// Update navigate()
const navRegex = /const adminPages = \['dashboard', 'accounts', 'import'\];\s+const isEmp = currentUser\?\.role !== 'admin';\s+if \(adminPages\.includes\(page\) && isEmp\) \{\s+page = 'attendance';\s+\}/;
c = c.replace(navRegex, `const adminPages = ['accounts', 'import'];
      const isEmp = currentUser?.role !== 'admin';
      if (adminPages.includes(page) && isEmp) {
        page = 'attendance';
      }
      if (page === 'dashboard' && isEmp) {
        page = 'emp-dashboard';
      }`);

// Also we need to make sure 'emp-dashboard' is in the pageTitles
c = c.replace("dashboard: 'ড্যাশবোর্ড',", "dashboard: 'ড্যাশবোর্ড', 'emp-dashboard': 'ড্যাশবোর্ড',");

// And ensure refreshPage calls refreshAttendanceDashboard for emp-dashboard
c = c.replace(/case 'dashboard': refreshDashboard\(\); break;/, "case 'dashboard': refreshDashboard(); break;\n        case 'emp-dashboard': refreshAttendanceDashboard(); break;");
// Remove the call from attendance case so it doesn't double run or run wrongly
c = c.replace(/if \(currentUser\?\.role !== 'admin'\) refreshAttendanceDashboard\(\);/, "");

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Fixed CSS and separated pages.');
