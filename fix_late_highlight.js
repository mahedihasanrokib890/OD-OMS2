const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const targetFunctionStart = c.indexOf("tbody.innerHTML = dayAtt.map(a => {");
if (targetFunctionStart === -1) {
    console.log("Could not find start");
    process.exit(1);
}

const targetFunctionEnd = c.indexOf("}).join('');", targetFunctionStart);

let originalMap = c.substring(targetFunctionStart, targetFunctionEnd);

// We need to inject the late logic inside the map
const newMap = `tbody.innerHTML = dayAtt.map(a => {
        const typeName = getUserTypeName(a.empType);
        const timing = getTypeTimings(a.empType);
        
        const isLateIn = a.check_in && a.check_in > timing.in + ':00';
        const isLateLunchIn = a.lunch_in && a.lunch_in > timing.lin + ':00';

        let statusLabel = a.status === 'present' ? 'উপস্থিত' : a.status === 'late' ? 'বিলম্বিত' : a.status;
        if (isLateIn || isLateLunchIn) statusLabel = 'বিলম্বিত'; // Ensure status shows late if lunch is late
        
        let statusColor = statusLabel === 'উপস্থিত' ? 'green' : statusLabel === 'বিলম্বিত' ? 'amber' : 'blue';
        if (isLateIn || isLateLunchIn) statusColor = 'red'; // Highlight deeply if strictly late
        
        const stats = calculateAttendanceStats(a, today);

        return \`
          <tr style="transition: all 0.2s">
            <td>
              <div style="font-weight:700;color:var(--slate-800);margin-bottom:4px">\${a.employee_name || '-'}</div>
              <div style="font-size:11px;color:var(--slate-500)">\${typeName}</div>
            </td>
            <td style="font-family:var(--font-en);font-size:13px">\${a.check_in ? \`<span class="badge \${isLateIn ? 'badge-red' : 'badge-green'}" style="background:\${isLateIn ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'};color:\${isLateIn ? 'var(--red-600)' : 'var(--emerald-600)'}">\${a.check_in}</span>\` : '-'}</td>
            <td style="font-family:var(--font-en);font-size:13px">\${a.lunch_out ? \`<span class="badge" style="background:var(--slate-100);color:var(--slate-600)">\${a.lunch_out}</span>\` : '-'}</td>
            <td style="font-family:var(--font-en);font-size:13px">\${a.lunch_in ? \`<span class="badge \${isLateLunchIn ? 'badge-red' : ''}" style="background:\${isLateLunchIn ? 'rgba(239,68,68,0.1)' : 'var(--slate-100)'};color:\${isLateLunchIn ? 'var(--red-600)' : 'var(--slate-600)'}">\${a.lunch_in}</span>\` : '-'}</td>
            <td style="font-family:var(--font-en);font-size:13px">\${a.check_out ? \`<span class="badge badge-pink" style="background:rgba(236,72,153,0.1);color:var(--pink-600)">\${a.check_out}</span>\` : '-'}</td>
            <td>\${stats.workStr}</td>
            <td>\${stats.breakStr}</td>
            <td>\${stats.lateStr}</td>
            <td><span class="badge badge-\${statusColor}">\${statusLabel}</span></td>
          </tr>
        \`;`;

c = c.substring(0, targetFunctionStart) + newMap + c.substring(targetFunctionEnd);

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log("Updated late highlighting logic in attendance table");
