const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// The original match for Employee Directory in Sidebar:
// <div class="nav-item" onclick="navigate('employees')" data-page="employees">
//   <div class="nav-item-left"><i class="fa-solid fa-users"></i> এমপ্লয়ী ডিরেক্টরি</div>
// </div>

const targetRegex = /<div class="nav-item"\s+onclick="navigate\('employees'\)"\s+data-page="employees">\s*<div class="nav-item-left"><i class="fa-solid fa-users"><\/i>\s*এমপ্লয়ী ডিরেক্টরি<\/div>\s*<\/div>/;

const newNav = `<div class="nav-item admin-only" onclick="navigate('employees')" data-page="employees" style="display:none">
            <div class="nav-item-left"><i class="fa-solid fa-users"></i> এমপ্লয়ী</div>
          </div>`;

if (targetRegex.test(c)) {
    c = c.replace(targetRegex, newNav);
    console.log("Replaced nav button via regex!");
} else {
    console.log("Still didn't match. Nav might already be modified.");
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
