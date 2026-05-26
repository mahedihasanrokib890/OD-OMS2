const fs = require('fs');
let c = fs.readFileSync('e:\\New project 2\\index.html', 'utf8');

const updatedCSS = `
/* Action Buttons Pro CSS */
.att-actions-pro {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin: 25px 0;
}
.att-btn-pro {
  background: white;
  border: 1px solid var(--slate-100);
  border-radius: 20px;
  padding: 25px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.att-btn-pro::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0));
  z-index: 1;
}
.att-btn-pro:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(99,42,126,0.08);
  border-color: rgba(139,92,246,0.3);
}
.att-btn-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.att-btn-pro:hover .att-btn-icon {
  transform: scale(1.15) rotate(5deg);
}

.att-in .att-btn-icon { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
.att-out .att-btn-icon { background: linear-gradient(135deg, #ec4899, #be185d); color: white; box-shadow: 0 8px 20px rgba(236,72,153,0.3); }
.att-lunchout .att-btn-icon { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 8px 20px rgba(245,158,11,0.3); }
.att-lunchin .att-btn-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; box-shadow: 0 8px 20px rgba(59,130,246,0.3); }

.att-btn-text { z-index: 2; }
.att-btn-label {
  display: block;
  font-weight: 800;
  font-size: 18px;
  color: var(--slate-800);
  margin-bottom: 4px;
}
.att-btn-sub {
  display: block;
  font-size: 13px;
  color: var(--slate-500);
  font-weight: 500;
}
.dark-mode .att-btn-pro { background: var(--card-bg); border-color: var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.dark-mode .att-btn-label { color: #fff; }
`;

// Replace the old CSS
// The old CSS was injected as `/* Action Buttons Pro CSS */ ... .dark-mode .att-btn-label { color: #fff; }`
const oldCssStart = c.indexOf('/* Action Buttons Pro CSS */');
const oldCssEnd = c.indexOf('.dark-mode .att-btn-label { color: #fff; }') + 42;

if (oldCssStart > -1 && oldCssEnd > -1) {
    c = c.substring(0, oldCssStart) + updatedCSS + c.substring(oldCssEnd);
}

fs.writeFileSync('e:\\New project 2\\index.html', c, 'utf8');
console.log('Updated buttons design!');
