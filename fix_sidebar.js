const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const targetStr = "n.classList.toggle('active', n.dataset.page === page);";
const replacementStr = `let matchPage = (page === 'emp-dashboard') ? 'dashboard' : page;
        n.classList.toggle('active', n.dataset.page === matchPage);`;

c = c.replace(targetStr, replacementStr);

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Sidebar navigation fixed.');
