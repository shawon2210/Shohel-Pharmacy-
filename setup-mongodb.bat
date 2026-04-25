@echo off
echo Starting MongoDB setup...

echo Checking if MongoDB is installed...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not in PATH
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting MongoDB manually...
    start /min mongod --dbpath "C:\data\db"
    timeout /t 3 >nul
)

echo MongoDB is running!
echo Database: shohel_pharmacy
echo Connection: mongodb://localhost:27017/shohel_pharmacy

cd server
echo Populating database with sample data...
npm run populate

echo Setup complete!
pause