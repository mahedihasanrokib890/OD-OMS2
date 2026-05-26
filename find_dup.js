const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');
let match1 = c.indexOf('<div class="att-actions-pro emp-only">');
let match2 = c.indexOf('<div class="att-actions-pro emp-only">', match1 + 1);
console.log('Match 1: ' + match1);
console.log('Match 2: ' + match2);
console.log(c.substring(match1 - 100, match1 + 50));
console.log('---');
console.log(c.substring(match2 - 100, match2 + 50));
