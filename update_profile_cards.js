const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// We need to replace all `<div class="p-card" id="card-XX">` with `<div class="p-card collapsed" id="card-XX">` inside loadProfile
// AND replace all `<i class="fa-solid fa-minus"></i>` with `<i class="fa-solid fa-plus"></i>` for the toggleCard buttons.

// Let's grab the entire loadProfile function to operate on it safely.
const lpStart = c.indexOf('function loadProfile(userId) {');
const lpEnd = c.indexOf('function viewProfile(userId) {');

if (lpStart > -1 && lpEnd > -1) {
    let lpBody = c.substring(lpStart, lpEnd);
    
    // Make cards collapsed by default
    lpBody = lpBody.replace(/<div class="p-card" id="card-/g, '<div class="p-card collapsed" id="card-');
    // Change toggle button icon to plus initially
    lpBody = lpBody.replace(/title="লুকান\/দেখান"><i class="fa-solid fa-minus"><\/i>/g, 'title="লুকান/দেখান"><i class="fa-solid fa-plus"></i>');
    
    // Add performance card!
    const perfCard = `
          <div class="p-card collapsed" id="card-j2">
            <div class="p-card-header">
              <h3>পারফরম্যান্স (Performance)</h3>
              <div class="p-card-actions">
                <button class="p-card-btn" onclick="toggleCard('card-j2')" title="লুকান/দেখান"><i class="fa-solid fa-plus"></i></button>
              </div>
            </div>
            <div class="p-card-body">
              <table class="p-table">
                <tr><td>উপস্থিতির হার (Attendance Rate)</td><td><strong>98%</strong> <span style="color:var(--green-600); font-size:12px;"><i class="fa-solid fa-arrow-trend-up"></i> Excellent</span></td></tr>
                <tr><td>সময়ের প্রতি নিয়মানুবর্তিতা (Punctuality)</td><td><strong>95%</strong></td></tr>
                <tr><td>টাস্ক সম্পন্ন (Tasks Completed)</td><td><strong>42</strong> (চলতি মাসে)</td></tr>
                <tr><td>ওভারল রেটিং (Overall Rating)</td><td><span style="color:#fbbf24;"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></span> <strong>4.8/5</strong></td></tr>
              </table>
              <div style="margin-top: 15px; padding: 10px; background: rgba(99,42,126,0.05); border-radius: 8px; font-size: 13px; color: var(--slate-600);">
                <i class="fa-solid fa-quote-left" style="color:var(--purple-400)"></i> খুব ভালো কাজ করছেন। ডেডলাইন সবসময় মেইনটেইন করেন এবং টিমকে অনেক সাহায্য করেন। - <em>HR Note</em>
              </div>
            </div>
          </div>
    `;
    
    // Inject the performance card right after the card-j1 ends (inside tJob)
    lpBody = lpBody.replace(/(<div class="p-card collapsed" id="card-j1">.*?<\/div>\s*<\/div>\s*<\/div>\s*)/s, '$1' + perfCard);

    c = c.substring(0, lpStart) + lpBody + c.substring(lpEnd);
    fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
    console.log("Profile cards updated to collapsed, and Performance added!");
} else {
    console.log("Could not find loadProfile function boundaries.");
}
