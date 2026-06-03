const fs = require('fs');
let h = fs.readFileSync('index.html','utf8');
h = h.replace('checkTodayAttendance();\n    refreshAttendanceList(); // Refresh admin list if open', `refreshTodayClockStatus();
    if (App.currentPage === 'attendance') refreshAttendanceList();
    if (App.currentPage === 'dashboard') loadDashboardLists();`);
fs.writeFileSync('index.html', h);
console.log('Fixed function calls');
