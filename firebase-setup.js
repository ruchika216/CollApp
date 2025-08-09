// Firebase Setup Script - Run this in Firebase Console or use Firebase Admin SDK
// This script creates collections with sample data for testing

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already done)
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   projectId: 'your-project-id'
// });

const db = admin.firestore();

// Sample data for collections
const setupFirestoreCollections = async () => {
  try {
    console.log('Setting up Firestore collections...');

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
    for (const user of users) {
      await db.collection('users').doc(user.uid).set(user);
      console.log(`Created user: ${user.email}`);
    }

    // 2. Create sample projects
    const projects = [
      {
        id: 'project_001',
        title: 'E-commerce Mobile App',
        description: 'A comprehensive e-commerce mobile application with React Native. Features include user authentication, product catalog, shopping cart, payment integration, and order tracking. The app should support both iOS and Android platforms.',
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
        files: [
          {
            id: 'file_001',
            name: 'project_requirements.pdf',
            url: 'https://example.com/files/requirements.pdf',
            type: 'application/pdf',
            size: 245760,
            uploadedAt: new Date().toISOString()
          }
        ],
        images: [
          {
            id: 'img_001',
            name: 'app_mockup.png',
            url: 'https://example.com/images/mockup.png',
            type: 'image/png',
            size: 512000,
            uploadedAt: new Date().toISOString()
          }
        ],
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
            text: 'Great progress! I\'ve begun work on the product catalog API integration. Should have the first version ready by tomorrow.',
            userId: 'dev_002',
            userName: 'Jane Smith',
            createdAt: new Date(Date.now() - 43200000).toISOString()
          },
          {
            id: 'comment_003',
            text: 'Updated the payment gateway integration. Testing with Stripe sandbox environment is successful.',
            userId: 'dev_001',
            userName: 'John Doe',
            createdAt: new Date(Date.now() - 3600000).toISOString()
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
          },
          {
            id: 'subtask_003',
            title: 'Shopping Cart Functionality',
            description: 'Implement add to cart, quantity management, and cart persistence',
            status: 'To Do',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'admin_001',
            createdAt: new Date(Date.now() - 432000000).toISOString(),
            updatedAt: new Date(Date.now() - 432000000).toISOString(),
            priority: 'Medium',
            estimatedHours: 28
          },
          {
            id: 'subtask_004',
            title: 'Payment Integration',
            description: 'Integrate Stripe payment gateway with order processing',
            status: 'In Progress',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'admin_001',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            priority: 'Critical',
            estimatedHours: 40
          }
        ],
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_002',
        title: 'Company Website Redesign',
        description: 'Complete redesign of the company website with modern UI/UX, responsive design, and improved performance. Includes new landing page, about us section, services portfolio, and contact forms.',
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
            id: 'comment_004',
            text: 'The new design looks great! Ready for client review.',
            userId: 'dev_001',
            userName: 'John Doe',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        subTasks: [
          {
            id: 'subtask_005',
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
          },
          {
            id: 'subtask_006',
            title: 'Mobile Optimization',
            description: 'Ensure all pages are fully responsive and mobile-friendly',
            status: 'Done',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'dev_001',
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
            priority: 'Medium',
            estimatedHours: 24
          }
        ],
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_003',
        title: 'Customer Dashboard Portal',
        description: 'A comprehensive customer dashboard for clients to track their orders, view invoices, manage their profile, and communicate with support team. Built with React and Node.js backend.',
        assignedTo: ['dev_002'],
        assignedUsers: [
          {
            uid: 'dev_002',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            role: 'developer'
          }
        ],
        createdBy: 'admin_001',
        status: 'To Do',
        priority: 'Low',
        startDate: new Date('2024-03-01').toISOString(),
        endDate: new Date('2024-04-15').toISOString(),
        estimatedHours: 200,
        actualHours: 0,
        progress: 0,
        category: 'Web Development',
        tags: ['React', 'Dashboard', 'Customer Portal', 'Backend'],
        files: [],
        images: [],
        comments: [],
        subTasks: [
          {
            id: 'subtask_007',
            title: 'Database Schema Design',
            description: 'Design database schema for customer data, orders, and communication',
            status: 'To Do',
            assignedTo: 'dev_002',
            assignee: {
              uid: 'dev_002',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            createdBy: 'admin_001',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            priority: 'High',
            estimatedHours: 16
          }
        ],
        createdAt: new Date('2024-02-20').toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project_004',
        title: 'API Security Enhancement',
        description: 'Implement advanced security measures for all API endpoints including rate limiting, JWT token refresh, input validation, and security headers. Also includes security audit and documentation.',
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
        status: 'Done',
        priority: 'Critical',
        startDate: new Date('2024-01-01').toISOString(),
        endDate: new Date('2024-01-20').toISOString(),
        estimatedHours: 80,
        actualHours: 85,
        progress: 100,
        category: 'Backend',
        tags: ['Security', 'API', 'Authentication', 'Critical'],
        files: [],
        images: [],
        comments: [
          {
            id: 'comment_005',
            text: 'Security audit completed. All vulnerabilities have been addressed.',
            userId: 'dev_002',
            userName: 'Jane Smith',
            createdAt: new Date(Date.now() - 432000000).toISOString()
          }
        ],
        subTasks: [
          {
            id: 'subtask_008',
            title: 'JWT Token Implementation',
            description: 'Implement JWT tokens with refresh mechanism',
            status: 'Done',
            assignedTo: 'dev_001',
            assignee: {
              uid: 'dev_001',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            createdBy: 'dev_001',
            createdAt: new Date(Date.now() - 1728000000).toISOString(),
            updatedAt: new Date(Date.now() - 864000000).toISOString(),
            priority: 'Critical',
            estimatedHours: 20
          },
          {
            id: 'subtask_009',
            title: 'Rate Limiting',
            description: 'Implement API rate limiting to prevent abuse',
            status: 'Done',
            assignedTo: 'dev_002',
            assignee: {
              uid: 'dev_002',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            createdBy: 'dev_002',
            createdAt: new Date(Date.now() - 1555200000).toISOString(),
            updatedAt: new Date(Date.now() - 691200000).toISOString(),
            priority: 'High',
            estimatedHours: 16
          }
        ],
        createdAt: new Date('2023-12-28').toISOString(),
        updatedAt: new Date(Date.now() - 432000000).toISOString()
      }
    ];

    // Add projects to Firestore
    for (const project of projects) {
      await db.collection('projects').doc(project.id).set(project);
      console.log(`Created project: ${project.title}`);
    }

    // 3. Create sample activities
    const activities = [
      {
        id: 'activity_001',
        type: 'project_created',
        message: 'created project "E-commerce Mobile App"',
        userId: 'admin_001',
        userName: 'Admin User',
        projectId: 'project_001',
        projectTitle: 'E-commerce Mobile App',
        createdAt: new Date('2024-01-10').toISOString(),
        relatedUsers: ['admin_001', 'dev_001', 'dev_002'],
        readBy: ['admin_001'],
        metadata: {}
      },
      {
        id: 'activity_002',
        type: 'comment_added',
        message: 'added a comment on "E-commerce Mobile App"',
        userId: 'dev_001',
        userName: 'John Doe',
        projectId: 'project_001',
        projectTitle: 'E-commerce Mobile App',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        relatedUsers: ['admin_001', 'dev_001', 'dev_002'],
        readBy: ['dev_001'],
        metadata: {}
      },
      {
        id: 'activity_003',
        type: 'status_updated',
        message: 'updated project status to "In Progress"',
        userId: 'dev_001',
        userName: 'John Doe',
        projectId: 'project_001',
        projectTitle: 'E-commerce Mobile App',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        relatedUsers: ['admin_001', 'dev_001', 'dev_002'],
        readBy: ['admin_001', 'dev_001'],
        metadata: {
          newStatus: 'In Progress'
        }
      },
      {
        id: 'activity_004',
        type: 'subtask_added',
        message: 'added a subtask "Payment Integration"',
        userId: 'admin_001',
        userName: 'Admin User',
        projectId: 'project_001',
        projectTitle: 'E-commerce Mobile App',
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        relatedUsers: ['admin_001', 'dev_001', 'dev_002'],
        readBy: ['admin_001', 'dev_001'],
        metadata: {}
      }
    ];

    // Add activities to Firestore
    for (const activity of activities) {
      await db.collection('activities').doc(activity.id).set(activity);
      console.log(`Created activity: ${activity.id}`);
    }

    // 4. Create sample notifications
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
        title: 'New Project Assigned',
        message: 'You have been assigned to project "E-commerce Mobile App"',
        type: 'info',
        userId: 'dev_002',
        read: true,
        createdAt: new Date('2024-01-10').toISOString(),
        projectId: 'project_001',
        actionType: 'project_assigned',
        metadata: {}
      },
      {
        id: 'notification_003',
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
    for (const notification of notifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
      console.log(`Created notification: ${notification.id}`);
    }

    console.log('✅ Firestore collections setup completed successfully!');
    console.log('\nCreated collections:');
    console.log('- users: 4 users (1 admin, 2 approved developers, 1 pending)');
    console.log('- projects: 4 projects with different statuses and priorities');
    console.log('- activities: 4 activity records');
    console.log('- notifications: 3 notifications');
    console.log('\nYou can now test your app with this data!');

  } catch (error) {
    console.error('❌ Error setting up Firestore collections:', error);
  }
};

// Export the setup function
module.exports = { setupFirestoreCollections };

// If running directly
if (require.main === module) {
  setupFirestoreCollections();
}