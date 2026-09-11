@echo off
cd /d "%~dp0"
call npm run clean:next
call npm run build:pages
if errorlevel 1 exit /b %errorlevel%
call npm run preview:pages
