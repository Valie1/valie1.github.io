@echo off
setlocal
cd /d "%~dp0"
echo [VALIE] Pass 123.27 development server
call npm run dev:fresh
