@echo off
chcp 65001 >nul
title OD-OMS · Gmail Setup Diagnostic

echo.
echo ════════════════════════════════════════════════════════════
echo   🔍 Gmail Setup Diagnostic
echo ════════════════════════════════════════════════════════════
echo.
echo এখন browser এ ৩টা পেজ খুলব। প্রত্যেকটায় কী দেখলেন তা বলুন।
echo.
pause

echo.
echo ────────────────────────────────────────────────────────────
echo  পেজ ১: Account Security Overview
echo ────────────────────────────────────────────────────────────
start https://myaccount.google.com/security
echo.
echo  ✅ Browser এ "2-Step Verification" সেকশন খুঁজুন:
echo     - সবুজ ✓ icon সহ "On" লেখা থাকতে হবে
echo     - "Off" থাকলে — এটাই মূল সমস্যা
echo.
echo  ⚠️ যদি সম্পূর্ণ Section ই না দেখায় — Google Workspace admin এ block করা
echo.
pause

echo.
echo ────────────────────────────────────────────────────────────
echo  পেজ ২: App Passwords List
echo ────────────────────────────────────────────────────────────
start https://myaccount.google.com/apppasswords
echo.
echo  ✅ এখানে দেখুন:
echo     - "Your app passwords" এর নিচে কোনো entry আছে কি না
echo     - "OD-OMS" নামে কিছু থাকা উচিত
echo     - যদি page ই open না হয় — 2-Step Verification on নেই
echo     - যদি "We can't show app passwords" message আসে — Workspace block করেছে
echo.
pause

echo.
echo ────────────────────────────────────────────────────────────
echo  পেজ ৩: Less Secure Apps (যদি 2FA off থাকে)
echo ────────────────────────────────────────────────────────────
start https://myaccount.google.com/lesssecureapps
echo.
echo  Note: Google এই option ২০২২ এ বন্ধ করেছে — তাই এটা কাজ করবে না
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════
echo  ফলাফল আমাকে বলুন:
echo ════════════════════════════════════════════════════════════
echo  1. পেজ ১ এ "2-Step Verification" - On / Off / দেখা যায়নি?
echo  2. পেজ ২ - App passwords list দেখা যায় / যায় না?
echo  3. কোনো error message দেখলে সেটা কী?
echo.
pause
