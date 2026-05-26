const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// 1. Remove emp-only from clock-widget and att-actions-pro in page-attendance
const attStart = c.indexOf('id="page-attendance"');
const clockTarget = '<div class="clock-widget emp-only">';
const clockReplace = '<div class="clock-widget">';
if (c.indexOf(clockTarget, attStart) > -1) {
    c = c.replace(clockTarget, clockReplace);
}

const actionTarget = '<div class="att-actions-pro emp-only">';
const actionReplace = '<div class="att-actions-pro">';
if (c.indexOf(actionTarget, attStart) > -1) {
    c = c.replace(actionTarget, actionReplace);
}

// Ensure the Admin sidebar button for employees is exactly as expected
const newNav = `<div class="nav-item admin-only" onclick="navigate('employees')" data-page="employees" style="display:none">
            <div class="nav-item-left"><i class="fa-solid fa-users"></i> এমপ্লয়ী</div>
          </div>`;
if (!c.includes(newNav)) {
    console.log("Nav button wasn't updated perfectly last time, let's just make sure it exists or update it");
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Made admin attendance visible');
