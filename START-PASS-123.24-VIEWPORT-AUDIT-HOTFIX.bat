@echo off
setlocal
cd /d "%~dp0"
echo [VALIE] Pass 123.24 - Viewport Audit Hotfix
echo [VALIE] Building GitHub Pages export before preview...
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
