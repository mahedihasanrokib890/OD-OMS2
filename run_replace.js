const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const s = c.indexOf('function refreshEmpDashboard() {');
const eFinal = c.indexOf('function loadNotices');
if (e === -1) {
    var e_alt = c.indexOf('// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n    // NOTICES');
}

const eFinal = (e !== -1) ? e : e_alt;

if (s > -1 && eFinal > -1) {
    let n = fs.readFileSync('e:\\New project 2\\update_dash.js', 'utf8');
    let nf = n.substring(n.indexOf('function refreshAttendanceDashboard'), n.lastIndexOf('}    ') + 1);
    
    let nc = c.substring(0, s) + nf + '\n\n    ' + c.substring(eFinal);
    fs.writeFileSync('e:\\New project 2\\index.html', nc, 'utf8');
    console.log('Replaced function successfully.');
} else {
    console.log('s:', s, 'eFinal:', eFinal);
}

