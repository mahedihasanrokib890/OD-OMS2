const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');
let s = c.indexOf('clock-widget');
console.log(c.substring(s - 50, s + 500));
