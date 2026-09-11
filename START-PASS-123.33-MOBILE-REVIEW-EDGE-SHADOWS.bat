@echo off
setlocal
echo [VALIE] Pass 123.33 - Mobile Review Edge Shadows
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
