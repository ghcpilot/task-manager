const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Firebase project configuration
const PROJECT_ID = 'task-mates-1a798';

function checkFirebaseCLI() {
  return new Promise((resolve) => {
    const child = spawn('firebase', ['--version'], { stdio: 'pipe' });
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
}

async function deployIndexes() {
  console.log('🔍 Checking Firebase CLI availability...');
  
  const hasFirebase = await checkFirebaseCLI();
  
  if (!hasFirebase) {
    console.log('\n❌ Firebase CLI not found.');
    console.log('\nTo deploy indexes, please:');
    console.log('1. Install Firebase CLI: npm install -g firebase-tools');
    console.log('2. Login to Firebase: firebase login');
    console.log('3. Run this script again: node deploy-indexes.js');
    console.log('\nOr deploy manually:');
    console.log(`firebase deploy --only firestore:indexes --project ${PROJECT_ID}`);
    return;
  }
  
  console.log('✅ Firebase CLI found.');
  console.log('\n🚀 Deploying Firestore indexes...');
  
  const deployProcess = spawn('firebase', [
    'deploy',
    '--only',
    'firestore:indexes',
    '--project',
    PROJECT_ID
  ], { 
    stdio: 'inherit'
  });
  
  deployProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Indexes deployed successfully!');
      console.log('\nYour projects should now load faster without warnings.');
    } else {
      console.log(`\n❌ Deployment failed with code ${code}`);
      console.log('\nPlease check your Firebase authentication:');
      console.log('firebase login');
    }
  });
  
  deployProcess.on('error', (error) => {
    console.error('❌ Error deploying indexes:', error.message);
  });
}

// Check if indexes file exists
const indexesPath = path.join(__dirname, 'firestore.indexes.json');
if (!fs.existsSync(indexesPath)) {
  console.error('❌ firestore.indexes.json not found!');
  process.exit(1);
}

console.log('📋 Firebase Indexes Deployment Script');
console.log(`📁 Project: ${PROJECT_ID}`);
console.log(`📄 Indexes file: ${indexesPath}`);
console.log('─'.repeat(50));

deployIndexes().catch(console.error); 