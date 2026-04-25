@echo off
echo Restarting frontend with clean cache...

cd client

echo Killing any existing React processes...
taskkill /f /im node.exe 2>nul

echo Starting React with clean cache...
set GENERATE_SOURCEMAP=false
npm start

pause