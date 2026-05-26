const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const attIdx = c.indexOf('<div class="page-section" id="page-attendance">');
// Let's make absolutely sure we add a closing </div> for the previous section
c = c.substring(0, attIdx) + '        </div>\n        ' + c.substring(attIdx);

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Force fixed missing div');
