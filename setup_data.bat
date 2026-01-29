@echo off
echo Ultimate Kanji Memory Engine - Data Setup
echo =========================================

echo Checking for Python...
python --version
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found. Please install Python 3.12+ and restart your terminal.
    echo you can run 'winget install Python.Python.3.12' manually if needed.
    pause
    exit /b
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Extracting Real Data from PDFs...
python scripts/extract_and_merge.py

echo.
echo Done! Please restart the Next.js server (npm run dev) to see the new data.
pause
