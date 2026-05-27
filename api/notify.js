// Vercel Serverless Function: POST /api/notify
// Sends transactional emails via Gmail SMTP (nodemailer)
// Required env vars (set in Vercel project settings):
//   GMAIL_USER         — your gmail address (e.g. mahedihasanrokib83@gmail.com)
//   GMAIL_APP_PASSWORD — 16-char app password (no spaces)
import nodemailer from 'nodemailer';

const BRAND = {
  name: 'অর্ধেকদ্বীন HR',
  appName: 'OD-OMS System',
  primary: '#5b2d8a',
  accent:  '#e91e63',
  url:     'https://od-oms-2.vercel.app'
};

function buildHtml(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:Arial,sans-serif">
<table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.12)">
<tr><td style="background:linear-gradient(135deg,${BRAND.primary} 0%,#8b5cf6 50%,${BRAND.accent} 100%);padding:30px 24px;text-align:center">
<h1 style="margin:0;color:white;font-size:26px;font-weight:900;letter-spacing:-1px">${BRAND.appName}</h1>
<p style="margin:6px 0 0;color:rgba(255,255,255,.92);font-size:13px;font-weight:600">${BRAND.name}</p>
</td></tr>
<tr><td style="padding:32px 28px">
<h2 style="margin:0 0 16px;color:#1e293b;font-size:18px">${title}</h2>
${body}
<div style="margin-top:24px;text-align:center">
<a href="${BRAND.url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">অ্যাপে যান</a>
</div>
</td></tr>
<tr><td style="padding:18px 28px;background:#faf5ff;text-align:center;border-top:1px solid #e4d6f8">
<p style="margin:0;color:#94a3b8;font-size:11px">© ${BRAND.name} · ${BRAND.appName}</p>
</td></tr>
</table>
</body></html>`;
}

function leaveAppliedTemplate({ employee, leaveType, startDate, endDate, days, reason }) {
  return {
    subject: `📋 নতুন ছুটির আবেদন · ${employee}`,
    html: buildHtml('📋 নতুন ছুটির আবেদন', `
<p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:14px"><b>${employee}</b> একটি নতুন ছুটির আবেদন করেছেন।</p>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">
<tr><td style="padding:8px 0;color:#64748b;width:140px">ছুটির ধরন:</td><td style="padding:8px 0;font-weight:700">${leaveType}</td></tr>
<tr><td style="padding:8px 0;color:#64748b">সময়কাল:</td><td style="padding:8px 0;font-weight:700">${startDate} – ${endDate} (${days} দিন)</td></tr>
<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">কারণ:</td><td style="padding:8px 0;color:#475569;font-style:italic">"${reason}"</td></tr>
</table>
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:14px;font-size:13px;color:#92400e">⏳ অ্যাপের ইনবক্সে গিয়ে অনুমোদন/প্রত্যাখ্যান করুন।</div>
`)
  };
}

function leaveDecisionTemplate({ status, leaveType, startDate, endDate, days, comment }) {
  const isApproved = status === 'approved';
  const color = isApproved ? '#16a34a' : '#dc2626';
  const bg    = isApproved ? '#dcfce7' : '#fee2e2';
  const txt   = isApproved ? '✓ অনুমোদিত' : '✗ প্রত্যাখ্যাত';
  return {
    subject: `${isApproved?'✓':'✗'} আপনার ছুটি ${isApproved?'অনুমোদিত':'প্রত্যাখ্যাত'} হয়েছে`,
    html: buildHtml(`আপনার ছুটির আবেদনের সিদ্ধান্ত`, `
<div style="background:${bg};color:${color};padding:14px;border-radius:10px;margin-bottom:14px;font-weight:700;text-align:center;font-size:16px;border:1px solid ${color}33">${txt}</div>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px">
<tr><td style="padding:8px 0;color:#64748b;width:140px">ছুটির ধরন:</td><td style="padding:8px 0;font-weight:700">${leaveType}</td></tr>
<tr><td style="padding:8px 0;color:#64748b">সময়কাল:</td><td style="padding:8px 0;font-weight:700">${startDate} – ${endDate} (${days} দিন)</td></tr>
${comment ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">মন্তব্য:</td><td style="padding:8px 0;color:#475569;font-style:italic">"${comment}"</td></tr>` : ''}
</table>
`)
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return res.status(500).json({ error: 'Email service not configured' });

  try {
    const { type, to, data } = req.body || {};
    if (!to || !type) return res.status(400).json({ error: 'Missing fields' });

    let template;
    if (type === 'leave_applied')   template = leaveAppliedTemplate(data || {});
    else if (type === 'leave_decision') template = leaveDecisionTemplate(data || {});
    else return res.status(400).json({ error: 'Unknown notification type' });

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass }
    });

    await transporter.sendMail({
      from: `"OD-OMS System" <${user}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject: template.subject,
      html: template.html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify error:', e);
    return res.status(500).json({ error: e.message || 'Send failed' });
  }
}
