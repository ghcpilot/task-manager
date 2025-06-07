const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'task-mates-1a798'
});

const db = getFirestore(app);

async function deployRules() {
  try {
    console.log('Deploying Firestore security rules...');
    
    // Read the rules file
    const rulesPath = path.join(__dirname, 'firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    
    console.log('Rules content:');
    console.log(rules);
    
    console.log('\nTo deploy these rules, please:');
    console.log('1. Install Firebase CLI: npm install -g firebase-tools');
    console.log('2. Login to Firebase: firebase login');
    console.log('3. Initialize Firebase in your project: firebase init firestore');
    console.log('4. Deploy the rules: firebase deploy --only firestore:rules');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

deployRules(); 