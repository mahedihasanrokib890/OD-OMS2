# OD-OMS · একটাই স্ক্রিপ্ট — সব কাজ এক ক্লিকে

`e:\odomd` ফোল্ডারে গিয়ে এই ৩টা ফাইল ডাবল-ক্লিক করুন (বা cmd তে রান করুন):

---

## ✅ ১. `1-vercel-setup.cmd` — সবার আগে এটা চালান (একবারই)

কী করবে:
- Vercel CLI install করবে (যদি না থাকে)
- Vercel এ লগইন করাবে (browser খুলবে)
- Project link করবে (`od-oms-2`)
- ৩টা env var সেট করবে:
  - `GMAIL_USER` = mahedihasanrokib83@gmail.com
  - `GMAIL_APP_PASSWORD` = piqvvistaztvnmuj
  - `SUPABASE_SERVICE_ROLE_KEY` = (আপনাকে paste করতে বলবে)
- Production redeploy দিবে

**Service Role Key কোথায় পাবেন?**
স্ক্রিপ্ট চলার সময় browser এ খুলবে:
https://supabase.com/dashboard/project/dfdccqadrmyhgfkzgmqk/settings/api
"service_role" এর পাশে **Reveal** ক্লিক → কপি → cmd তে paste

---

## 🧪 ২. `2-test-email.cmd` — Setup এর পর টেস্ট

কী করবে:
- `https://od-oms-2.vercel.app/api/notify` কে call দিবে
- mahedihasanrokib83@gmail.com এ একটা টেস্ট ছুটির আবেদনের ইমেইল পাঠাবে
- Response দেখাবে — `"ok":true` মানে সফল

ইনবক্স / স্প্যাম ফোল্ডার চেক করুন।

---

## 🚀 ৩. `3-deploy-changes.cmd` — পরবর্তীতে কোডে পরিবর্তন আনলে

কী করবে:
- Modified ফাইল দেখাবে
- Commit message চাবে
- GitHub এ push করবে
- Vercel auto-deploy হবে

---

## যা যা ফিক্স করা হয়েছে এই version এ

1. **PDF প্রিন্ট মোবাইলে কাজ করবে** — in-app overlay (popup blocker bypass)
2. **ইমেইল failure এর জন্য visible toast** — silent fail বন্ধ
3. **Hardcoded admin fallback** — DB তে admin না পেলেও ইমেইল যাবে
4. **Decision email এ employee name** — ব্যক্তিগত ছোঁয়া

---

## সমস্যা হলে

- **Vercel CLI install ফেইল** → Node.js install করুন: https://nodejs.org
- **Login ফেইল** → manually browser এ vercel.com এ লগইন করে আবার চেষ্টা করুন
- **ইমেইল আসছে না** → `2-test-email.cmd` এর response দেখুন, error message paste করুন
