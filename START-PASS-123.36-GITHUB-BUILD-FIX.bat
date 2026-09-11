@echo off
setlocal
echo [VALIE] Pass 123.36 - GitHub Build Fix + Mobile Hero Scroll Lifecycle
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
