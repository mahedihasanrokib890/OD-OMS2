// Vercel Serverless Function: POST /api/forgot-password
// Body: { email, reason }
// Generates a 6-digit code, stores in password_reset_requests
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
    const { email, reason } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    const sb = createClient(SUPA_URL, serviceKey);

    // Verify the user exists
    const { data: profile } = await sb.from('profiles').select('id, email').eq('email', email).maybeSingle();
    if (!profile) {
      // For security, don't reveal whether email exists. Return success anyway.
      return res.status(200).json({ ok: true });
    }

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Save the request (mark older pending ones as expired)
    await sb.from('password_reset_requests').update({ status: 'rejected' })
      .eq('email', email).eq('status', 'pending');

    const { error } = await sb.from('password_reset_requests').insert({
      email, reason: reason || null, status: 'pending', code
    });
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
