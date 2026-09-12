@echo off
npm run build:pages
if errorlevel 1 exit /b %errorlevel%
npm run preview:pages
