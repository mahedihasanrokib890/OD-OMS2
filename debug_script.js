const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');
let s = c.indexOf('<div class="page-section" id="page-attendance">');
let e = c.indexOf('<!-- ═══ NOTICE BOARD ═══ -->');
fs.writeFileSync('e:\\New project 2\\debug_att.html', c.substring(s, e), 'utf8');
