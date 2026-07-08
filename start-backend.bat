@echo off
title POS Backend
cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Run: python -m venv venv
    echo Then: venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo ========================================
echo   POS Backend Starting...
echo   URL: http://localhost:5000
echo   MySQL password: EMPTY (XAMPP)
echo ========================================
echo.
echo DO NOT CLOSE THIS WINDOW!
echo.

venv\Scripts\python.exe app.py
pause
