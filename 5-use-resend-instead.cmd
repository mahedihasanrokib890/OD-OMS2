@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title OD-OMS · Resend দিয়ে ইমেইল (Gmail এর বিকল্প)

echo.
echo ════════════════════════════════════════════════════════════
echo   📧 Resend দিয়ে ইমেইল পাঠানো (Gmail এর চেয়ে অনেক সহজ)
echo ════════════════════════════════════════════════════════════
echo.
echo Resend কেন?
echo   - ১০০%% ফ্রি (৩০০০ ইমেইল/মাস)
echo   - কোনো 2FA / App Password ঝামেলা নেই
echo   - ২ মিনিটে সাইনআপ
echo   - সরাসরি ইনবক্সে যায় (স্প্যাম এ যায় না)
echo.
echo ────────────────────────────────────────────────────────────
echo  ধাপ ১: Resend এ সাইনআপ
echo ────────────────────────────────────────────────────────────
echo.
echo  Browser এ এই URL খুলছি:
echo  https://resend.com/signup
echo.
echo  GitHub দিয়ে সাইনআপ করুন (১ ক্লিকেই হয়ে যাবে)।
echo.
start https://resend.com/signup

echo Press any key যখন signup শেষ হবে...
pause >nul

echo.
echo ────────────────────────────────────────────────────────────
echo  ধাপ ২: API Key বানান
echo ────────────────────────────────────────────────────────────
echo.
echo  Browser এ এই URL খুলছি:
echo  https://resend.com/api-keys
echo.
echo  - "Create API Key" ক্লিক করুন
echo  - Name: OD-OMS
echo  - Permission: Full access (default)
echo  - "re_..." দিয়ে শুরু একটা key পাবেন — পুরোটা copy করুন
echo.
start https://resend.com/api-keys

echo.
set /p RESEND_KEY="Resend API Key paste দিন (re_ দিয়ে শুরু): "

if "!RESEND_KEY!"=="" (
    echo ❌ কিছু পেস্ট করেননি — exit করছি
    pause
    exit /b 1
)

REM Check Vercel CLI
where vercel >nul 2>nul
if errorlevel 1 (
    echo ❌ Vercel CLI পাওয়া যায়নি — আগে 1-vercel-setup.cmd চালান
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo [1/3] পুরনো RESEND_API_KEY সরাচ্ছি...
call vercel env rm RESEND_API_KEY production --yes 2>nul
call vercel env rm RESEND_API_KEY preview --yes 2>nul
call vercel env rm RESEND_API_KEY development --yes 2>nul

echo.
echo [2/3] নতুন RESEND_API_KEY সেট করছি...
echo !RESEND_KEY! | call vercel env add RESEND_API_KEY production
echo !RESEND_KEY! | call vercel env add RESEND_API_KEY preview
echo !RESEND_KEY! | call vercel env add RESEND_API_KEY development

REM Set FROM_EMAIL — Resend default sandbox sender works for testing
echo.
echo [2.5/3] Default sender সেট করছি (onboarding@resend.dev — শুধু আপনার নিজের email এ পাঠাবে)...
echo.
echo ⚠️  Note: Resend free এর সাথে শুধু আপনার নিজের signup email এ ইমেইল যাবে।
echo    Production এ অন্যদের কাছে পাঠাতে — Resend এ একটা domain verify করতে হবে
echo    (vercel domain যথেষ্ট নয় — আলাদা domain লাগবে অথবা use Gmail fallback)।
echo.
echo onboarding@resend.dev | call vercel env add FROM_EMAIL production 2>nul

echo.
echo [3/3] Production redeploy করছি...
call vercel --prod --yes

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ Resend setup শেষ! এখন 2-test-email.cmd চালান।
echo    api/notify.js auto-detect করবে — Resend আগে ট্রাই করবে,
echo    Resend ফেইল হলে Gmail এ fallback করবে।
echo ════════════════════════════════════════════════════════════
echo.
pause
