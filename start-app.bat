@echo off
echo Starting Shohel Pharmacy Management System...
echo.

echo Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    echo MongoDB service not found or already running
)

echo.
echo Starting Backend Server...
cd /d "%~dp0server"
start /B "Backend" cmd /c "set PORT=5001 && node index.js"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
cd /d "%~dp0client"
start "Frontend" cmd /c "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
pause