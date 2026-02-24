@echo off
REM Simple Invoice Generator - Deployment Package Creator (Windows)
REM This script creates a production-ready deployment folder for pxxl.app

echo.
echo ========================================
echo Simple Invoice Generator
echo Deployment Package Creator (Windows)
echo ========================================
echo.

REM Set deployment directory name
set DEPLOY_DIR=invoice-generator-deployment
set DEPLOY_ZIP=invoice-generator-deployment.zip

REM Clean up previous builds
if exist "%DEPLOY_DIR%" (
    echo 🗑️  Cleaning previous deployment package...
    rmdir /s /q "%DEPLOY_DIR%"
)

REM Create deployment structure
echo 📁 Creating deployment structure...
mkdir "%DEPLOY_DIR%\css"
mkdir "%DEPLOY_DIR%\js"

REM Copy HTML files
echo 📄 Copying HTML files...
copy /Y index.html "%DEPLOY_DIR%\" > nul
copy /Y dashboard.html "%DEPLOY_DIR%\" > nul
copy /Y history.html "%DEPLOY_DIR%\" > nul

REM Copy CSS files
echo 🎨 Copying stylesheets...
copy /Y "css\style.css" "%DEPLOY_DIR%\css\" > nul
copy /Y "css\print.css" "%DEPLOY_DIR%\css\" > nul

REM Copy JavaScript files
echo ⚙️  Copying JavaScript modules...
copy /Y "js\app.js" "%DEPLOY_DIR%\js\" > nul
copy /Y "js\storage.js" "%DEPLOY_DIR%\js\" > nul
copy /Y "js\calculator.js" "%DEPLOY_DIR%\js\" > nul
copy /Y "js\export.js" "%DEPLOY_DIR%\js\" > nul
copy /Y "js\utils.js" "%DEPLOY_DIR%\js\" > nul

REM Copy documentation
echo 📖 Copying documentation...
copy /Y DEPLOYMENT.md "%DEPLOY_DIR%\" > nul
copy /Y USER_MANUAL.md "%DEPLOY_DIR%\" > nul
copy /Y DEPLOYMENT_PACKAGE.md "%DEPLOY_DIR%\" > nul
if exist README.md copy /Y README.md "%DEPLOY_DIR%\" > nul

REM Create ready marker
(
    echo ========================================
    echo Simple Invoice Generator
    echo Production Ready for pxxl.app
    echo ========================================
    echo.
    echo ✅ All files are production-ready
    echo ✅ Zero configuration needed
    echo ✅ Static files only (no build required^)
    echo ✅ Ready to upload to pxxl.app
    echo.
    echo DEPLOYMENT STEPS:
    echo 1. Set index.html as entry point
    echo 2. Upload all files to pxxl.app
    echo 3. Enable static file serving for css/ and js/
    echo 4. Deploy and test
    echo.
    echo For detailed instructions, see DEPLOYMENT.md
    echo.
    echo ========================================
) > "%DEPLOY_DIR%\PXXL_APP_READY.txt"

echo.
echo ✅ Deployment package created: %DEPLOY_DIR%
echo.
echo 📋 Package Contents:
echo   - 3 HTML pages
echo   - 2 CSS files
echo   - 5 JavaScript modules
echo   - Complete documentation
echo.
echo 🚀 Ready for Deployment!
echo.
echo Next steps:
echo 1. Review DEPLOYMENT.md for detailed instructions
echo 2. Zip the "%DEPLOY_DIR%" folder
echo 3. Upload to pxxl.app
echo 4. Set index.html as entry point
echo 5. Deploy and test
echo.
echo ========================================
echo.

pause
