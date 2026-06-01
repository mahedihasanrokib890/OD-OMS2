@echo off
chcp 65001 >nul
title OD-OMS · Push Changes & Deploy

echo.
echo ════════════════════════════════════════════════════════════
echo   OD-OMS · কোড পরিবর্তন GitHub এ push + Vercel deploy
echo ════════════════════════════════════════════════════════════
echo.

REM Add Git/GitHub CLI to PATH (winget installed)
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

cd /d "%~dp0"

echo [1/3] পরিবর্তিত ফাইল চেক করছি...
git status --short
echo.

echo [2/3] Commit করছি...
git add .
set /p MSG="Commit message লিখুন (Enter চাপলে default): "
if "%MSG%"=="" set MSG=update: misc fixes
git commit -m "%MSG%"

echo.
echo [3/3] GitHub এ push করছি (Vercel auto-deploy হবে)...
git push origin main

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ Push হয়ে গেছে! Vercel ১-২ মিনিটের মধ্যে auto-deploy করবে।
echo    Live: https://od-oms-2.vercel.app
echo    Vercel Dashboard: https://vercel.com/dashboard
echo ════════════════════════════════════════════════════════════
echo.
pause
