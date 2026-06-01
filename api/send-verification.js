// Vercel Serverless Function: POST /api/send-verification
// Body: { email, name }
// Generates a 6-digit verification code, stores in DB,
// then sends it via Gmail SMTP to the user's email
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

function buildVerificationEmail(name, code) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:'Hind Siliguri',Arial,sans-serif;color:#1e293b">
  <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.10);border:1px solid #f3e8ff">
    <tr><td style="padding:28px 28px 16px;text-align:center;border-bottom:1px solid #f3e8ff">
      <div style="font-size:26px;font-weight:900;color:${BRAND.primary};letter-spacing:-0.5px;margin-bottom:4px">${BRAND.name}</div>
      <div style="font-size:13px;color:#94a3b8;font-weight:600">ইমেইল ভেরিফিকেশন</div>
    </td></tr>
    <tr><td style="padding:28px 28px 16px;font-size:15px;line-height:1.85">
      <p style="margin:0 0 8px"><b>আসসালামু আলাইকুম${name ? ' ' + name : ''},</b></p>
      <p style="margin:0 0 14px;color:#475569">OD-OMS HR সিস্টেমে আপনাকে স্বাগতম! আপনার অ্যাকাউন্ট ভেরিফাই করতে নিচের ৬-অঙ্কের কোডটি ব্যবহার করুন:</p>
      <div style="text-align:center;padding:30px 20px;margin:18px 0;background:linear-gradient(135deg,#faf5ff,#fce7f3);border-radius:14px;border:2px dashed #a78bfa40">
        <div style="font-size:11px;color:#64748b;margin-bottom:8px;text-transform:uppercase;letter-spacing:3px;font-weight:700">ভেরিফিকেশন কোড</div>
        <div style="font-size:42px;font-weight:900;color:${BRAND.primary};letter-spacing:12px;font-family:'Inter',monospace;margin-bottom:8px">${code}</div>
        <div style="font-size:12px;color:#94a3b8;font-weight:600">এই কোডের মেয়াদ ২৪ ঘন্টা</div>
      </div>
      <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:14px;font-size:13px;color:#92400e">
        ⚠️ এই কোড কারো সাথে শেয়ার করবেন না। আমরা কখনো ফোনে বা মেসেজে কোড চাইবো না।
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">আপনি এই অনুরোধ না করে থাকলে এই ইমেইল উপেক্ষা করুন।</p>
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

  if (!(gmailUser && gmailPass)) {
    return res.status(500).json({
      error: 'Email service not configured',
      hint: 'Vercel এ GMAIL_USER + GMAIL_APP_PASSWORD সেট করুন'
    });
  }

  try {
    const { email, name } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store in password_reset_requests table (reuse for verification too)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      try {
        const sb = createClient(SUPA_URL, serviceKey);
        // Expire old pending verifications for this email
        await sb.from('password_reset_requests').update({ status: 'rejected' })
          .eq('email', email).eq('status', 'pending');
        // Insert new one
        await sb.from('password_reset_requests').insert({
          email,
          reason: 'email_verification',
          status: 'pending',
          code
        });
      } catch (dbErr) {
        console.warn('DB save verification code failed:', dbErr.message);
        // Continue anyway — the email will still be sent
      }
    }

    // Send verification code via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass }
    });

    await transporter.sendMail({
      from: `"OD-OMS System" <${gmailUser}>`,
      to: email,
      subject: `🔐 আপনার ভেরিফিকেশন কোড — ${code}`,
      html: buildVerificationEmail(name, code)
    });

    return res.status(200).json({ ok: true, emailSent: true });
  } catch (e) {
    console.error('send-verification error:', e);
    return res.status(500).json({ error: e.message || 'Send failed' });
  }
}
