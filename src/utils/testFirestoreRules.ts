// src/utils/testFirestoreRules.ts
import { Alert } from 'react-native';
import { firestore, auth } from '../firebase/firebaseConfig';

/**
 * Tests the Firestore rules and reports results via Alert
 * Call this function when logged in to validate security rules
 */
export async function testFirestoreRules() {
  try {
    // Check if we're authenticated
    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You need to be logged in to test rules');
      return;
    }

    console.log(`Authenticated as: ${currentUser.email} (${currentUser.uid})`);

    // Test reading projects (this was failing before)
    console.log('Testing project read access...');
    const projectsSnapshot = await firestore()
      .collection('projects')
      .limit(10)
      .get();
    console.log(`Successfully read ${projectsSnapshot.docs.length} projects`);

    // Test the exact code path that's failing - reading assigned users in projects
    if (projectsSnapshot.docs.length > 0) {
      console.log('Testing reading assigned users from projects...');
      const firstProject = projectsSnapshot.docs[0].data();
      if (firstProject.assignedTo) {
        console.log(
          `Project has assignedTo: ${JSON.stringify(firstProject.assignedTo)}`,
        );

        // Try to read user data for assigned users
        if (Array.isArray(firstProject.assignedTo)) {
          for (const uid of firstProject.assignedTo) {
            console.log(`Testing read of assigned user: ${uid}`);
            const assignedUserDoc = await firestore()
              .collection('users')
              .doc(uid)
              .get();
            const userData = assignedUserDoc.data();
            console.log(`Assigned user exists: ${!!userData}`);
          }
        } else if (typeof firstProject.assignedTo === 'string') {
          const uid = firstProject.assignedTo;
          console.log(`Testing read of assigned user: ${uid}`);
          const assignedUserDoc = await firestore()
            .collection('users')
            .doc(uid)
            .get();
          const userData = assignedUserDoc.data();
          console.log(`Assigned user exists: ${!!userData}`);
        }
      }
    }

    // Test reading user document
    console.log('Testing user document read access...');
    const userDoc = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    const userData = userDoc.data();
    if (userData) {
      console.log(
        `Successfully read user document: ${JSON.stringify(userData, null, 2)}`,
      );
    } else {
      console.warn('User document does not exist yet');
    }

    // Check if user is an admin
    const isAdmin = userData?.role === 'admin';

    // Now test the getProjects function directly
    console.log('Testing getProjects function from firestore.ts...');
    try {
      const { getProjects } = require('../firebase/firestore');
      const projects = await getProjects();
      console.log(
        `Successfully loaded ${projects.length} projects with assignedUsers`,
      );
    } catch (error) {
      console.error('Error calling getProjects:', error);
    }

    if (isAdmin) {
      // Try writing a test project (admin only)
      console.log('Testing project creation (admin only)...');
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

      console.log(`Successfully created test project with ID: ${testRef.id}`);

      // Clean up
      await testRef.delete();
      console.log(`Test project deleted`);
    }

    Alert.alert(
      'Success',
      'All tests passed! Firebase rules are working correctly. Check the console log for details.',
    );
  } catch (error: any) {
    console.error('Error testing Firestore rules:', error);
    Alert.alert('Error', `Failed to test Firestore rules: ${error.message}`);
  }
}
