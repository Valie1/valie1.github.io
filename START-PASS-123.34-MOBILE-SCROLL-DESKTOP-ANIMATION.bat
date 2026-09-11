@echo off
setlocal
echo [VALIE] Pass 123.34 - Mobile Scroll Desktop Animation
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
