const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const temp = fs.readFileSync('temp.js', 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  if(start === -1) return null;
  let count = 0, inStr = false, strChar = '', end = -1;
  for(let i = start; i < source.length; i++) {
    const c = source[i], prev = i > 0 ? source[i-1] : '';
    if(!inStr && (c === '"' || c === "'" || c === '`')) { inStr = true; strChar = c; }
    else if(inStr && c === strChar && prev !== '\\') { inStr = false; }
    else if(!inStr && c === '{') count++;
    else if(!inStr && c === '}') {
      count--;
      if(count === 0 && source.substring(start, i).includes('{')) { end = i + 1; break; }
    }
  }
  return end !== -1 ? source.substring(start, end) : null;
}

const markAtt = extractFunction(temp, 'async function markAttendance(type)');
const refreshAtt = extractFunction(temp, 'async function refreshAttendanceList()');
const formatFn = extractFunction(temp, 'window.formatDateForInput = formatDateForInput;'); // this handles showLocationMap because it's right after

const oldMark = extractFunction(html, 'async function markAttendance(type)');
const oldRefresh = extractFunction(html, 'async function refreshAttendanceList()');

if(oldMark && markAtt) {
  html = html.replace(oldMark, markAtt);
  console.log('markAttendance replaced');
}
if(oldRefresh && refreshAtt) {
  html = html.replace(oldRefresh, refreshAtt);
  console.log('refreshAttendanceList replaced');
}
fs.writeFileSync('index.html', html);
console.log('Done.');
