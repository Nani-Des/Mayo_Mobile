#!/bin/bash
# Mayo Mobile Fix Script
# This script fixes common React Native/Expo startup errors
# Run this from the Mayo_Mobile directory

echo "============================================"
echo "Mayo Mobile - Fix Startup Errors"
echo "============================================"
echo ""

# Step 1: Clear Metro bundler cache
echo "Step 1: Clearing Metro bundler cache..."
rm -rf node_modules/.cache
echo "✓ Metro cache cleared"
echo ""

# Step 2: Clear Expo cache
echo "Step 2: Clearing Expo cache..."
rm -rf .expo
rm -rf node_modules/.expo
echo "✓ Expo cache cleared"
echo ""

# Step 3: Remove node_modules and package-lock.json
echo "Step 3: Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
echo "✓ Removed node_modules and package-lock.json"
echo ""

# Step 4: Clean npm cache (optional but recommended)
echo "Step 4: Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true
echo "✓ NPM cache cleaned"
echo ""

# Step 5: Reinstall dependencies
echo "Step 5: Reinstalling dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Step 6: Verify installation
echo "Step 6: Verifying installation..."
if [ -d "node_modules" ]; then
    echo "✓ node_modules exists"
else
    echo "✗ ERROR: node_modules not created"
    exit 1
fi
echo ""

# Step 7: Reset Expo (optional)
echo "Step 7: Resetting Expo..."
npx expo reset --hard 2>/dev/null || echo "⚠ Expo reset skipped (not critical)"
echo ""

# Step 8: Verify Metro config
echo "Step 8: Verifying metro.config.js..."
if [ -f "metro.config.js" ]; then
    echo "✓ metro.config.js exists"
else
    echo "✗ ERROR: metro.config.js missing"
fi
echo ""

echo "============================================"
echo "Fix complete! Next steps:"
echo "============================================"
echo ""
echo "1. Start the Metro bundler:"
echo "   npm start"
echo ""
echo "2. In a new terminal, run the app:"
echo "   npm run android  # for Android"
echo "   npm run ios      # for iOS"
echo ""
echo "If you still encounter errors:"
echo "- Try 'npx expo start -c' to start with cache cleared"
echo "- Ensure Android Studio AVD is running (for Android)"
echo "- Check that port 8081 is not blocked"
echo ""
