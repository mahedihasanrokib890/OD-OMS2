// Vercel Serverless Function: POST /api/forgot-password
// Body: { email }
// Generates a 6-digit code, stores in DB (best-effort),
// then sends the code via Gmail SMTP regardless of DB result
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPA_URL = 'https://dfdccqadrmyhgfkzgmqk.supabase.co';

const BRAND = {
  name:    'অর্ধেকদ্বীন ম্যানেজমেন্ট',
  primary: '#5b2d8a',
  accent:  '#e91e63',
  url:     'https://od-oms-2.vercel.app',
  address: '৫/২৫/গ, আউটার স্টেডিয়াম, ময়মনসিংহ',
  contactEmail: 'info@ordhekdeen.com',
  contactPhone: '+৮৮০১৭৬০৪৪২৪৭৬'
};

function buildResetEmail(name, code, email) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:'Hind Siliguri',Arial,sans-serif;color:#1e293b">
  <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.10);border:1px solid #f3e8ff">
    <tr><td style="padding:28px 28px 16px;text-align:center;border-bottom:1px solid #f3e8ff">
      <div style="font-size:26px;font-weight:900;color:${BRAND.primary};letter-spacing:-0.5px;margin-bottom:4px">${BRAND.name}</div>
      <div style="font-size:13px;color:#94a3b8;font-weight:600">পাসওয়ার্ড রিসেট</div>
    </td></tr>
    <tr><td style="padding:28px 28px 16px;font-size:15px;line-height:1.85">
      <p style="margin:0 0 8px"><b>আসসালামু আলাইকুম${name ? ' ' + name : ''},</b></p>
      <p style="margin:0 0 14px;color:#475569">আপনার OD-OMS অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে নিচের ৬-অঙ্কের কোডটি ব্যবহার করুন:</p>
      <div style="text-align:center;padding:30px 20px;margin:18px 0;background:linear-gradient(135deg,#faf5ff,#fce7f3);border-radius:14px;border:2px dashed #a78bfa40">
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:3px;font-weight:700">পাসওয়ার্ড রিসেট কোড</div>
        <div style="font-size:48px;font-weight:900;color:${BRAND.primary};letter-spacing:14px;font-family:monospace;margin-bottom:8px">${code}</div>
        <div style="font-size:12px;color:#94a3b8;font-weight:600">এই কোডের মেয়াদ ২৪ ঘন্টা</div>
      </div>
      <div style="background:#dcfce7;border-left:4px solid #16a34a;padding:12px 14px;border-radius:8px;margin:14px 0;font-size:13px;color:#166534">
        📌 <b>কিভাবে রিসেট করবেন:</b><br>
        ১) অ্যাপে "কোড আছে? পাসওয়ার্ড রিসেট করুন" ক্লিক করুন<br>
        ২) ইমেইল <b>${email}</b> দিন<br>
        ৩) এই কোড দিন → নতুন পাসওয়ার্ড দিন → সাবমিট
      </div>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:8px;font-size:13px;color:#92400e">
        ⚠️ এই কোড কারো সাথে শেয়ার করবেন না।
      </div>
    </td></tr>
    <tr><td style="padding:0 28px 24px;text-align:center">
      <a href="${BRAND.url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">অ্যাপ এ যান</a>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#faf5ff;border-top:1px solid #f3e8ff;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6">
      <div style="font-weight:700;color:${BRAND.primary};margin-bottom:4px">অর্ধেকদ্বীন · OD-OMS HR System</div>
      <div>${BRAND.address}</div>
      <div>${BRAND.contactEmail} · ${BRAND.contactPhone}</div>
    </td></tr>
  </table>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(gmailUser && gmailPass)) {
    return res.status(500).json({
      error: 'Email service not configured',
      hint: 'Vercel এ GMAIL_USER + GMAIL_APP_PASSWORD সেট করুন'
    });
  }

  try {
    const { email, reason } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    let profileName = '';

    // ── Try to look up profile name (best-effort, don't abort if it fails) ──
    if (serviceKey && !serviceKey.startsWith('http')) {
      try {
        const sb = createClient(SUPA_URL, serviceKey);
        const { data: profile } = await sb.from('profiles')
          .select('full_name').eq('email', email).maybeSingle();
        if (profile?.full_name) profileName = profile.full_name;
      } catch (e) {
        console.warn('Profile lookup failed (non-fatal):', e.message);
      }
    }

    // ── Save code to DB (best-effort, don't abort if it fails) ──
    if (serviceKey && !serviceKey.startsWith('http')) {
      try {
        const sb = createClient(SUPA_URL, serviceKey);
        // Expire old pending requests for this email
        await sb.from('password_reset_requests')
          .update({ status: 'rejected' })
          .eq('email', email).eq('status', 'pending');
        // Insert new one
        await sb.from('password_reset_requests').insert({
          email,
          reason: reason || 'self-service',
          status: 'pending',
          code
        });
      } catch (e) {
        console.warn('DB save failed (non-fatal):', e.message);
        // Still send email — code will be in the email itself
      }
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured or is a URL — skipping DB save');
    }

    // ── Send code via Gmail SMTP (this is the critical part) ──
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass }
    });

    await transporter.sendMail({
      from: `"OD-OMS System" <${gmailUser}>`,
      to: email,
      subject: `🔑 পাসওয়ার্ড রিসেট কোড: ${code}`,
      html: buildResetEmail(profileName, code, email)
    });

    return res.status(200).json({ ok: true, emailSent: true });
  } catch (e) {
    console.error('forgot-password error:', e);
    const msg = e.message || 'Send failed';
    let hint = '';
    if (msg.includes('Username and Password not accepted')) {
      hint = 'Gmail App Password ভুল — myaccount.google.com/apppasswords থেকে নতুন বানান';
    }
    return res.status(500).json({ error: msg, hint });
  }
}
