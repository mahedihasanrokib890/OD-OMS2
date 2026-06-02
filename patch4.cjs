const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const leafletLogic = `
let globalLiveMap = null;
let globalMarkers = [];

async function refreshLiveLocation() {
  const dateStr = document.getElementById('liveLocDate').value || today();
  document.getElementById('liveLocDate').value = dateStr;
  const empId = document.getElementById('liveLocEmp').value;
  
  // Populate employees dropdown if empty
  if (document.getElementById('liveLocEmp').options.length <= 1) {
    const { data: emps } = await sb.from('profiles').select('id, full_name, employee_type_id').order('full_name');
    if (emps) {
      let opts = '<option value="all">সব এমপ্লয়ী</option>';
      emps.forEach(e => {
        opts += \`<option value="\${e.id}">\${e.full_name} (\${e.employee_type_id||''})</option>\`;
      });
      document.getElementById('liveLocEmp').innerHTML = opts;
      document.getElementById('liveLocEmp').value = empId;
    }
  }

  // Fetch Attendance Data
  let query = sb.from('attendance').select('*, profiles!user_id(full_name)').eq('date', dateStr);
  if (empId !== 'all') query = query.eq('user_id', empId);
  const { data: atts } = await query;
  
  if (!atts) return;

  initLiveMap();
  
  // Clear existing markers & lines
  globalMarkers.forEach(m => globalLiveMap.removeLayer(m));
  globalMarkers = [];
  
  const tlEl = document.getElementById('routeTimeline');
  tlEl.innerHTML = '';
  
  if (atts.length === 0) {
    tlEl.innerHTML = '<div style="color:var(--gray-500); padding:10px;">কোনো ডাটা নেই</div>';
    return;
  }

  const events = [];
  const eventTypes = [
    { key: 'check_in', label: 'চেক-ইন', color: '#8b5cf6' },
    { key: 'personal_out', label: 'পার্সোনাল আউট', color: '#f59e0b' },
    { key: 'personal_in', label: 'পার্সোনাল ইন', color: '#10b981' },
    { key: 'lunch_out', label: 'লাঞ্চ বিরতি', color: '#f59e0b' },
    { key: 'lunch_in', label: 'ফিরে এসেছেন (লাঞ্চ)', color: '#10b981' },
    { key: 'check_out', label: 'চেক-আউট', color: '#ef4444' }
  ];

  atts.forEach(r => {
    eventTypes.forEach(type => {
      const timeVal = r[type.key];
      const locVal = r[type.key + '_loc'];
      if (timeVal) {
        events.push({
          emp: r.profiles?.full_name || 'Unknown',
          time: new Date(timeVal).getTime(),
          timeStr: timeVal,
          label: type.label,
          color: type.color,
          loc: locVal
        });
      }
    });
  });

  events.sort((a,b) => a.time - b.time);

  let tlHTML = '';
  const latLngs = [];

  events.forEach(ev => {
    let locText = 'লোকেশন পাওয়া যায়নি';
    let hasLoc = false;
    if (ev.loc && !ev.loc.startsWith('Not') && !ev.loc.startsWith('Fail') && !ev.loc.startsWith('Error')) {
      const [lat, lng] = ev.loc.split(',');
      hasLoc = true;
      locText = \`\${parseFloat(lat).toFixed(4)}, \${parseFloat(lng).toFixed(4)}\`;
      
      const pt = [parseFloat(lat), parseFloat(lng)];
      latLngs.push(pt);
      
      // Add Marker
      const circleMarker = L.circleMarker(pt, {
        color: ev.color,
        fillColor: ev.color,
        fillOpacity: 1,
        radius: 6
      }).bindTooltip(\`<b>\${ev.emp}</b><br>\${ev.label} - \${formatBnTimeSec(ev.timeStr)}\`).addTo(globalLiveMap);
      globalMarkers.push(circleMarker);
    }
    
    tlHTML += \`
      <div style="position:relative; margin-bottom:20px;">
        <div style="position:absolute; left:-25px; top:4px; width:10px; height:10px; border-radius:50%; background:\${ev.color};"></div>
        <div style="font-size:12px; color:var(--gray-500); margin-bottom:2px;">\${formatBnTimeSec(ev.timeStr)} — <b>\${ev.emp}</b></div>
        <div style="font-size:14px; font-weight:600; color:var(--gray-800);">\${ev.label}</div>
        <div style="font-size:12px; color:var(--gray-400); margin-top:2px;">
          <i class="fa-solid fa-location-dot"></i> \${locText}
        </div>
      </div>
    \`;
  });

  tlEl.innerHTML = tlHTML || '<div style="color:var(--gray-500); padding:10px;">কোনো ইভেন্ট নেই</div>';

  if (latLngs.length > 0) {
    if (latLngs.length > 1 && empId !== 'all') {
      const polyline = L.polyline(latLngs, {color: '#8b5cf6', weight: 3, opacity: 0.6}).addTo(globalLiveMap);
      globalMarkers.push(polyline);
    }
    globalLiveMap.fitBounds(L.latLngBounds(latLngs), {padding: [50, 50]});
  }
}

function initLiveMap() {
  if (globalLiveMap) return;
  // Initialize Leaflet Map
  globalLiveMap = L.map('liveMap').setView([23.8103, 90.4125], 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(globalLiveMap);
}
`;

html = html.replace('</script>\r\n<script src="payroll_onboarding.js">', leafletLogic + '\r\n</script>\r\n<script src="payroll_onboarding.js">');
html = html.replace('</script>\n<script src="payroll_onboarding.js">', leafletLogic + '\n</script>\n<script src="payroll_onboarding.js">');

fs.writeFileSync('index.html', html);
console.log('Leaflet logic injected');
