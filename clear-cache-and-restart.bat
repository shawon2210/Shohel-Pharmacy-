@echo off
echo Clearing React cache and restarting...

echo Stopping any running processes...
taskkill /f /im node.exe 2>nul

echo Clearing npm cache...
cd client
npm start -- --reset-cache

echo.
echo If the warnings persist:
echo 1. Close browser completely
echo 2. Clear browser cache (Ctrl+Shift+Delete)
echo 3. Restart browser
echo 4. Go to http://localhost:3000

pause