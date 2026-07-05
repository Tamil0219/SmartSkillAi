@echo off
echo ==========================================
echo   SmartSkill-AI GitHub Push Helper
echo ==========================================
echo.
echo Initializing Git repository...
git init

echo.
echo Adding files to staging...
git add .

echo.
echo Committing files...
git commit -m "Initial commit: SmartSkill-AI full-stack application"

echo.
echo Setting branch to main...
git branch -M main

echo.
echo Adding remote repository...
git remote add origin https://github.com/Tamil0219/SmartSkill-AI.git

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ==========================================
echo   Done! Press any key to exit.
echo ==========================================
pause
