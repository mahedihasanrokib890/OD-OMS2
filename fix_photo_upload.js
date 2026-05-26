const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const oldPreviewFuncRegex = /function previewAvatar.*?reader\.readAsDataURL\(input\.files\[0\]\);\s*}\s*}/s;

const newPreviewFunc = `function previewAvatar(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 300;
            const MAX_HEIGHT = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress and convert to base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            document.getElementById('epAvatarPreview').src = dataUrl;
            currentAvatarBase64 = dataUrl;
          };
          img.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
      }
    }`;

if (c.match(oldPreviewFuncRegex)) {
    c = c.replace(oldPreviewFuncRegex, newPreviewFunc);
    
    // Also, let's make sure DB.set doesn't silently crash the app on QuotaExceededError
    // DB.set is near line ~200
    const oldDBSet = `set(key, value) {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));`;
    const newDBSet = `set(key, value) {
        try {
          localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
        } catch (e) {
          console.error("Storage Error:", e);
          if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
            showToast("Error: Storage is full! Please use smaller images.", "error");
          }
        }`;
    
    c = c.replace(oldDBSet, newDBSet);
    
    fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
    console.log("Fixed photo upload size issue!");
} else {
    console.log("Could not find previewAvatar function");
}
