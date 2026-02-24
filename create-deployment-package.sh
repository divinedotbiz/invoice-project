#!/bin/bash

# Simple Invoice Generator - Deployment Package Creator
# This script creates a production-ready .zip file for deployment

set -e

echo "📦 Simple Invoice Generator - Deployment Package Creator"
echo "=================================================="
echo ""

# Create deployment directory
DEPLOY_DIR="invoice-generator-deployment"
DEPLOY_ZIP="invoice-generator-deployment.zip"

# Clean up previous builds
if [ -d "$DEPLOY_DIR" ]; then
    echo "🗑️  Cleaning previous deployment package..."
    rm -rf "$DEPLOY_DIR"
fi

# Create deployment structure
echo "📁 Creating deployment structure..."
mkdir -p "$DEPLOY_DIR"/{css,js}

# Copy HTML files
echo "📄 Copying HTML files..."
cp index.html "$DEPLOY_DIR/"
cp dashboard.html "$DEPLOY_DIR/"
cp history.html "$DEPLOY_DIR/"

# Copy CSS files
echo "🎨 Copying stylesheets..."
cp css/style.css "$DEPLOY_DIR/css/"
cp css/print.css "$DEPLOY_DIR/css/"

# Copy JavaScript files
echo "⚙️  Copying JavaScript modules..."
cp js/app.js "$DEPLOY_DIR/js/"
cp js/storage.js "$DEPLOY_DIR/js/"
cp js/calculator.js "$DEPLOY_DIR/js/"
cp js/export.js "$DEPLOY_DIR/js/"
cp js/utils.js "$DEPLOY_DIR/js/"

# Copy documentation
echo "📖 Copying documentation..."
cp DEPLOYMENT.md "$DEPLOY_DIR/"
cp USER_MANUAL.md "$DEPLOY_DIR/"
cp DEPLOYMENT_PACKAGE.md "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/" 2>/dev/null || echo "⚠️  README.md not found (optional)"

# Create README for deployment
cat > "$DEPLOY_DIR/PXXL_APP_READY.txt" << 'EOF'
========================================
Simple Invoice Generator
Production Ready for pxxl.app
========================================

✅ All files are production-ready
✅ Zero configuration needed
✅ Static files only (no build required)
✅ Ready to upload to pxxl.app

DEPLOYMENT STEPS:
1. Set index.html as entry point
2. Upload all files to pxxl.app
3. Enable static file serving for css/ and js/
4. Deploy and test

For detailed instructions, see DEPLOYMENT.md

========================================
EOF

# Create .zip file
echo "📦 Creating deployment .zip file..."
if command -v zip &> /dev/null; then
    zip -r "$DEPLOY_ZIP" "$DEPLOY_DIR" -q
else
    # Fallback for Windows
    echo "⚠️  zip command not found, attempting alternative..."
    Compress-Archive -Path "$DEPLOY_DIR" -DestinationPath "$DEPLOY_ZIP" -Force 2>/dev/null || \
    echo "📦 Please manually zip the $DEPLOY_DIR directory"
fi

# Calculate size
if [ -f "$DEPLOY_ZIP" ]; then
    SIZE=$(du -h "$DEPLOY_ZIP" | cut -f1)
    echo ""
    echo "✅ Deployment package created: $DEPLOY_ZIP ($SIZE)"
else
    SIZE=$(du -sh "$DEPLOY_DIR" | cut -f1)
    echo ""
    echo "✅ Deployment directory created: $DEPLOY_DIR ($SIZE)"
fi

echo ""
echo "📋 Package Contents:"
echo "  - 3 HTML pages"
echo "  - 2 CSS files"
echo "  - 5 JavaScript modules"
echo "  - Complete documentation"
echo ""

echo "🚀 Ready for Deployment!"
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT.md for detailed instructions"
echo "2. Upload to pxxl.app"
echo "3. Set index.html as entry point"
echo "4. Deploy and test"
echo ""
echo "=================================================="
