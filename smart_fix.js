const fs = require('fs');

const c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

// Reverse mapping for Windows-1252 special chars (0x80-0x9F)
const cp1252_rev = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
  0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
  0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
  0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
  0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
  0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
};

let fixedString = '';
let i = 0;

while (i < c.length) {
  let charCode = c.charCodeAt(i);
  
  // Is this character part of Windows-1252 Mojibake?
  // Windows-1252 chars are either < 256 or in the cp1252_rev mapping.
  // HOWEVER, we only want to decode things that look like UTF-8 encoded as CP1252.
  // UTF-8 multibyte sequences start with bytes 0xC2 to 0xFD.
  // In CP1252, these are characters like Â, Ã, Ä, Å, Æ, Ç, È, etc.
  // Bengali UTF-8 starts with 0xE0 0xA6 or 0xE0 0xA7 (à¦ or à§).
  // So a very safe heuristic: if we see 'à' (0xE0) followed by another CP1252 char, it's Mojibake!
  
  if (charCode === 0xE0 || charCode === 0xC2 || charCode === 0xE2 || (charCode >= 0xC0 && charCode <= 0xDF) || (charCode >= 0xE0 && charCode <= 0xEF)) {
      // Potentially start of Mojibake. Let's collect consecutive CP1252 characters.
      let bytes = [];
      let j = i;
      while (j < c.length) {
          let code = c.charCodeAt(j);
          let byteVal = -1;
          if (code < 256) {
              byteVal = code;
          } else if (cp1252_rev[code] !== undefined) {
              byteVal = cp1252_rev[code];
          }
          
          if (byteVal !== -1) {
              bytes.push(byteVal);
              j++;
          } else {
              break; // Met a healthy character (e.g. real Bengali)
          }
      }
      
      // We collected `bytes`. Now we try to decode it as UTF-8.
      if (bytes.length > 0) {
          try {
              // Node's Buffer.toString('utf8') will replace invalid sequences with 
              // We should check if it's completely valid. But for simplicity, we decode it.
              let decoded = Buffer.from(bytes).toString('utf8');
              
              // If it contains , maybe it was just a regular English character that got sucked in?
              // English chars < 128 are valid in UTF-8 and CP1252 and map 1-to-1!
              // So they will decode perfectly.
              fixedString += decoded;
              i = j;
              continue;
          } catch (e) {
              // Should never throw, but just in case
          }
      }
  }
  
  // If not mojibake or fallback:
  fixedString += c.charAt(i);
  i++;
}

fs.writeFileSync('e:\\New project 2\\index_smart_fixed.html', fixedString, 'utf8');
console.log('Smart fixed file generated.');
