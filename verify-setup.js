#!/usr/bin/env node

/**
 * Zenith Memory - Setup Verification
 * 
 * Verifies that all required files and dependencies are properly set up.
 * Run: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function separator() {
  console.log('\n' + '═'.repeat(60) + '\n');
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(colors.green, '✅', `${description} (${sizeMB}MB)`);
    return true;
  } else {
    log(colors.red, '❌', `${description} - NOT FOUND`);
    return false;
  }
}

function checkDirExists(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(colors.green, '✅', `${description}`);
    return true;
  } else {
    log(colors.red, '❌', `${description} - NOT FOUND`);
    return false;
  }
}

async function verify() {
  console.clear();
  log(colors.bright + colors.cyan, '🔍', 'Zenith Memory - Setup Verification\n');

  let allGood = true;

  // Check core files
  separator();
  log(colors.bright + colors.blue, '📋', 'Checking Core Files:');
  separator();

  allGood &= checkFileExists('./server.js', 'Backend Server');
  allGood &= checkFileExists('./sdk.js', 'JavaScript SDK');
  allGood &= checkFileExists('./hey.html', 'Web Interface');
  allGood &= checkFileExists('./package.json', 'Package Configuration');

  // Check documentation
  separator();
  log(colors.bright + colors.blue, '📚', 'Checking Documentation:');
  separator();

  allGood &= checkFileExists('./README.md', 'Main Documentation');
  allGood &= checkFileExists('./GETTING_STARTED.md', 'Getting Started Guide');

  // Check example files
  separator();
  log(colors.bright + colors.blue, '💡', 'Checking Example Files:');
  separator();

  allGood &= checkFileExists('./quickstart.js', 'Quick Start Example');
  allGood &= checkFileExists('./example-app.js', 'Example Application');

  // Check dependencies
  separator();
  log(colors.bright + colors.blue, '📦', 'Checking Dependencies:');
  separator();

  allGood &= checkDirExists('./node_modules', 'Node Modules');

  // Check node_modules for key packages
  const requiredPackages = ['express', 'cors', 'uuid', 'jsonwebtoken'];
  requiredPackages.forEach(pkg => {
    allGood &= checkDirExists(`./node_modules/${pkg}`, `  └─ ${pkg}`);
  });

  // Check Node.js version
  separator();
  log(colors.bright + colors.blue, '⚙️', 'Checking Environment:');
  separator();

  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));

  if (nodeMajor >= 16) {
    log(colors.green, '✅', `Node.js Version: ${nodeVersion}`);
  } else {
    log(colors.red, '❌', `Node.js Version: ${nodeVersion} (requires 16+)`);
    allGood = false;
  }

  // Summary
  separator();
  log(colors.bright + colors.blue, '📊', 'Setup Verification Summary:');
  separator();

  if (allGood) {
    log(colors.bright + colors.green, '✅', 'All checks passed! You\'re ready to go!\n');

    console.log('Next steps:\n');
    log(colors.cyan, '1️⃣', 'Start the server:');
    log(colors.yellow, '→', 'npm start\n');

    log(colors.cyan, '2️⃣', 'Run the quick start example:');
    log(colors.yellow, '→', 'node quickstart.js\n');

    log(colors.cyan, '3️⃣', 'Try the example application:');
    log(colors.yellow, '→', 'node example-app.js\n');

    log(colors.cyan, '4️⃣', 'Open the web interface:');
    log(colors.yellow, '→', 'http://localhost:3000\n');

    log(colors.cyan, '5️⃣', 'Read the documentation:');
    log(colors.yellow, '→', 'cat GETTING_STARTED.md\n');

  } else {
    log(colors.red, '❌', 'Some checks failed. Please review above.\n');

    console.log('Troubleshooting:\n');
    
    if (!fs.existsSync('./node_modules')) {
      log(colors.yellow, '⚠️', 'Missing node_modules - run: npm install\n');
    }

    log(colors.yellow, '⚠️', 'Make sure you\'re in the Zenith Memory project directory\n');

    process.exit(1);
  }

  separator();
  log(colors.bright + colors.cyan, '🚀', 'Zenith Memory is ready for development!');
  console.log('');
  log(colors.green, '✨', 'Built by Pranav - Enterprise Storage for Developers\n');
}

verify().catch(error => {
  console.error('Verification error:', error);
  process.exit(1);
});
