const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// Find the strip
const stripStart = c.indexOf("<!-- Today's Status Strip -->");
const actionsEnd = c.indexOf('<!-- Stats & Info Row -->');

if (stripStart > -1 && actionsEnd > -1) {
    let toMove = c.substring(stripStart, actionsEnd);
    
    // Remove it from dashboard
    c = c.substring(0, stripStart) + c.substring(actionsEnd);
    
    // Find page-attendance
    const attPageStart = c.indexOf('<div class="page-section" id="page-attendance">');
    const tableStart = c.indexOf('<!-- Attendance History Table -->', attPageStart);
    
    if (attPageStart > -1 && tableStart > -1) {
        // Insert it into page-attendance, right before the table
        c = c.substring(0, tableStart) + toMove + '\n          ' + c.substring(tableStart);
    }
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Moved attendance elements to page-attendance');
