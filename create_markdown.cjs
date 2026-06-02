const fs = require('fs');
const sql = fs.readFileSync('OD_HRMS_Complete_Safe.sql', 'utf8');
const md = `# All-In-One Safe SQL\n\n\`\`\`sql\n${sql}\n\`\`\``;
fs.writeFileSync('C:/Users/OrdhekDeen/.gemini/antigravity-ide/brain/f8ce07a5-91ef-43c1-af4c-ea150130b3a7/OD_HRMS_All_In_One.md', md);
console.log('Artifact created');
