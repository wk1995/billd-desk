@echo off
setlocal
cd /d "%~dp0..\..\..\.."
set ELECTRON_RUN_AS_NODE=
set "NODE=C:\Users\wk\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" ".\node_modules\vite\bin\vite.js" build
