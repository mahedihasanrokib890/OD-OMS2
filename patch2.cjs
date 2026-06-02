const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fn = `
window.showLocationMap = function(coords, empName) {
  const [lat, lng] = coords.split(',');
  const mapUrl = 'https://maps.google.com/maps?q=' + lat + ',' + lng + '&t=&z=15&ie=UTF8&iwloc=&output=embed';
  showModal(
    '<i class="fa-solid fa-map-location-dot" style="color:#ef4444"></i> ' + escapeHtml(empName||'এমপ্লয়ি') + '-এর লাইভ লোকেশন',
    '<div style="width:100%; height:400px; border-radius:8px; overflow:hidden;"><iframe src="' + mapUrl + '" width="100%" height="100%" frameborder="0" style="border:0;"></iframe></div>',
    '<button class="btn btn-outline" onclick="closeModal()">বন্ধ করুন</button>'
  );
}
</script>`;

html = html.replace('</script>\r\n<script src="payroll_onboarding.js">', fn + '\r\n<script src="payroll_onboarding.js">');
html = html.replace('</script>\n<script src="payroll_onboarding.js">', fn + '\n<script src="payroll_onboarding.js">');

fs.writeFileSync('index.html', html);
console.log('Done.');
