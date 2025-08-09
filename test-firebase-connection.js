#!/usr/bin/env node

// Quick test script to verify Firebase connection and data
// Run with: node test-firebase-connection.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error: Make sure you have serviceAccountKey.json file');
  console.error('Download it from Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

const testConnection = async () => {
  try {
    console.log('\n🔍 Testing Firebase connection...\n');

    // Test 1: Check if users collection exists
    console.log('1. Checking users collection...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    console.log(`   ✓ Found ${usersSnapshot.size} users`);
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      console.log(`   - ${user.email} (${user.role}${user.approved ? ', approved' : ', pending'})`);
    });

    // Test 2: Check if projects collection exists
    console.log('\n2. Checking projects collection...');
    const projectsSnapshot = await db.collection('projects').limit(5).get();
    console.log(`   ✓ Found ${projectsSnapshot.size} projects`);
    
    projectsSnapshot.forEach(doc => {
      const project = doc.data();
      console.log(`   - ${project.title} (${project.status})`);
      console.log(`     Assigned to: ${project.assignedTo?.join(', ') || 'None'}`);
    });

    // Test 3: Check if notifications collection exists
    console.log('\n3. Checking notifications collection...');
    const notificationsSnapshot = await db.collection('notifications').limit(5).get();
    console.log(`   ✓ Found ${notificationsSnapshot.size} notifications`);
    
    notificationsSnapshot.forEach(doc => {
      const notification = doc.data();
      console.log(`   - ${notification.title} (${notification.type})`);
    });

    console.log('\n✅ Firebase connection test completed successfully!');
    console.log('\n📋 Your collections are set up and ready to use.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test creating a new project in your admin dashboard');
    console.log('   2. Try logging in as john.doe@example.com to see assigned projects');
    console.log('   3. Test the user approval workflow with mike.wilson@example.com');
    
  } catch (error) {
    console.error('❌ Error testing Firebase connection:', error);
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Tip: Run the setup script first:');
      console.log('   node setup-firestore-data.js');
    }
  }
  
  process.exit(0);
};

testConnection();