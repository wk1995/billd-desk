@echo off
setlocal
cd /d "%~dp0..\..\..\.."
set ELECTRON_RUN_AS_NODE=
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 1 /nobreak >nul
start "" "%CD%\node_modules\.pnpm\electron@33.2.1\node_modules\electron\dist\electron.exe" "%CD%" --no-sandbox
