const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Leaflet CSS/JS before </head>
if (!html.includes('leaflet.css')) {
  const leafletTags = `
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
</head>`;
  html = html.replace('</head>', leafletTags);
  console.log('Leaflet added');
}

// 2. Add menu item "লাইভ লোকেশন"
if (!html.includes('data-route="live_location"')) {
  const menuHTML = `
      <div class="nav-item admin-only" data-route="live_location" onclick="navigate('live_location')">
        <span class="nav-item-left"><i class="fa-solid fa-map-location-dot"></i> লাইভ লোকেশন</span>
      </div>`;
  html = html.replace('<div class="nav-item admin-only" data-route="recruitment" onclick="navigate(\'recruitment\')">', menuHTML + '\n        <div class="nav-item admin-only" data-route="recruitment" onclick="navigate(\'recruitment\')">');
  console.log('Menu item added');
}

// 3. Add to routes object and navigate function
if (!html.includes('live_location: document.getElementById(\'pageLiveLocation\')')) {
  html = html.replace('expenses: document.getElementById(\'pageExpenses\'),', 'expenses: document.getElementById(\'pageExpenses\'),\n    live_location: document.getElementById(\'pageLiveLocation\'),');
  
  html = html.replace('if (route === \'expenses\') refreshExpense();', 'if (route === \'expenses\') refreshExpense();\n  if (route === \'live_location\') refreshLiveLocation();');
  console.log('Routes added');
}

// 4. Add page HTML before </main>
if (!html.includes('id="pageLiveLocation"')) {
  const pageHTML = `
  <!-- LIVE LOCATION PAGE -->
  <div id="pageLiveLocation" class="page" style="display:none;">
    <div class="page-header">
      <div class="page-title">লাইভ লোকেশন এবং হিস্টোরি</div>
      <div class="page-actions">
        <input type="date" id="liveLocDate" class="input-field" value="" onchange="refreshLiveLocation()" style="width:150px">
        <select id="liveLocEmp" class="input-field" style="width:200px" onchange="refreshLiveLocation()">
          <option value="all">সব এমপ্লয়ী</option>
        </select>
        <button class="btn btn-primary" onclick="refreshLiveLocation()"><i class="fa-solid fa-rotate-right"></i> রিফ্রেশ</button>
      </div>
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
  </div>
  `;
  html = html.replace('</main>', pageHTML + '\n</main>');
  console.log('Page HTML added');
}

// 5. Update markAttendance to capture ALL locations
// Find the markAttendance block inside the script
const start = html.indexOf('async function markAttendance(type) {');
const end = html.indexOf('async function refreshAttendanceList() {');
if (start > -1 && end > start) {
  let markAtt = html.substring(start, end);
  
  // Replace the location logic constraint
  markAtt = markAtt.replace("if (type === 'check_in' || type === 'check_out') {", "if (true) { // Capture for all types");
  markAtt = markAtt.replace("if (locString) payload.check_in_loc = locString;", "if (locString) payload[type + '_loc'] = locString;");
  markAtt = markAtt.replace("if (locString) payload.check_out_loc = locString;", ""); // Removed specific constraint since handled by above
  
  // Actually, wait, let's just replace the entire function to be absolutely sure.
  const fullMarkAtt = `async function markAttendance(type) {
  if (!App.user) return showToast('লগইন করুন', 'error');
  
  let locString = null;
  try {
    showToast('📍 লোকেশন চেক করা হচ্ছে...', 'warning');
    locString = await new Promise((resolve) => {
      if (!navigator.geolocation) resolve('Not Supported');
      else navigator.geolocation.getCurrentPosition(
        pos => resolve(\`\${pos.coords.latitude},\${pos.coords.longitude}\`),
        err => resolve(\`Error: \${err.message}\`),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  } catch(e) {
    locString = 'Failed';
  }

  const labels = {
    check_in:    'অফিস ইন',
    check_out:   'অফিস আউট',
    lunch_out:   'লাঞ্চ আউট',
    lunch_in:    'লাঞ্চ ইন',
    personal_out:'পার্সোনাল ব্রেক শুরু',
    personal_in: 'পার্সোনাল ব্রেক শেষ'
  };
  const fields = {
    check_in:    'check_in',
    check_out:   'check_out',
    lunch_out:   'lunch_out',
    lunch_in:    'lunch_in',
    personal_out:'personal_out',
    personal_in: 'personal_in'
  };
  const now = new Date().toISOString();

  try {
    const { data: existing } = await sb.from('attendance').select('*').eq('user_id', App.user.id).eq('date', today()).maybeSingle();

    let payload, lateMinutes = 0, status = 'present';

    if (type === 'check_in') {
      const officeTime = await getMyOfficeTime();
      if (officeTime) {
        lateMinutes = computeLateMinutes(now, officeTime);
        if (lateMinutes > 0) status = 'late';
      }
    }

    if (existing) {
      payload = { ...existing, [fields[type]]: now, updated_at: now };
      if (locString) payload[type + '_loc'] = locString; // Map whatever type it is
      
      if (type === 'check_in') { 
          payload.late_minutes = lateMinutes; 
          payload.status = status; 
      }
      // Calc total hours when check_out
      if (type === 'check_out' && existing.check_in) {
        let ms = new Date(now) - new Date(existing.check_in);
        if (existing.lunch_out && (existing.lunch_in || type === 'lunch_in')) {
          const lIn = payload.lunch_in || existing.lunch_in;
          ms -= (new Date(lIn) - new Date(existing.lunch_out));
        }
        if (existing.personal_out && (existing.personal_in || type === 'personal_in')) {
          const pIn = payload.personal_in || existing.personal_in;
          ms -= (new Date(pIn) - new Date(existing.personal_out));
        }
        payload.total_hours = Math.round((ms / 3600000) * 100) / 100;
      }
      // Calc personal_minutes when personal_in is marked
      if (type === 'personal_in' && existing.personal_out) {
        const mins = Math.floor((new Date(now) - new Date(existing.personal_out)) / 60000);
        payload.personal_minutes = (existing.personal_minutes || 0) + mins;
      }
      const { error } = await sb.from('attendance').update(payload).eq('id', existing.id);
      if (error) throw error;
    } else {
      payload = {
        user_id: App.user.id, date: today(), [fields[type]]: now,
        status: type === 'check_in' ? status : 'present',
        late_minutes: type === 'check_in' ? lateMinutes : 0
      };
      if (locString) payload[type + '_loc'] = locString;
      
      const { error } = await sb.from('attendance').insert(payload);
      if (error) throw error;
    }

    showToast('✅ ' + labels[type] + ' সফল হয়েছে!');
    checkTodayAttendance();
    refreshAttendanceList(); // Refresh admin list if open
  } catch (err) {
    showToast('❌ সমস্যা হয়েছে: ' + err.message, 'error');
  }
}
`;
  html = html.substring(0, start) + fullMarkAtt + html.substring(end);
  console.log('markAttendance updated');
}

fs.writeFileSync('index.html', html);
console.log('Done.');
