const fs = require('fs');
let content = '';
const files = [
  'supabase_v21_phase2.sql', 
  'supabase_v22_location.sql'
];
for (const file of files) {
  if (fs.existsSync(file)) {
    let sql = fs.readFileSync(file, 'utf8');
    const policies = [...sql.matchAll(/CREATE POLICY \"([^\"]+)\" ON public\.([a-zA-Z_]+)/g)];
    for (const match of policies) {
      const dropStr = `DROP POLICY IF EXISTS "${match[1]}" ON public.${match[2]};`;
      if (!sql.includes(dropStr)) {
        sql = sql.replace(match[0], dropStr + '\n' + match[0]);
      }
    }
    content += sql + '\n\n';
  }
}
fs.writeFileSync('OD_HRMS_Complete_Safe.sql', content);
console.log('Done');
