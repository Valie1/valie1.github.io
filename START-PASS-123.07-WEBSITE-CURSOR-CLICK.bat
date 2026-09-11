@echo off
cd /d "%~dp0"
call npm install
call npm run launch:check
if errorlevel 1 pause & exit /b 1
call npm run dev:portfolio
