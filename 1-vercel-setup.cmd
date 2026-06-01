@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title OD-OMS · Vercel Environment Setup

echo.
echo ════════════════════════════════════════════════════════════
echo   OD-OMS · Vercel Environment Variables Setup
echo ════════════════════════════════════════════════════════════
echo.
echo এই স্ক্রিপ্ট Vercel এ ৩টি env var সেট করবে এবং redeploy দিবে।
echo এর আগে নিশ্চিত করুন: Node.js install আছে।
echo.
pause

REM ─── 1. Install Vercel CLI if missing ───────────────────────
where vercel >nul 2>nul
if errorlevel 1 (
    echo [1/5] Vercel CLI install করছি...
    call npm i -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI install ব্যর্থ। npm আছে কি? Node.js থেকে install করুন: https://nodejs.org
        pause
        exit /b 1
    )
) else (
    echo [1/5] ✅ Vercel CLI আগেই installed
)

REM ─── 2. Login to Vercel ─────────────────────────────────────
echo.
echo [2/5] Vercel এ login করুন (browser খুলবে)...
call vercel login
if errorlevel 1 (
    echo ❌ Login ব্যর্থ
    pause
    exit /b 1
)

REM ─── 3. Link project ────────────────────────────────────────
echo.
echo [3/5] Project link করছি... (od-oms-2 select করুন)
call vercel link --yes
if errorlevel 1 (
    echo ⚠️  Auto-link ব্যর্থ — manually করুন
    call vercel link
)

REM ─── 4. Set env vars ────────────────────────────────────────
echo.
echo [4/5] Environment variables সেট করছি...
echo.

REM GMAIL_USER
echo Setting GMAIL_USER...
call vercel env rm GMAIL_USER production --yes 2>nul
echo mahedihasanrokib83@gmail.com | call vercel env add GMAIL_USER production
call vercel env rm GMAIL_USER preview --yes 2>nul
echo mahedihasanrokib83@gmail.com | call vercel env add GMAIL_USER preview
call vercel env rm GMAIL_USER development --yes 2>nul
echo mahedihasanrokib83@gmail.com | call vercel env add GMAIL_USER development

REM GMAIL_APP_PASSWORD
echo Setting GMAIL_APP_PASSWORD...
call vercel env rm GMAIL_APP_PASSWORD production --yes 2>nul
echo piqvvistaztvnmuj | call vercel env add GMAIL_APP_PASSWORD production
call vercel env rm GMAIL_APP_PASSWORD preview --yes 2>nul
echo piqvvistaztvnmuj | call vercel env add GMAIL_APP_PASSWORD preview
call vercel env rm GMAIL_APP_PASSWORD development --yes 2>nul
echo piqvvistaztvnmuj | call vercel env add GMAIL_APP_PASSWORD development

REM SUPABASE_SERVICE_ROLE_KEY
echo.
echo Setting SUPABASE_SERVICE_ROLE_KEY...
echo.
echo ⚠️  এখন Supabase Service Role Key লাগবে।
echo    Browser এ যান: https://supabase.com/dashboard/project/dfdccqadrmyhgfkzgmqk/settings/api
echo    "service_role" key copy করুন (Reveal click করে), তারপর নিচে paste করুন।
echo.
set /p SUPA_KEY="Supabase service_role key এখানে paste দিন: "

if "!SUPA_KEY!"=="" (
    echo ⚠️  Service role key skip করা হলো — forgot-password / reset-password কাজ করবে না
) else (
    call vercel env rm SUPABASE_SERVICE_ROLE_KEY production --yes 2>nul
    echo !SUPA_KEY! | call vercel env add SUPABASE_SERVICE_ROLE_KEY production
    call vercel env rm SUPABASE_SERVICE_ROLE_KEY preview --yes 2>nul
    echo !SUPA_KEY! | call vercel env add SUPABASE_SERVICE_ROLE_KEY preview
    call vercel env rm SUPABASE_SERVICE_ROLE_KEY development --yes 2>nul
    echo !SUPA_KEY! | call vercel env add SUPABASE_SERVICE_ROLE_KEY development
)

REM ─── 5. Redeploy ────────────────────────────────────────────
echo.
echo [5/5] Production এ redeploy করছি...
call vercel --prod --yes

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ সব হয়ে গেছে!
echo    Live URL: https://od-oms-2.vercel.app
echo ════════════════════════════════════════════════════════════
echo.
pause
