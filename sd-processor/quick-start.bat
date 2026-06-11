@echo off
title AI Image Processor - Quick Start
color 0A

echo.
echo  ╔════════════════════════════════════════════════╗
echo  ║   AI Image Processor - Quick Start             ║
echo  ╚════════════════════════════════════════════════╝
echo.

REM Check if everything is set up
if not exist "server.py" (
    echo ERROR: server.py not found!
    echo Please run install-windows.bat first.
    pause
    exit /b 1
)

REM Check if SD is running
echo [1/3] Checking Stable Diffusion status...
curl -s http://127.0.0.1:7860/sdapi/v1/sd-models >nul 2>&1
if errorlevel 1 (
    echo.
    echo  Stable Diffusion is NOT running!
    echo.
    echo  Starting Stable Diffusion...
    echo  This will open a new window. Please wait 5-10 minutes for it to load.
    echo.
    start cmd /k "cd ..\stable-diffusion-webui && webui.bat --api --listen"
    echo.
    echo  Waiting 60 seconds for SD to initialize...
    timeout /t 60 /nobreak >nul
) else (
    echo  ✓ Stable Diffusion is running!
)
echo.

REM Start processor
echo [2/3] Starting AI Processor...
start cmd /k "title AI Processor Server && python server.py"
timeout /t 3 /nobreak >nul
echo  ✓ Processor started on http://localhost:5001
echo.

REM Open admin panel
echo [3/3] Opening admin panel...
timeout /t 2 /nobreak >nul
start http://localhost:3000/admin/image-processor
echo  ✓ Admin panel opened!
echo.
echo ════════════════════════════════════════════════
echo.
echo  🎉 Everything is running!
echo.
echo  Admin Panel: http://localhost:3000/admin/image-processor
echo  Processor API: http://localhost:5001
echo  Stable Diffusion: http://localhost:7860
echo.
echo ════════════════════════════════════════════════
echo.
pause
