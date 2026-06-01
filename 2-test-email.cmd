@echo off
chcp 65001 >nul
title OD-OMS · Test Email API

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo   OD-OMS · Email API Test (file-based payload)
echo ════════════════════════════════════════════════════════════
echo.
echo এই স্ক্রিপ্ট test-payload.json ফাইল থেকে JSON পড়ে
echo Vercel এ deployed /api/notify call দিবে।
echo.
pause

echo.
echo Calling https://od-oms-2.vercel.app/api/notify ...
echo.

curl -s -X POST https://od-oms-2.vercel.app/api/notify ^
     -H "Content-Type: application/json" ^
     --data-binary "@test-payload.json"

echo.
echo.
echo ════════════════════════════════════════════════════════════
echo যদি উপরে "ok":true দেখা যায় — Gmail ইনবক্স / স্প্যাম চেক করুন
echo যদি error দেখা যায় — error message screenshot পাঠান
echo ════════════════════════════════════════════════════════════
echo.
pause
