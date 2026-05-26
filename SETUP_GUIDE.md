# 📚 OD-OMS · Production Setup Guide

আপনার HR সিস্টেমকে **২-৩ বছর + এর জন্য professional আর scalable** করার সম্পূর্ণ গাইড।

---

## 🎯 Solution Stack (সব ফ্রি, production-ready)

| সেবা | ফ্রি Tier | আমাদের ব্যবহার | বছরে খরচ |
|---|---|---|---|
| **Supabase** | ৫০০MB DB + ১GB Storage + ৫০K MAU | Database, Auth, Storage | **৳ ০** |
| **Brevo (Sendinblue)** | ৯,০০০ ইমেইল/মাস | All transactional emails | **৳ ০** |
| **Vercel** | Unlimited bandwidth (hobby) | Hosting | **৳ ০** |
| **GitHub** | Unlimited public repos | Code repo | **৳ ০** |

➡️ **মোট মাসিক খরচ = ০ টাকা**, এটা ১০ বছরও চলবে ৫০-২০০ কর্মীর HR এ।

---

## 📧 Step 1: Brevo (Sendinblue) Setup — ৫ মিনিট

**কেন Brevo?** SendGrid (১০০/দিন), Resend (১০০/দিন) এর চেয়ে অনেক বেশি — Brevo দেয় **৩০০/দিন ফ্রি forever**।

### ১.১ Sign Up
👉 [https://www.brevo.com/](https://www.brevo.com/)

- "Sign up free" → আপনার gmail/email দিয়ে account খুলুন
- Verify email
- "I'm sending emails for **my own business**" সিলেক্ট করুন
- Company name: **অর্ধেকদ্বীন** / **OD-OMS**

### ১.২ SMTP Credentials নিন

ড্যাশবোর্ডে যান → বাঁ পাশে **SMTP & API** → **SMTP** tab
- দেখাবে:
  - SMTP Server: `smtp-relay.brevo.com`
  - Port: `587`
  - Login: `xxxxxxxx@smtp-brevo.com`
  - Password: ক্লিক করে generate করুন (এটা copy করুন)

### ১.৩ Sender Email Verify

ড্যাশবোর্ডে → **Senders, Domains & Dedicated IPs** → **Senders** → **Add a sender**
- Name: `OD-OMS System`
- Email: যে ইমেইল থেকে পাঠাতে চান (যেমন: `noreply@yourcompany.com` অথবা আপনার gmail)
- Verify (ইমেইল আসবে → click)

> 💡 **TIP:** নিজের domain না থাকলে আপনার gmail ব্যবহার করুন। ভবিষ্যতে domain কিনলে যোগ করবেন।

---

## 📧 Step 2: Supabase এ SMTP কনফিগার করুন — ২ মিনিট

আপনার screenshot এ "Set up SMTP" button দেখা যাচ্ছে। সেখানে click করে এই info দিন:

[Supabase Auth → Emails → SMTP Settings](https://supabase.com/dashboard/project/dfdccqadrmyhgfkzgmqk/auth/templates)

| Field | Value |
|---|---|
| **Enable Custom SMTP** | ✅ ON |
| **Sender email** | আপনার verified Brevo sender email |
| **Sender name** | `OD-OMS System` |
| **Host** | `smtp-relay.brevo.com` |
| **Port** | `587` |
| **Username** | Brevo login (xxxxxxx@smtp-brevo.com) |
| **Password** | Brevo SMTP password |
| **Minimum interval between emails** | `1` (second) |

**Save** চাপুন।

---

## 📧 Step 3: Email Templates — Beautiful Branded Design

[Supabase → Authentication → Email Templates](https://supabase.com/dashboard/project/dfdccqadrmyhgfkzgmqk/auth/templates) এ যান।

### ৩.১ "Confirm signup" Template

পুরোটা মুছে এই content paste করুন:

**Subject:**
```
✓ আপনার OD-OMS অ্যাকাউন্ট ভেরিফাই করুন
```

**Message body (HTML):**
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:Arial,'Hind Siliguri',sans-serif">
  <table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.12)">
    <tr>
      <td style="background:linear-gradient(135deg,#5b2d8a 0%,#8b5cf6 50%,#e91e63 100%);padding:40px 24px;text-align:center">
        <div style="display:inline-block;background:white;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:14px">
          <span style="font-size:32px">💜</span>
        </div>
        <h1 style="margin:0;color:white;font-size:28px;font-weight:900;letter-spacing:-1px">OD-OMS</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.92);font-size:14px;font-weight:600">অর্ধেকদ্বীন HR ম্যানেজমেন্ট সিস্টেম</p>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 32px">
        <h2 style="margin:0 0 14px;color:#1e293b;font-size:20px">আসসালামু আলাইকুম 👋</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">আপনার <b>OD-OMS</b> অ্যাকাউন্ট তৈরি হয়েছে! অ্যাকাউন্ট সক্রিয় করতে নিচের বাটনে ক্লিক করুন:</p>
        <table align="center" style="margin:28px auto"><tr><td style="background:linear-gradient(135deg,#5b2d8a 0%,#e91e63 100%);border-radius:14px">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;color:white;text-decoration:none;font-weight:700;font-size:15px">✓ অ্যাকাউন্ট ভেরিফাই করুন</a>
        </td></tr></table>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">এই লিংকটি ২৪ ঘন্টা কার্যকর থাকবে।</p>
        <hr style="border:none;border-top:1px solid #e4d6f8;margin:28px 0">
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">যদি বাটনে ক্লিক না হয়, এই লিংকটি কপি করে browser এ paste করুন:<br>
          <span style="color:#5b2d8a;word-break:break-all;font-size:11px">{{ .ConfirmationURL }}</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#faf5ff;text-align:center;border-top:1px solid #e4d6f8">
        <p style="margin:0;color:#94a3b8;font-size:11px">© অর্ধেকদ্বীন · OD-OMS HR System</p>
        <p style="margin:6px 0 0;color:#cbd5e1;font-size:10px">যদি আপনি এই অ্যাকাউন্ট তৈরি না করেন, এই ইমেইল উপেক্ষা করুন।</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### ৩.২ "Reset Password" Template

**Subject:**
```
🔑 আপনার OD-OMS পাসওয়ার্ড রিসেট লিংক
```

**Message body:**
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#faf5ff;font-family:Arial,'Hind Siliguri',sans-serif">
  <table align="center" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(91,45,138,.12)">
    <tr>
      <td style="background:linear-gradient(135deg,#5b2d8a 0%,#8b5cf6 50%,#e91e63 100%);padding:40px 24px;text-align:center">
        <div style="display:inline-block;background:white;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;margin-bottom:14px">
          <span style="font-size:32px">🔑</span>
        </div>
        <h1 style="margin:0;color:white;font-size:28px;font-weight:900;letter-spacing:-1px">OD-OMS</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,.92);font-size:14px;font-weight:600">পাসওয়ার্ড রিসেট</p>
      </td>
    </tr>
    <tr>
      <td style="padding:36px 32px">
        <h2 style="margin:0 0 14px;color:#1e293b;font-size:20px">আসসালামু আলাইকুম 👋</h2>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6">আপনি আপনার <b>OD-OMS</b> অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে চেয়েছেন। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন:</p>
        <table align="center" style="margin:28px auto"><tr><td style="background:linear-gradient(135deg,#5b2d8a 0%,#e91e63 100%);border-radius:14px">
          <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:16px 36px;color:white;text-decoration:none;font-weight:700;font-size:15px">🔓 নতুন পাসওয়ার্ড সেট করুন</a>
        </td></tr></table>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">এই লিংকটি ১ ঘন্টা কার্যকর থাকবে।</p>
        <hr style="border:none;border-top:1px solid #e4d6f8;margin:28px 0">
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">যদি আপনি পাসওয়ার্ড রিসেট না চান, এই ইমেইল উপেক্ষা করুন। আপনার অ্যাকাউন্ট নিরাপদ আছে।</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#faf5ff;text-align:center;border-top:1px solid #e4d6f8">
        <p style="margin:0;color:#94a3b8;font-size:11px">© অর্ধেকদ্বীন · OD-OMS HR System</p>
      </td>
    </tr>
  </table>
</body>
</html>
```

### ৩.৩ "Magic Link" এবং "Change Email Address" Template
এই দুটোতেও একই pattern follow করুন (সংশ্লিষ্ট subject ও heading বদলে)।

---

## 🗄️ Step 4: Database — ২-৩ বছর Future-Proof

### বর্তমান usage estimate (৫০ কর্মী, ৩ বছর):

| Table | Rows | Size estimate |
|---|---|---|
| profiles | ৫০ | ~৫০ KB |
| attendance | ৫০ × ৩৬৫ × ৩ = ৫৪,৭৫০ | ~১৫ MB |
| leaves | ৫০ × ১৫ × ৩ = ২,২৫০ | ~৬০০ KB |
| notices | ~৫০০ | ~১.৫ MB |
| **মোট** | | **~১৭ MB** |

**Supabase free tier:** ৫০০ MB → ৩০× margin আছে। ১০ বছরও চলবে।

### কীভাবে database "ভার" না হয়:

#### ১. পুরাতন attendance archive (২ বছরের পর)
এই SQL টা প্রতি বছর একবার চালান:

```sql
-- Archive old attendance (older than 2 years) to a separate table
CREATE TABLE IF NOT EXISTS public.attendance_archive (LIKE public.attendance INCLUDING ALL);

INSERT INTO public.attendance_archive
SELECT * FROM public.attendance WHERE date < (CURRENT_DATE - INTERVAL '2 years');

DELETE FROM public.attendance WHERE date < (CURRENT_DATE - INTERVAL '2 years');
```

#### ২. পুরাতন notifications/notices হাইড
নোটিশ ১ বছরের বেশি পুরাতন হলে inactive করে দিন:
```sql
UPDATE public.notices SET is_active = false WHERE created_at < (NOW() - INTERVAL '1 year');
```

#### ৩. Indexes রাখুন (already configured)
সব major queries indexed — fast থাকবে।

#### ৪. Photo storage — DB তে না, Bucket এ
আমাদের code এই pattern follow করছে। ছবি Supabase Storage এ যায়, DB তে শুধু URL।

### Auto-cleanup script (Supabase pg_cron দিয়ে — pro tier):
ফ্রি tier এ manually চালাবেন। Pro tier এ গেলে scheduled job দিয়ে auto হবে।

---

## 📊 Step 5: Long-term Scaling

### যখন ১০০+ কর্মী হবে:
- Supabase free tier এও সমস্যা হবে না (৫০০ MB এ ৫০০+ কর্মী easy)
- Brevo এ ৩০০ ইমেইল/দিন = ১০০ কর্মী × ৩ ইমেইল/দিন (notice + leave)

### যখন ৫০০+ কর্মী হবে (অনেক পরে):
- Supabase **Pro plan: $25/মাস** (৮ GB DB)
- Brevo **Lite: $25/মাস** (২০K ইমেইল)
- Vercel **Pro: $20/মাস**
- = ~৭,৫০০ টাকা/মাস (তখন business অনেক বড়)

---

## 🛡️ Step 6: Backup Strategy

### Supabase Auto-backup
Pro tier এ daily auto-backup। Free tier এ:
- Manual backup: [Supabase Dashboard → Database → Backups](https://supabase.com/dashboard/project/dfdccqadrmyhgfkzgmqk/database/backups)
- প্রতি মাসে ১ বার manual backup নিন

### Custom backup (gratis):
Settings এ একটা button যোগ করব — "সম্পূর্ণ ডাটা export" — যা সব tables এর CSV download করবে। প্রতি মাসে এটা চালান।

---

## ✅ Step 7: Security Checklist

| Item | অবস্থা |
|---|---|
| HTTPS only | ✅ Vercel auto-enforces |
| RLS (Row Level Security) | ✅ All tables have policies |
| SQL injection safe | ✅ Supabase parameterized queries |
| Password hashing | ✅ Supabase Auth (bcrypt) |
| Email verification | ✅ Required before login |
| Admin-only routes | ✅ Server-side RLS check |
| Rate limiting | ✅ Supabase auto |
| XSS protection | ✅ All user input escaped |

---

## 📋 Production Checklist (১০ মিনিটের কাজ)

- [ ] Brevo signup + SMTP credentials নেওয়া
- [ ] Supabase এ Custom SMTP কনফিগার
- [ ] ৩টা email template paste করা
- [ ] Sender name = "OD-OMS System"
- [ ] একটা test register করে দেখা — সুন্দর branded email আসছে কিনা
- [ ] Bookmark করুন এই গাইড
- [ ] প্রতি বছর January এ archive query চালানো reminder

---

## 🎓 কিছু Tips

1. **Don't over-engineer:** এখন যেটা আছে সেটা ১০ বছরের জন্য যথেষ্ট। Premature optimization এড়িয়ে চলুন।
2. **Monitor monthly:** [Supabase Dashboard](https://supabase.com/dashboard) এ গিয়ে database size দেখুন প্রতি মাসে।
3. **Test email rate:** Brevo dashboard এ daily limit দেখা যাবে।
4. **Keep code in GitHub:** আপনার ইতিমধ্যে আছে — backup হিসেবে রাখুন।
5. **পুরাতন SQL files keep করুন:** v1, v2, v3, v4 — ভবিষ্যতে কেউ database recreate করতে চাইলে কাজে লাগবে।

---

*Last updated: ${new Date().toISOString().slice(0,10)}*
*সংরক্ষণ করুন এই ফাইল!*
