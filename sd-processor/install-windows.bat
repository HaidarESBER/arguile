@echo off
echo ================================================
echo AI Image Processor - Automated Setup
echo ================================================
echo.

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Please install Python 3.10 or 3.11 from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python found!
echo.

REM Check NVIDIA GPU
echo [2/5] Checking GPU...
nvidia-smi >nul 2>&1
if errorlevel 1 (
    echo WARNING: NVIDIA GPU not detected!
    echo Stable Diffusion requires NVIDIA GPU with 6GB+ VRAM
    echo.
    set /p continue="Continue anyway? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
)
echo GPU detected!
echo.

REM Install Python dependencies
echo [3/5] Installing Python dependencies...
echo This may take 5-10 minutes...
pip install flask flask-cors pillow rembg opencv-python numpy requests
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

REM Check if SD is installed
echo [4/5] Checking for Stable Diffusion...
if exist "..\stable-diffusion-webui\webui.bat" (
    echo Stable Diffusion found!
) else (
    echo Stable Diffusion NOT found.
    echo.
    echo Please install Stable Diffusion first:
    echo 1. Download from: https://github.com/AUTOMATIC1111/stable-diffusion-webui
    echo 2. Place in: %CD%\..
    echo 3. Run this script again
    echo.
    set /p install="Open download page? (y/n): "
    if /i "%install%"=="y" start https://github.com/AUTOMATIC1111/stable-diffusion-webui
    pause
    exit /b 1
)
echo.

REM Create start script
echo [5/5] Creating launch scripts...
echo @echo off > start-processor.bat
echo echo Starting AI Image Processor... >> start-processor.bat
echo python server.py >> start-processor.bat
echo Created start-processor.bat
echo.

REM Create SD launch script
echo @echo off > start-sd.bat
echo echo Starting Stable Diffusion with API... >> start-sd.bat
echo cd ..\stable-diffusion-webui >> start-sd.bat
echo call webui.bat --api --listen >> start-sd.bat
echo Created start-sd.bat
echo.

echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Start Stable Diffusion: Double-click start-sd.bat
echo 2. Wait for SD to load (5-10 minutes first time)
echo 3. Start Processor: Double-click start-processor.bat
echo 4. Access admin panel: http://localhost:3000/admin/image-processor
echo.
echo Press any key to start Stable Diffusion now...
pause >nul
start start-sd.bat
