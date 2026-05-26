const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// 1. ADD NEW CSS
const newCSS = `
    /* ── Pro Employee Cards ── */
    .employee-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .pro-employee-card {
      background: white; border-radius: 16px; padding: 25px 20px;
      text-align: center; border: 1px solid var(--border);
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      transition: all 0.3s ease; display: flex; flex-direction: column;
      align-items: center; justify-content: space-between; gap: 15px;
    }
    .pro-employee-card:hover {
      transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      border-color: #b79b5c;
    }
    .pro-avatar {
      width: 75px; height: 75px; border-radius: 20px;
      background: #171b26; border: 2px solid #b79b5c;
      display: flex; align-items: center; justify-content: center;
      color: #b79b5c; font-size: 28px; font-weight: 800;
      box-shadow: 0 4px 12px rgba(183,155,92,0.15);
    }
    .pro-avatar-img {
      width: 75px; height: 75px; border-radius: 20px;
      object-fit: cover; border: 2px solid #b79b5c;
    }
    .pro-emp-info h4 {
      font-size: 16px; font-weight: 800; color: #111; margin-bottom: 5px;
    }
    .pro-emp-info p {
      font-size: 13px; color: #555;
    }
    .pro-emp-btn {
      background: #1a2035; color: white; border: 1px solid #b79b5c;
      padding: 8px 24px; border-radius: 50px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.3s;
    }
    .pro-emp-btn:hover {
      background: #b79b5c; color: white;
    }
`;
if (!c.includes('.pro-employee-card')) {
    c = c.replace('</style>', newCSS + '\n</style>');
}

// 2. REPLACE renderEmployees logic
const toBengaliNumber = (num) => {
    const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().split('').map(d => bengaliDigits[d] || d).join('');
};

const oldRenderFuncStart = c.indexOf('grid.innerHTML = filtered.map(');
const oldRenderFuncEnd = c.indexOf("}).join('');", oldRenderFuncStart); // wait, it might be `.join('')`
// Let's use a regex to replace the grid.innerHTML assignment in loadEmployees
const renderRegex = /grid\.innerHTML\s*=\s*filtered\.map\([^;]+;\n/s;
// The existing is:
// grid.innerHTML = filtered.map(u => `
//   <div class="employee-card" onclick="viewProfile('${u.id}')">
//     ...
//   </div>
// `).join('');

// Let's safely replace loadEmployees function entirely
const loadEmpRegex = /function loadEmployees.*?function showAddEmployeeModal/s;

const newLoadEmployees = `function loadEmployees(filter = 'all') {
      const users = DB.get('users') || [];
      const empTypes = DB.get('empTypes') || [];
      const grid = document.getElementById('employeeGrid');
      
      const typeList = document.getElementById('empTypeList');
      typeList.innerHTML = \`
        <div class="emp-type-tag \${filter === 'all' ? 'active' : ''}" onclick="loadEmployees('all')">সবাই (\${users.length})</div>
        \${empTypes.map(t => \`
          <div class="emp-type-tag \${filter === t ? 'active' : ''}" onclick="loadEmployees('\${t}')">\${t} (\${users.filter(u => u.role === t.toLowerCase().replace(/\\s+/g,'-')).length})</div>
        \`).join('')}
      \`;

      let filtered = filter === 'all' ? users : users.filter(u => u.role === filter.toLowerCase().replace(/\\s+/g,'-'));

      if (filtered.length === 0) {
        grid.innerHTML = \`<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-user-group"></i><h3>কোনো এমপ্লয়ী নেই</h3></div>\`;
        return;
      }
      
      const toBn = n => {
          const bd = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
          return n.toString().split('').map(d => bd[d] || d).join('');
      };

      grid.innerHTML = filtered.map((u, idx) => {
        let avatarHTML = '';
        if (u.photo) {
            avatarHTML = \`<img src="\${u.photo}" class="pro-avatar-img">\`;
        } else {
            let inner = '';
            const r = (u.role || '').toLowerCase();
            if (r.includes('admin')) inner = '<i class="fa-solid fa-gear"></i>';
            else if (r.includes('dev')) inner = '<i class="fa-solid fa-code"></i>';
            else {
                const initials = (u.name || 'U').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                inner = \`<span>\${initials}</span>\`;
            }
            avatarHTML = \`<div class="pro-avatar">\${inner}</div>\`;
        }
        
        return \`
        <div class="pro-employee-card">
          \${avatarHTML}
          <div class="pro-emp-info">
            <h4>\${toBn(idx + 1)}. \${u.name}</h4>
            <p>\${getUserTypeName(u.role)}</p>
          </div>
          <button class="pro-emp-btn" onclick="viewProfile('\${u.id}')">বিস্তারিত দেখুন</button>
        </div>
      \`}).join('');
    }

    function showAddEmployeeModal`;

if (c.match(loadEmpRegex)) {
    c = c.replace(loadEmpRegex, newLoadEmployees);
    console.log("Updated loadEmployees successfully");
} else {
    console.log("Failed to find loadEmployees");
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
