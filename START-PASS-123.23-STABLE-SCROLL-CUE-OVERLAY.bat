@echo off
setlocal
cd /d "%~dp0"
echo [VALIE] Pass 123.23 - Stable Scroll Cue Overlay
echo [VALIE] Building GitHub Pages export before preview...
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
