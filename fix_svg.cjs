const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find markers using simpler patterns
const startMarker = '<!-- Admin Hero Banner -->';
const endMarker = '// ═══ EMPLOYEE DASHBOARD ═══';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1) { console.error('Start marker not found'); process.exit(1); }
if (endIdx === -1) { console.error('End marker not found'); process.exit(1); }

// Go back to the "return `" before the start marker
let returnIdx = html.lastIndexOf('return `', startIdx);
if (returnIdx === -1) { console.error('return backtick not found'); process.exit(1); }

// Find the end of the template literal (the `; before EMPLOYEE DASHBOARD)
// We need to find the closing backtick+semicolon before the employee section
let closingIdx = html.lastIndexOf('`;', endIdx);
if (closingIdx === -1) { console.error('closing backtick not found'); process.exit(1); }
closingIdx += 2; // include `; itself

// Find where "}" and blank lines end before EMPLOYEE DASHBOARD
let afterClosing = closingIdx;
// Skip whitespace and closing brace
let remaining = html.substring(afterClosing, endIdx);
let braceEnd = remaining.indexOf('}');
if (braceEnd !== -1) {
  afterClosing += braceEnd + 1;
}

console.log('Return at:', returnIdx);
console.log('Closing at:', closingIdx);
console.log('After closing at:', afterClosing);

const newDashboard = `return \`
      <!-- Admin Hero Banner (clean) -->
      <div style="background:linear-gradient(135deg,#2d1b69 0%,#5b2d8a 40%,#c2185b 100%);color:white;padding:28px 32px;border-radius:20px;margin-bottom:24px;position:relative;overflow:hidden;box-shadow:0 16px 48px rgba(91,45,138,.3)">
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 70%);border-radius:50%"></div>
        <div style="position:relative;z-index:1">
          <div style="font-size:12px;font-weight:700;opacity:.7;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🛡️ Admin Control Panel</div>
          <h1 style="font-size:24px;font-weight:800;margin-bottom:6px;line-height:1.3">আস্সালামু আলাইকুম, \${name}! 👋</h1>
          <p style="opacity:.8;font-size:14px;margin:0">\${dayName(today())}, \${formatBnDate(today())}</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:20px">
        <div class="stat-card" onclick="navigate('employees')" style="cursor:pointer;border-left:4px solid var(--purple-500)">
          <div class="stat-icon purple"><i class="fa-solid fa-users"></i></div>
          <h3 class="num">\${bnDigits(stats.totalEmp)}</h3><p>মোট সক্রিয় কর্মী</p>
        </div>
        <div class="stat-card" onclick="navigate('attendance')" style="cursor:pointer;border-left:4px solid var(--emerald-500)">
          <div class="stat-icon emerald"><i class="fa-solid fa-circle-check"></i></div>
          <h3 class="num">\${bnDigits(stats.todayPresent)}</h3><p>আজ উপস্থিত (\${bnDigits(attRate)}%)</p>
        </div>
        <div class="stat-card" style="border-left:4px solid var(--red-500)">
          <div class="stat-icon" style="background:linear-gradient(135deg,#f87171,#dc2626)"><i class="fa-solid fa-clock"></i></div>
          <h3 class="num">\${bnDigits(lateCount)}</h3><p>আজ লেট</p>
        </div>
        <div class="stat-card" style="border-left:4px solid var(--amber-500)">
          <div class="stat-icon amber"><i class="fa-solid fa-umbrella-beach"></i></div>
          <h3 class="num">\${bnDigits(stats.todayOnLeave)}</h3><p>আজ ছুটিতে</p>
        </div>
        <div class="stat-card" onclick="navigate('inbox')" style="cursor:pointer;border-left:4px solid var(--pink-500)">
          <div class="stat-icon pink"><i class="fa-solid fa-inbox"></i></div>
          <h3 class="num">\${bnDigits(stats.pendingLeaves)}</h3><p>অপেক্ষমাণ আবেদন</p>
        </div>
      </div>

      <!-- Quick Actions (inside a card) -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-title"><span><i class="fa-solid fa-bolt"></i> দ্রুত কার্যক্রম</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;padding:4px 0">
          <div class="quick-action" onclick="openMarkOthersAttendance()">
            <div class="qa-icon emerald"><i class="fa-solid fa-clipboard-check"></i></div>
            <div><span style="font-weight:800;font-size:13px">এটেন্ডেন্স</span><br><small style="color:var(--gray-400);font-size:11px">মার্ক করুন</small></div>
          </div>
          <div class="quick-action" onclick="openEmployeeModal()">
            <div class="qa-icon"><i class="fa-solid fa-user-plus"></i></div>
            <div><span style="font-weight:800;font-size:13px">নতুন কর্মী</span><br><small style="color:var(--gray-400);font-size:11px">যোগ করুন</small></div>
          </div>
          <div class="quick-action" onclick="openNoticeModal()">
            <div class="qa-icon pink"><i class="fa-solid fa-bullhorn"></i></div>
            <div><span style="font-weight:800;font-size:13px">নোটিশ</span><br><small style="color:var(--gray-400);font-size:11px">পোস্ট করুন</small></div>
          </div>
          <div class="quick-action" onclick="navigate('reports')">
            <div class="qa-icon amber"><i class="fa-solid fa-chart-line"></i></div>
            <div><span style="font-weight:800;font-size:13px">রিপোর্ট</span><br><small style="color:var(--gray-400);font-size:11px">বিশ্লেষণ দেখুন</small></div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="card-grid" style="margin-bottom:18px">
        <div class="card">
          <div class="card-title"><span><i class="fa-solid fa-chart-pie"></i> আজকের হাজিরা</span>
            <span style="font-size:12px;color:var(--gray-400)">\${formatBnDate(today())}</span>
          </div>
          <div style="position:relative;height:220px"><canvas id="dashTodayChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title"><span><i class="fa-solid fa-chart-line"></i> সাপ্তাহিক ট্রেন্ড</span></div>
          <div style="position:relative;height:220px"><canvas id="dashWeekChart"></canvas></div>
        </div>
      </div>

      <!-- Bottom cards -->
      <div class="card-grid">
        <div class="card">
          <div class="card-title"><span><i class="fa-solid fa-bullhorn"></i> সাম্প্রতিক নোটিশ</span><button class="btn btn-outline btn-sm" onclick="navigate('notices')">সব দেখুন</button></div>
          <div id="dashRecentNotices"><div style="padding:20px;text-align:center;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
        </div>
        <div class="card">
          <div class="card-title"><span><i class="fa-solid fa-clock-rotate-left"></i> অপেক্ষমাণ ছুটি</span><button class="btn btn-outline btn-sm" onclick="navigate('inbox')">ইনবক্স</button></div>
          <div id="dashPendingLeaves"><div style="padding:20px;text-align:center;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
        </div>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="card-title"><span><i class="fa-solid fa-bolt"></i> সাম্প্রতিক কার্যক্রম</span></div>
        <div id="dashActivity"><div style="padding:20px;text-align:center;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin"></i></div></div>
      </div>
    \`;
  }

  `;

html = html.substring(0, returnIdx) + newDashboard + html.substring(endIdx);
fs.writeFileSync('index.html', html);
console.log('Dashboard replaced successfully!');
