// Vercel Serverless Function: POST /api/reset-password
// Body: { email, code, newPassword }
// Verifies code, then uses service_role to update user password
import { createClient } from '@supabase/supabase-js';

const SUPA_URL = 'https://dfdccqadrmyhgfkzgmqk.supabase.co';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: 'Server not configured' });

  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'সব ফিল্ড পূরণ করুন' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' });

    const sb = createClient(SUPA_URL, serviceKey);

    // Find a matching pending request from last 24 hours
    const since = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { data: requests, error: fetchErr } = await sb.from('password_reset_requests')
      .select('id, code, status, created_at, email')
      .eq('email', email).eq('status', 'pending').gte('created_at', since)
      .order('created_at', { ascending: false }).limit(1);
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });
    if (!requests || requests.length === 0) {
      return res.status(400).json({ error: 'কোনো সক্রিয় রিসেট অনুরোধ পাওয়া যায়নি — আবার অনুরোধ করুন' });
    }
    const request = requests[0];
    if (String(request.code) !== String(code)) {
      return res.status(400).json({ error: 'ভুল কোড' });
    }

    // Find user by email
    const { data: { users }, error: usersErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersErr) return res.status(500).json({ error: usersErr.message });
    const user = (users||[]).find(u => (u.email||'').toLowerCase() === email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'ইউজার পাওয়া যায়নি' });

    // Update password
    const { error: updErr } = await sb.auth.admin.updateUserById(user.id, { password: newPassword });
    if (updErr) return res.status(500).json({ error: updErr.message });

    // Mark request as resolved
    await sb.from('password_reset_requests').update({
      status: 'resolved', resolved_at: new Date().toISOString(),
      admin_note: 'Resolved via self-service code'
    }).eq('id', request.id);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
