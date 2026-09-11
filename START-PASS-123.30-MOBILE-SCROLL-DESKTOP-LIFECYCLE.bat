@echo off
setlocal
cd /d "%~dp0"
echo [VALIE] Pass 123.30 - Mobile Scroll Desktop Lifecycle
where node >nul 2>nul || (echo Node.js is required.& pause & exit /b 1)
if not exist node_modules call npm install
call npm run build:pages
if errorlevel 1 (pause & exit /b 1)
call npm run preview:pages
