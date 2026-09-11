@echo off
setlocal
echo [VALIE] Pass 123.39 - Real Desktop Arrow Motion Fix
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
