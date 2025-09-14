// test-firestore-rules.js
const firebase = require('@react-native-firebase/app');
const auth = require('@react-native-firebase/auth').default;
const firestore = require('@react-native-firebase/firestore').default;

async function testFirestoreRules() {
  console.log('🔍 Testing Firestore Rules...');

  try {
    // First, check if we're authenticated
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error(
        '❌ You need to be logged in to test rules. Please run the app and login first.',
      );
      return;
    }

    console.log(
      `✅ Authenticated as: ${currentUser.email} (${currentUser.uid})`,
    );

    // Test reading projects (this was failing before)
    console.log('📋 Testing project read access...');
    const projectsSnapshot = await firestore()
      .collection('projects')
      .limit(10)
      .get();
    console.log(
      `✅ Successfully read ${projectsSnapshot.docs.length} projects`,
    );

    // Test reading user document
    console.log('👤 Testing user document read access...');
    const userDoc = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();
    if (userDoc.exists) {
      console.log(
        `✅ Successfully read user document: ${JSON.stringify(
          userDoc.data(),
          null,
          2,
        )}`,
      );
    } else {
      console.warn(
        '⚠️ User document does not exist yet. You might need to complete the sign-up process.',
      );
    }

    // Check if user is an admin
    const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

    if (isAdmin) {
      // Try writing a test project (admin only)
      console.log('📝 Testing project creation (admin only)...');
      const testRef = await firestore()
        .collection('projects')
        .add({
          title: 'Test Project (Delete Me)',
          description: 'This is a test project to verify Firebase rules',
          status: 'planning',
          priority: 'medium',
          createdBy: currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: [currentUser.uid],
        });

      console.log(
        `✅ Successfully created test project with ID: ${testRef.id}`,
      );

      // Clean up
      await testRef.delete();
      console.log(`🧹 Test project deleted`);
    }

    console.log('✅ All tests passed! Firebase rules are working correctly.');
  } catch (error) {
    console.error('❌ Error testing Firestore rules:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
  }
}

// Run the tests
testFirestoreRules();
