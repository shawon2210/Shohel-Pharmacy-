@echo off
echo 🧹 Cleaning up processes and starting fresh...

REM Kill any existing Node processes
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo 🔄 Killing existing Node processes...
    taskkill /F /IM node.exe >NUL 2>&1
)

REM Kill any processes on port 5001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /F /PID %%a >NUL 2>&1
)

REM Kill any processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >NUL 2>&1
)

echo ✅ Cleanup complete. Starting application...
timeout /t 2 /nobreak >NUL

REM Start the application
node start.js

pause