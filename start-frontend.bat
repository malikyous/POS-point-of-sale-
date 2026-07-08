@echo off
title POS Frontend
cd /d "%~dp0frontend"

echo ========================================
echo   POS Frontend Starting...
echo   URL: http://localhost:3000
echo ========================================
echo.
echo Make sure BACKEND is running first!
echo (Run start-backend.bat in another window)
echo.

npm run dev
pause
