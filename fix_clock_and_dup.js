const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

c = c.replace("['dashClock', 'attClock', 'empDashClock']", "['dashClock', 'attClock', 'empDashClock', 'attBigClock']");
c = c.replace("['dashDate', 'attDate', 'empDashDate']", "['dashDate', 'attDate', 'empDashDate', 'attBigDate']");

const attStart = c.indexOf('<div class="page-section" id="page-attendance">');
const stripStart = c.indexOf("<!-- Today's Status Strip -->", attStart);
const actionStart = c.indexOf('<!-- Action Buttons -->', stripStart);

if (stripStart > -1 && actionStart > -1 && stripStart < actionStart) {
    c = c.substring(0, stripStart) + c.substring(actionStart);
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Fixed clock JS and removed duplicate strip from attendance');
