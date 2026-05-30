@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title OD-OMS · Gmail App Password ফিক্স

echo.
echo ════════════════════════════════════════════════════════════
echo   ❌ Gmail Error: Username and Password not accepted (535-5.7.8)
echo ════════════════════════════════════════════════════════════
echo.
echo এর মানে আপনার পুরনো App Password টা আর কাজ করছে না।
echo নতুন একটা App Password বানিয়ে নিচে paste করুন।
echo.
echo ────────────────────────────────────────────────────────────
echo  ধাপ ১: 2-Step Verification চালু করুন (যদি না থাকে)
echo ────────────────────────────────────────────────────────────
echo.
echo  Browser এ যান: https://myaccount.google.com/security
echo  "2-Step Verification" → On করুন (ফোনে কোড আসবে)
echo.
echo ────────────────────────────────────────────────────────────
echo  ধাপ ২: নতুন App Password তৈরি করুন
echo ────────────────────────────────────────────────────────────
echo.
echo  Browser এ যান: https://myaccount.google.com/apppasswords
echo  - App name: OD-OMS
echo  - "Create" ক্লিক করুন
echo  - ১৬ অক্ষরের code আসবে (e.g., abcd efgh ijkl mnop)
echo  - সব space বাদ দিয়ে কপি করুন (16 chars together)
echo.
echo ────────────────────────────────────────────────────────────
echo  Browser এ এই দুটো URL এখন খুলছি...
echo ────────────────────────────────────────────────────────────
start https://myaccount.google.com/security
timeout /t 2 >nul
start https://myaccount.google.com/apppasswords

echo.
echo ────────────────────────────────────────────────────────────
echo  ধাপ ৩: নতুন ১৬-অক্ষরের App Password নিচে paste দিন
echo  (space ছাড়া, যেমন: abcdefghijklmnop)
echo ────────────────────────────────────────────────────────────
echo.
set /p NEW_PASS="নতুন App Password: "

REM Strip spaces just in case
set NEW_PASS=!NEW_PASS: =!

if "!NEW_PASS!"=="" (
    echo ❌ কিছু পেস্ট করেননি — exit করছি
    pause
    exit /b 1
)

echo.
echo Password length: 
echo|set /p="!NEW_PASS!" | find /c /v ""

REM Check Vercel CLI
where vercel >nul 2>nul
if errorlevel 1 (
    echo ❌ Vercel CLI পাওয়া যায়নি — আগে 1-vercel-setup.cmd চালান
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo [1/3] পুরনো GMAIL_APP_PASSWORD সরাচ্ছি...
call vercel env rm GMAIL_APP_PASSWORD production --yes 2>nul
call vercel env rm GMAIL_APP_PASSWORD preview --yes 2>nul
call vercel env rm GMAIL_APP_PASSWORD development --yes 2>nul

echo.
echo [2/3] নতুন GMAIL_APP_PASSWORD সেট করছি...
echo !NEW_PASS! | call vercel env add GMAIL_APP_PASSWORD production
echo !NEW_PASS! | call vercel env add GMAIL_APP_PASSWORD preview
echo !NEW_PASS! | call vercel env add GMAIL_APP_PASSWORD development

echo.
echo [3/3] Production redeploy করছি...
call vercel --prod --yes

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ App Password আপডেট হয়েছে এবং deploy হয়েছে!
echo    এখন 2-test-email.cmd চালিয়ে টেস্ট করুন।
echo ════════════════════════════════════════════════════════════
echo.
pause
