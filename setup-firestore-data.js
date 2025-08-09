#!/usr/bin/env node

// Simple Firestore setup script that can be run directly
// Run with: node setup-firestore-data.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Make sure you have your service account key file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Replace with your Firebase project ID
    projectId: serviceAccount.project_id
  });
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:');
  console.error('Make sure you have downloaded your service account key file as "serviceAccountKey.json"');
  console.error('You can download it from: Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

// Sample data
const setupData = async () => {
  try {
    console.log('🔄 Setting up Firestore collections...\n');

    // 1. Create sample users
    const users = [
      {
        uid: 'admin_001',
        email: 'admin@collapp.com',
        displayName: 'Admin User',
        name: 'Admin User',
        photoURL: null,
        providerId: 'google.com',
        role: 'admin',
        approved: true,
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnline: false,
        lastSeen: new Date().toISOString()
      },
      {
        uid: 'dev_001',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        name: 'John Doe',
        photoURL: null,
        providerId: 'google.com',
        role: 'developer',
        approved: true,
        projects: ['project_001', 'project_002'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        uid: 'dev_002',
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        name: 'Jane Smith',
        photoURL: null,
        providerId: 'google.com',
        role: 'developer',
        approved: true,
        projects: ['project_001', 'project_003'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString()
      },
      {
        uid: 'dev_003',
        email: 'mike.wilson@example.com',
        displayName: 'Mike Wilson',
        name: 'Mike Wilson',
        photoURL: null,
        providerId: 'google.com',
        role: 'developer',
        approved: false, // Pending approval
        projects: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnline: false,
        lastSeen: new Date().toISOString()
      }
    ];

    // Add users to Firestore
    console.log('👥 Creating users...');
    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`   ✓ Created user: ${user.email} (${user.role})`);
    }

    // 2. Create sample projects
    const projects = [
      {
        id: 'project_001',
        title: 'E-commerce Mobile App',
        description: 'A comprehensive e-commerce mobile application with React Native. Features include user authentication, product catalog, shopping cart, payment integration, and order tracking.',
        assignedTo: ['dev_001', 'dev_002'],
        assignedUsers: [
          {
            uid: 'dev_001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'developer'
          },
          {
            uid: 'dev_002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'developer'
          }
        ],
        createdBy: 'admin_001',
        status: 'In Progress',
        priority: 'High',
        startDate: new Date('2024-01-15').toISOString(),
        endDate: new Date('2024-03-30').toISOString(),
        estimatedHours: 320,
        actualHours: 156,
        progress: 45,
        category: 'Mobile Development',
        tags: ['React Native', 'E-commerce', 'Mobile', 'Payment Integration'],
        files: [],
        images: [],
        comments: [
          {
            id: 'comment_001',
            text: 'Started working on the authentication module. The Google Sign-in integration is almost complete.',
            userId: 'dev_001',
            userName: 'John Doe',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'comment_002',
            text: 'Great progress! I\'ve begun work on the product catalog API integration.',
            userId: 'dev_002',
            userName: 'Jane Smith',
            createdAt: new Date(Date.now() - 43200000).toISOString()
          }
        ],
        subTasks: [
          {
            id: 'subtask_001',
            title: 'User Authentication System',
            description: 'Implement Google Sign-in, Facebook login, and email authentication',
            status: 'Done',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'dev_001',
            createdAt: new Date(Date.now() - 604800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            priority: 'High',
            estimatedHours: 24
          },
          {
            id: 'subtask_002',
            title: 'Product Catalog API',
            description: 'Create REST API endpoints for product listing, search, and filtering',
            status: 'In Progress',
            assignedTo: 'dev_002',
            assignee: {
              uid: 'dev_002',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            createdBy: 'dev_002',
            createdAt: new Date(Date.now() - 518400000).toISOString(),
            updatedAt: new Date(Date.now() - 43200000).toISOString(),
            priority: 'High',
            estimatedHours: 32
          }
        ],
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_002',
        title: 'Company Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance.',
        assignedTo: ['dev_001'],
        assignedUsers: [
          {
            uid: 'dev_001',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'developer'
          }
        ],
        createdBy: 'admin_001',
        status: 'Review',
        priority: 'Medium',
        startDate: new Date('2024-02-01').toISOString(),
        endDate: new Date('2024-02-28').toISOString(),
        estimatedHours: 120,
        actualHours: 98,
        progress: 85,
        category: 'Web Development',
        tags: ['React', 'Website', 'UI/UX', 'Responsive'],
        files: [],
        images: [],
        comments: [
          {
            id: 'comment_003',
            text: 'The new design looks great! Ready for client review.',
            userId: 'dev_001',
            userName: 'John Doe',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        subTasks: [
          {
            id: 'subtask_003',
            title: 'Homepage Redesign',
            description: 'Create new homepage with hero section, features, and testimonials',
            status: 'Done',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'dev_001',
            createdAt: new Date(Date.now() - 1209600000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString(),
            priority: 'High',
            estimatedHours: 36
          }
        ],
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Add projects to Firestore
    console.log('\n📋 Creating projects...');
    for (const project of projects) {
      await db.collection('projects').doc(project.id).set(project);
      console.log(`   ✓ Created project: ${project.title}`);
    }

    // 3. Create notifications
    const notifications = [
      {
        id: 'notification_001',
        title: 'New Project Assigned',
        message: 'You have been assigned to project "E-commerce Mobile App"',
        type: 'info',
        userId: 'dev_001',
        read: false,
        createdAt: new Date('2024-01-10').toISOString(),
        projectId: 'project_001',
        actionType: 'project_assigned',
        metadata: {}
      },
      {
        id: 'notification_002',
        title: 'New User Registration',
        message: 'Mike Wilson has registered and needs approval',
        type: 'warning',
        userId: 'admin_001',
        read: false,
        createdAt: new Date().toISOString(),
        actionType: 'user_approval_needed',
        metadata: {
          newUserId: 'dev_003',
          newUserEmail: 'mike.wilson@example.com',
          newUserName: 'Mike Wilson'
        }
      }
    ];

    // Add notifications to Firestore
    console.log('\n🔔 Creating notifications...');
    for (const notification of notifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
      console.log(`   ✓ Created notification: ${notification.title}`);
    }

    console.log('\n✅ Firestore setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length} (1 admin, 2 approved developers, 1 pending)`);
    console.log(`   📋 Projects: ${projects.length} with multiple developers assigned`);
    console.log(`   🔔 Notifications: ${notifications.length} for testing`);
    console.log('\n🚀 Your app is now ready for testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    process.exit(1);
  }
};

setupData();