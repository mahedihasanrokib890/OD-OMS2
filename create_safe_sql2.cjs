const fs = require('fs');
let content = '';
const files = [
  'supabase_all_in_one.sql',
  'supabase_v14_bonus.sql', 
  'supabase_v15_working_days.sql', 
  'supabase_v16_advanced_bonus.sql', 
  'supabase_v17_emp_code.sql', 
  'supabase_v18_fixes.sql', 
  'supabase_v19_final_schema_sync.sql', 
  'supabase_v20_onboarding_payroll.sql', 
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
