@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title OD-OMS · Gmail Password Fix v2 (whitespace-safe)

echo.
echo ════════════════════════════════════════════════════════════
echo   Gmail App Password v2 — whitespace-safe set
echo ════════════════════════════════════════════════════════════
echo.
echo যেই 16-char password আগে paste করেছিলেন সেটাই আবার দিন
echo (space আছে কি নেই — যা আছে তা-ই দিন, script clean করবে)
echo.

set /p NEW_PASS="App Password: "

REM Strip ALL whitespace (space, tab, CR, LF)
set "NEW_PASS=!NEW_PASS: =!"
set "NEW_PASS=!NEW_PASS:	=!"

if "!NEW_PASS!"=="" (
    echo ❌ কিছু পেস্ট করেননি
    pause
    exit /b 1
)

REM Show length to verify it's 16
set "TMPVAR=!NEW_PASS!"
set LEN=0
:countloop
if defined TMPVAR (
    set "TMPVAR=!TMPVAR:~1!"
    set /a LEN+=1
    goto countloop
)
echo ✅ Cleaned password length: !LEN! chars (should be 16)

if not "!LEN!"=="16" (
    echo.
    echo ⚠️  WARNING: length 16 হয়নি — সম্ভবত ভুল paste হয়েছে।
    echo     তবুও চালিয়ে যাব? (Y/N)
    set /p CONT="চালিয়ে যাব? "
    if /i not "!CONT!"=="Y" exit /b 1
)

REM Write to temp file WITHOUT trailing newline
> "%TEMP%\odoms_pass.txt" <nul set /p="!NEW_PASS!"

REM Verify temp file content
echo.
echo Temp file content (length check):
for %%A in ("%TEMP%\odoms_pass.txt") do echo File size: %%~zA bytes (should be 16)

where vercel >nul 2>nul
if errorlevel 1 (
    echo ❌ Vercel CLI পাওয়া যায়নি
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo [1/4] পুরনো GMAIL_APP_PASSWORD সরাচ্ছি...
call vercel env rm GMAIL_APP_PASSWORD production --yes 2>nul
call vercel env rm GMAIL_APP_PASSWORD preview --yes 2>nul
call vercel env rm GMAIL_APP_PASSWORD development --yes 2>nul

echo.
echo [2/4] Production এ নতুন password সেট করছি...
call vercel env add GMAIL_APP_PASSWORD production < "%TEMP%\odoms_pass.txt"

echo.
echo [3/4] Preview + Development এও সেট করছি...
call vercel env add GMAIL_APP_PASSWORD preview < "%TEMP%\odoms_pass.txt"
call vercel env add GMAIL_APP_PASSWORD development < "%TEMP%\odoms_pass.txt"

REM Cleanup temp file
del "%TEMP%\odoms_pass.txt" 2>nul

echo.
echo [4/4] Production redeploy করছি...
call vercel --prod --yes

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ App Password whitespace ছাড়া সঠিকভাবে সেভ হয়েছে!
echo    এখন 2-test-email.cmd চালান।
echo ════════════════════════════════════════════════════════════
echo.
pause
