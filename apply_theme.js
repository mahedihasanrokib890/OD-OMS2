const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// 1. Update CSS
const newCSS = `
    /* ── Pro Employee Cards ── */
    .employee-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .pro-employee-card {
      background: white; border-radius: 16px; padding: 25px 20px;
      text-align: center; border: 1px solid var(--purple-100);
      box-shadow: 0 4px 15px rgba(99,42,126,0.05);
      transition: all 0.3s ease; display: flex; flex-direction: column;
      align-items: center; justify-content: space-between; gap: 15px;
    }
    .pro-employee-card:hover {
      transform: translateY(-5px); box-shadow: 0 8px 25px rgba(99,42,126,0.12);
      border-color: var(--purple-300);
    }
    .pro-avatar {
      width: 75px; height: 75px; border-radius: 50%;
      background: white; border: 2px solid var(--purple-700);
      display: flex; align-items: center; justify-content: center;
      color: var(--purple-700); font-size: 32px; font-weight: 800;
      box-shadow: 0 4px 12px rgba(99,42,126,0.15);
      overflow: hidden;
    }
    .pro-avatar-img {
      width: 75px; height: 75px; border-radius: 50%;
      object-fit: cover; border: 2px solid var(--purple-700);
    }
    .pro-emp-info h4 {
      font-size: 16px; font-weight: 800; color: var(--slate-800); margin-bottom: 5px;
    }
    .pro-emp-info p {
      font-size: 13px; color: var(--slate-500);
    }
    .pro-emp-btn {
      background: var(--purple-700); color: white; border: none;
      padding: 8px 24px; border-radius: 50px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: all 0.3s;
    }
    .pro-emp-btn:hover {
      background: var(--purple-800); transform: scale(1.05);
    }
`;

// Replace old CSS block with new one
const cssStart = c.indexOf('/* ── Pro Employee Cards ── */');
const cssEnd = c.indexOf('</style>', cssStart);
if (cssStart > -1 && cssEnd > -1) {
    c = c.substring(0, cssStart) + newCSS + c.substring(cssEnd);
}

// 2. Update JS to hide filters and use the new default avatar
const loadEmpRegex = /function loadEmployees.*?function showAddEmployeeModal/s;
const newLoadEmployees = `function loadEmployees(filter = 'all') {
      const users = DB.get('users') || [];
      const grid = document.getElementById('employeeGrid');
      
      const typeList = document.getElementById('empTypeList');
      if (typeList) typeList.innerHTML = ''; // Hide filter tags

      if (users.length === 0) {
        grid.innerHTML = \`<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-user-group"></i><h3>কোনো এমপ্লয়ী নেই</h3></div>\`;
        return;
      }
      
      const toBn = n => {
          const bd = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
          return n.toString().split('').map(d => bd[d] || d).join('');
      };

      grid.innerHTML = users.map((u, idx) => {
        let avatarHTML = '';
        if (u.photo) {
            avatarHTML = \`<img src="\${u.photo}" class="pro-avatar-img">\`;
        } else {
            // Default avatar: Silhouette icon in OrdhekDeen purple theme
            avatarHTML = \`<div class="pro-avatar"><i class="fa-solid fa-user-tie"></i></div>\`;
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
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Update successful');
