const fs = require('fs');
const path = 'e:\\New project 2\\index.html';
let content = fs.readFileSync(path, 'utf8');

const regex = /function refreshEmpDashboard\(\) \{[\s\S]*?(?=\/\/ ════════[\s\S]*?function loadNotices\(\) \{)/m;

if (!regex.test(content)) {
  console.log("Regex didn't match.");
  process.exit(1);
}

const newFunc = `function refreshAttendanceDashboard() {
      if (!currentUser || currentUser.role === 'admin') return;

      // Greeting
      const hr = new Date().getHours();
      const greeting = hr < 12 ? 'à¦¶à§à¦­à¦¸à¦•à¦¾à¦² à¦¦à¦¿à¦¨ à¦¶à§à¦°à§ à¦¹à§‹à¦• à¦¸à§à¦¨à§à¦¦à¦° à¦­à¦¾à¦¬à§‡ â˜€ï¸' : hr < 17 ? 'à¦¶à§à¦­à¦¦à§à¦ªà§à¦° à¦­à¦¾à¦²à§‹ à¦¥à¦¾à¦•à§à¦¨ à¦¸à¦¬ à¦¸à¦®à§Ÿ à¦¸à¦¾à¦¥à§‡ à¦†à¦›à¦¿ à¦¨à¦¸à¦¿à¦¬à¦¤ à¦­à¦¾à¦¬à§‡! âœ¨' : 'à¦¶à§à¦­à¦¸à¦¨à§à¦§à§à¦¯à¦¾! à¦†à¦œà§‡à¦° à¦¦à¦¿à¦¨ à¦¶à§‡à¦· à¦¹à¦¤à§‡ à¦šà¦²à¦²à§‹ ðŸŒ™';
      document.getElementById('attDashGreeting').textContent = greeting;
      document.getElementById('attDashName').textContent = currentUser.name;
      document.getElementById('attDashRole').textContent = getUserTypeName(currentUser.role) + (currentUser.designation ? ' â€” ' + currentUser.designation : '');
      document.getElementById('attDashAvatar').src = getAvatar(currentUser);

      // Date
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('attDate').textContent = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      // Today's attendance
      const att = DB.get('attendance_local') || [];
      const rec = att.find(a => a.user_id === currentUser.id && a.date === today);

      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || 'â€”'; };
      setVal('todayIn', rec?.check_in);
      setVal('todayLOut', rec?.lunch_out);
      setVal('todayLIn', rec?.lunch_in);
      setVal('todayOut', rec?.check_out);

      if (rec) {
        const stats = calculateAttendanceStats(rec, today);
        // Strip HTML tags for plain display
        const strip = html => { const t = document.createElement('div'); t.innerHTML = html; return t.textContent || 'â€”'; };
        setVal('todayWork', strip(stats.workStr));
        setVal('todayLate', strip(stats.lateStr));
      } else {
        setVal('todayWork', 'â€”');
        setVal('todayLate', 'â€”');
      }

      // Monthly stats
      const now = new Date();
      const monthStr = today.slice(0, 7); // 'YYYY-MM'
      const myAtt = att.filter(a => a.user_id === currentUser.id && a.date.startsWith(monthStr));
      const lateCount = myAtt.filter(a => a.status === 'late').length;
      const presentCount = myAtt.length;
      let totalWorkMins = 0;
      myAtt.forEach(a => {
        const s = calculateAttendanceStats(a, today);
        const inM = timeToMins(a.check_in);
        const outM = timeToMins(a.check_out);
        const brkM = (a.lunch_in && a.lunch_out) ? timeToMins(a.lunch_in) - timeToMins(a.lunch_out) : 0;
        if (inM && outM) totalWorkMins += (outM - inM) - brkM;
      });
      const leaves = DB.get('leaves') || [];
      const myLeaves = leaves.filter(l => l.uid === currentUser.id && l.status === 'Approved' && l.start.startsWith(monthStr)).length;

      document.getElementById('mStat1').textContent = en2bn(presentCount);
      document.getElementById('mStat2').textContent = en2bn(lateCount);
      document.getElementById('mStat3').textContent = en2bn(myLeaves);
      document.getElementById('mStat4').textContent = en2bn(Math.floor(totalWorkMins / 60));

      // Latest notices
      const notices = DB.get('notices') || [];
      const notEl = document.getElementById('attLatestNotices');
      if (notices.length === 0) {
        notEl.innerHTML = \`<div style="text-align:center;padding:20px;color:var(--slate-400)"><i class="fa-solid fa-inbox" style="font-size:28px;opacity:0.4;display:block;margin-bottom:8px"></i>à¦•à§‹à¦¨à§‹ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦¨à§‡à¦‡</div>\`;
      } else {
        notEl.innerHTML = notices.slice(-3).reverse().map(n => \`
          <div style="padding:12px 0;border-bottom:1px dashed var(--slate-100)">
            <div style="font-weight:700;font-size:14px;color:var(--slate-800);margin-bottom:2px">\${n.title}</div>
            <div style="font-size:12px;color:var(--slate-500)">\${n.date}</div>
          </div>
        \`).join('');
      }

      // Leave Status
      const leaveEl = document.getElementById('attLeaveStatus');
      const latestLeave = leaves.filter(l => l.uid === currentUser.id).pop();
      if (latestLeave) {
        let sc = latestLeave.status === 'Pending' ? 'var(--amber-500)' : latestLeave.status === 'Approved' ? 'var(--emerald-500)' : 'var(--red-500)';
        leaveEl.innerHTML = \`
          <div style="padding:12px 0;border-bottom:1px dashed var(--slate-100)">
            <div style="font-size:13px;font-weight:700">\${latestLeave.type} - <span style="color:\${sc}">\${latestLeave.status}</span></div>
            <div style="font-size:12px;color:var(--slate-500);margin-top:2px">\${latestLeave.start} à¦¥à§‡à¦•à§‡ \${latestLeave.end}</div>
          </div>
        \`;
      } else {
        leaveEl.innerHTML = \`<div style="text-align:center;padding:20px;color:var(--slate-400)">à¦•à§‹à¦¨à§‹ à¦›à§à¦Ÿà¦¿à¦° à¦†à¦¬à§‡à¦¦à¦¨ à¦¨à§‡à¦‡</div>\`;
      }
    }
    
    `;

content = content.replace(regex, newFunc);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully replaced refreshEmpDashboard with refreshAttendanceDashboard');


