// Vercel Serverless Function: POST /api/notify
// Sends transactional emails — supports two providers (auto-fallback):
//   Provider 1 (preferred): Resend  — set RESEND_API_KEY (free tier 3000/mo)
//   Provider 2 (fallback): Gmail SMTP — set GMAIL_USER + GMAIL_APP_PASSWORD
//
// At least one provider must be configured.
import nodemailer from 'nodemailer';

const BRAND = {
  name:    'অর্ধেকদ্বীন ম্যানেজমেন্ট',
  appName: 'OD-OMS System',
  primary: '#5b2d8a',
  accent:  '#e91e63',
  url:     'https://od-oms-2.vercel.app',
  address: '৫/২৫/গ, আউটার স্টেডিয়াম, ময়মনসিংহ',
  contactEmail: 'info@ordhekdeen.com',
  contactPhone: '+৮৮০১৭৬০৪৪২৪৭৬'
};

// Standard branded layout used by every transactional email
function shell({ subtitle, body }) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:'Hind Siliguri',Arial,sans-serif;color:#1e293b">
  <table align="center" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.10);border:1px solid #f3e8ff">

    <!-- Brand header -->
    <tr><td style="padding:28px 28px 16px;text-align:center;border-bottom:1px solid #f3e8ff">
      <div style="font-size:26px;font-weight:900;color:${BRAND.primary};letter-spacing:-0.5px;margin-bottom:4px">${BRAND.name}</div>
      <div style="font-size:13px;color:#94a3b8;font-weight:600">${subtitle || ''}</div>
    </td></tr>

    <!-- Body content -->
    <tr><td style="padding:28px 28px 16px;font-size:15px;line-height:1.85">
      ${body}
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:0 28px 24px;text-align:center">
      <a href="${BRAND.url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">অ্যাপ এ যান</a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:18px 28px;background:#faf5ff;border-top:1px solid #f3e8ff;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6">
      <div style="font-weight:700;color:${BRAND.primary};margin-bottom:4px">অর্ধেকদ্বীন · OD-OMS HR System</div>
      <div>${BRAND.address}</div>
      <div>${BRAND.contactEmail} · ${BRAND.contactPhone}</div>
    </td></tr>
  </table>
</body></html>`;
}

// Big colored status banner — matches user's reference design
function statusBanner({ color, bg, text, sub }) {
  return `<div style="text-align:center;padding:30px 20px;margin:18px 0;background:${bg};border-radius:14px;border:2px dashed ${color}40">
  <div style="font-size:28px;font-weight:900;color:${color};letter-spacing:-0.5px;margin-bottom:6px">${text}</div>
  <div style="font-size:14px;color:${color};font-weight:600;opacity:.85">${sub}</div>
</div>`;
}

function leaveAppliedTemplate({ employee, leaveType, startDate, endDate, days, reason }) {
  return {
    subject: `📋 নতুন ছুটির আবেদন — ${employee}`,
    html: shell({
      subtitle: 'নতুন ছুটির আবেদন',
      body: `
<p style="margin:0 0 14px"><b>${employee}</b> একটি নতুন ছুটির আবেদন করেছেন। বিস্তারিত নিচে দেখুন:</p>

<table style="width:100%;border-collapse:collapse;margin:14px 0;background:#faf5ff;border-radius:10px;overflow:hidden">
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;width:140px;border-bottom:1px solid #f3e8ff">ছুটির ধরন</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #f3e8ff">${leaveType}</td></tr>
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #f3e8ff">সময়কাল</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #f3e8ff">${startDate} – ${endDate}</td></tr>
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #f3e8ff">মোট দিন</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #f3e8ff">${days} দিন</td></tr>
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;vertical-align:top">কারণ</td><td style="padding:10px 14px;color:#475569;font-style:italic">"${reason}"</td></tr>
</table>

<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:14px;font-size:13px;color:#92400e">⏳ অ্যাপের <b>📥 ইনবক্স</b> এ গিয়ে অনুমোদন বা প্রত্যাখ্যান করুন।</div>`
    })
  };
}

function leaveDecisionTemplate({ employee, status, leaveType, startDate, endDate, days, comment }) {
  const isApproved = status === 'approved';
  const banner = isApproved
    ? statusBanner({ color: '#16a34a', bg: '#dcfce7', text: '✓ অনুমোদিত (Approved)', sub: 'আপনার ছুটি অনুমোদন করা হয়েছে' })
    : statusBanner({ color: '#dc2626', bg: '#fee2e2', text: '✗ বাতিলকৃত (Rejected)', sub: 'আপনার ছুটির আবেদন প্রত্যাখ্যাত হয়েছে' });

  return {
    subject: `ছুটির আবেদনের আপডেট — ${isApproved ? 'অনুমোদিত' : 'বাতিলকৃত'}`,
    html: shell({
      subtitle: 'ছুটির আবেদনের আপডেট',
      body: `
<p style="margin:0 0 8px"><b>আসসালামু আলাইকুম${employee ? ' ' + employee : ''},</b></p>
<p style="margin:0 0 14px;color:#475569">আপনার করা ছুটির আবেদনটি কর্তৃপক্ষের দ্বারা পর্যালোচনা করা হয়েছে। আপনার আবেদনের বর্তমান স্ট্যাটাস নিচে দেওয়া হলো:</p>

${banner}

<table style="width:100%;border-collapse:collapse;margin:14px 0;background:#faf5ff;border-radius:10px;overflow:hidden">
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;width:140px;border-bottom:1px solid #f3e8ff">ছুটির ধরন</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #f3e8ff">${leaveType}</td></tr>
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;border-bottom:1px solid #f3e8ff">সময়কাল</td><td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #f3e8ff">${startDate} – ${endDate}</td></tr>
<tr><td style="padding:10px 14px;color:#64748b;font-weight:600${comment ? ';border-bottom:1px solid #f3e8ff' : ''}">মোট দিন</td><td style="padding:10px 14px;font-weight:700${comment ? ';border-bottom:1px solid #f3e8ff' : ''}">${days} দিন</td></tr>
${comment ? `<tr><td style="padding:10px 14px;color:#64748b;font-weight:600;vertical-align:top">কর্তৃপক্ষের মন্তব্য</td><td style="padding:10px 14px;color:#475569;font-style:italic">"${comment}"</td></tr>` : ''}
</table>

<p style="margin:14px 0 0;font-size:13px;color:#64748b">কোনো প্রশ্ন থাকলে অনুগ্রহ করে এইচআর ম্যানেজারের সাথে যোগাযোগ করুন।</p>`
    })
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const resendKey = process.env.RESEND_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL || gmailUser || 'onboarding@resend.dev';

  if (!resendKey && !(gmailUser && gmailPass)) {
    return res.status(500).json({
      error: 'Email service not configured',
      hint: 'Vercel এ RESEND_API_KEY অথবা GMAIL_USER + GMAIL_APP_PASSWORD সেট করুন'
    });
  }

  try {
    const { type, to, data } = req.body || {};
    if (!to || !type) return res.status(400).json({ error: 'Missing fields (type, to)' });

    let template;
    if (type === 'leave_applied')   template = leaveAppliedTemplate(data || {});
    else if (type === 'leave_decision') template = leaveDecisionTemplate(data || {});
    else return res.status(400).json({ error: 'Unknown notification type: ' + type });

    const recipients = Array.isArray(to) ? to : [to];

    // ─── Provider 1: Resend ──────────────────────────────────
    if (resendKey) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `OD-OMS System <${fromEmail}>`,
            to: recipients,
            subject: template.subject,
            html: template.html
          })
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok) {
          return res.status(200).json({ ok: true, provider: 'resend', id: j.id });
        }
        // Fall through to Gmail if Resend failed
        console.warn('Resend failed:', r.status, j);
        if (!(gmailUser && gmailPass)) {
          return res.status(500).json({
            error: 'Resend failed: ' + (j.message || j.error || r.status),
            hint: 'Resend dashboard এ API key + verified domain চেক করুন'
          });
        }
      } catch (e) {
        console.warn('Resend exception:', e);
        if (!(gmailUser && gmailPass)) {
          return res.status(500).json({ error: 'Resend error: ' + e.message });
        }
      }
    }

    // ─── Provider 2: Gmail SMTP (fallback) ───────────────────
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass }
    });

    const info = await transporter.sendMail({
      from: `"OD-OMS System" <${gmailUser}>`,
      to: recipients.join(','),
      subject: template.subject,
      html: template.html
    });

    return res.status(200).json({ ok: true, provider: 'gmail', accepted: info.accepted, rejected: info.rejected });
  } catch (e) {
    console.error('notify error:', e);
    const msg = e.message || 'Send failed';
    let hint = '';
    if (msg.includes('Username and Password not accepted')) {
      hint = 'Gmail App Password ভুল বা expired — myaccount.google.com/apppasswords থেকে নতুন বানান';
    } else if (msg.includes('Invalid login')) {
      hint = 'Gmail credentials ভুল — GMAIL_USER ও GMAIL_APP_PASSWORD আবার চেক করুন';
    }
    return res.status(500).json({ error: msg, hint });
  }
}
