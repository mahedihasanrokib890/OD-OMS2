const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newLogic = `  let locString = null;
  try {
    showToast('📍 লোকেশন চেক করা হচ্ছে...', 'warning');
    locString = await new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject('Not Supported');
      else navigator.geolocation.getCurrentPosition(
        pos => resolve(\`\${pos.coords.latitude},\${pos.coords.longitude}\`),
        err => reject(err),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  } catch(e) {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        locString = \`\${data.latitude},\${data.longitude}\`;
      } else {
        locString = 'Failed';
      }
    } catch(ipErr) {
      locString = 'Failed';
    }
  }`;

const oldLogicRegex = /let locString = null;[\s\S]*?\} catch\(e\) \{\s*locString = 'Failed';\s*\}/;
html = html.replace(oldLogicRegex, newLogic);
fs.writeFileSync('index.html', html);
console.log('Fallback added');
