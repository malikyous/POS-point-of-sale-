@echo off
echo Starting POS System...
echo.
echo Step 1: Starting Backend (wait 3 seconds)...
start "POS Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 4 /nobreak >nul
echo Step 2: Starting Frontend...
start "POS Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Done! Open http://localhost:3000 in your browser.
pause
