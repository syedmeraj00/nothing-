@echo off
echo Checking ESG Database...
cd /d "%~dp0"
node check-database.js
pause