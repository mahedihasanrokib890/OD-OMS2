const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const clockHTML = `
          <!-- Giant Clock Widget -->
          <div class="clock-widget emp-only">
            <h1 id="attBigClock" style="font-size: 64px; font-weight: 900; color: var(--purple-700); margin: 0; font-variant-numeric: tabular-nums; letter-spacing: 2px;">00:00:00</h1>
            <div id="attBigDate" style="color: var(--slate-600); font-size: 18px; margin-top: 5px; font-weight: 600;"></div>
          </div>
`;

let attIdx = c.indexOf('<div class="page-section" id="page-attendance">');
let stripIdx = c.indexOf("<!-- Today's Status Strip -->", attIdx);

if (attIdx > -1 && stripIdx > -1) {
    c = c.substring(0, stripIdx) + clockHTML + '\n          ' + c.substring(stripIdx);
}

const jsTarget = "document.getElementById('attDate').textContent = d.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });";
const jsReplace = jsTarget + `
        const bigClock = document.getElementById('attBigClock');
        const bigDate = document.getElementById('attBigDate');
        if (bigClock) bigClock.textContent = document.getElementById('attClock').textContent;
        if (bigDate) bigDate.textContent = document.getElementById('attDate').textContent;
`;
c = c.replace(jsTarget, jsReplace);

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Added big clock back');
