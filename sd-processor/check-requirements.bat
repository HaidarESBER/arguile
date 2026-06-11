@echo off
echo ================================================
echo System Requirements Check
echo ================================================
echo.

REM Check Python
echo [Python]
python --version 2>&1 | findstr /C:"3.10" /C:"3.11" >nul
if errorlevel 1 (
    echo ❌ Python 3.10 or 3.11 required
    python --version 2>&1
) else (
    echo ✓ Python version OK
    python --version
)
echo.

REM Check GPU
echo [GPU]
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader 2>nul
if errorlevel 1 (
    echo ❌ NVIDIA GPU not detected
    echo    Stable Diffusion requires NVIDIA GPU with 6GB+ VRAM
) else (
    echo ✓ NVIDIA GPU detected
)
echo.

REM Check Disk Space
echo [Disk Space]
for /f "tokens=3" %%a in ('dir /-c ^| findstr /C:"bytes free"') do set FREE=%%a
if %FREE% LSS 21474836480 (
    echo ❌ Low disk space (need 20GB free for models)
) else (
    echo ✓ Sufficient disk space
)
echo.

REM Check if SD installed
echo [Stable Diffusion]
if exist "..\stable-diffusion-webui" (
    echo ✓ Stable Diffusion found
    dir /b ..\stable-diffusion-webui\models\Stable-diffusion\*.safetensors 2>nul | findstr . >nul
    if errorlevel 1 (
        echo ⚠️  No models found in models directory
    ) else (
        echo ✓ Models found
    )
) else (
    echo ❌ Stable Diffusion not installed
    echo    Install from: https://github.com/AUTOMATIC1111/stable-diffusion-webui
)
echo.

REM Check Python packages
echo [Python Packages]
pip show flask >nul 2>&1
if errorlevel 1 (echo ❌ flask not installed) else (echo ✓ flask)
pip show pillow >nul 2>&1
if errorlevel 1 (echo ❌ pillow not installed) else (echo ✓ pillow)
pip show rembg >nul 2>&1
if errorlevel 1 (echo ❌ rembg not installed) else (echo ✓ rembg)
echo.

echo ================================================
echo.
pause
