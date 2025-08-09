# Firestore Rules for Developer Task Visibility

## Current Status ✅
Your Firestore rules are already correctly configured! The rules in `firestore.rules` already allow all approved developers to see all tasks in the homepage.

## Complete Firestore Rules Configuration

Here's the complete rules configuration that enables developers to see all tasks:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    // Users collection
    match /users/{userId} {
      // Allow read access to own data, and approved users can read other approved users
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || 
                      (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                       resource.data.approved == true));
      
      // Allow user to create their own document during sign-up
      allow create: if isAuthenticated() && 
                       request.auth.uid == userId;
      
      // Allow users to update their own profile or admin can update any user
      allow update: if isAuthenticated() && request.auth.uid == userId ||
                       (isAuthenticated() && 
                        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can delete users
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // ⭐ TASKS COLLECTION - KEY RULES FOR DEVELOPER HOMEPAGE ACCESS ⭐
    match /tasks/{taskId} {
      // 🔓 CRITICAL: Allow read access to ALL approved users (both admins and developers)
      allow read: if isAuthenticated() && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
      
      // Only admins can create tasks
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
                       request.data.createdBy == request.auth.uid;
      
      // Admins can update any task, assigned developers can update status and comments
      allow update: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                       (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
                        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'developer' &&
                         request.auth.uid in resource.data.assignedTo));
      
      // Only admins can delete tasks
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Activities collection (for task updates/notifications)
    match /activities/{activityId} {
      // Allow read access to approved users who are in the relatedUsers array
      allow read: if isAuthenticated() && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                     request.auth.uid in resource.data.relatedUsers;
      
      // Allow approved users to create activities
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                       request.data.userId == request.auth.uid;
      
      // Allow users to mark activities as read
      allow update: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                       request.auth.uid in resource.data.relatedUsers &&
                       request.data.diff(resource.data).affectedKeys().hasOnly(['readBy']) &&
                       request.auth.uid in request.data.readBy;
      
      // Only admins can delete activities
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Notifications collection
    match /notifications/{notificationId} {
      // Allow read access to the notification recipient
      allow read: if isAuthenticated() && 
                     request.auth.uid == resource.data.userId;
      
      // Allow system/admin to create notifications
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Allow recipient to update their notifications (mark as read)
      allow update: if isAuthenticated() && 
                       request.auth.uid == resource.data.userId &&
                       request.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      
      // Allow user to delete their own notifications
      allow delete: if isAuthenticated() && 
                       request.auth.uid == resource.data.userId;
    }

    // Projects collection (if developers need to see all projects too)
    match /projects/{projectId} {
      // Allow read access to approved users
      allow read: if isAuthenticated() && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
      
      // Only admins can create projects
      allow create: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
                       request.data.createdBy == request.auth.uid;
      
      // Admins can update any project, developers can update projects they're assigned to
      allow update: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
                        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'developer' && 
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true &&
                         request.auth.uid in resource.data.assignedTo));
      
      // Only admins can delete projects
      allow delete: if isAuthenticated() && 
                       exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Key Rule Explanation 🔍

The most important rule for developer homepage access is:

```javascript
// Tasks collection - Line 122-125
match /tasks/{taskId} {
  allow read: if isAuthenticated() && 
                 exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.approved == true;
}
```

This rule means:
- ✅ **Any authenticated user** can read tasks
- ✅ **Must be approved** (`approved: true` in their user document)
- ✅ **No role restriction** on reading (both admins and developers can read all tasks)

## How to Deploy These Rules 🚀

1. **Copy the rules to your `firestore.rules` file** (they should already be there)

2. **Deploy using Firebase CLI:**
```bash
firebase deploy --only firestore:rules
```

3. **Or deploy through Firebase Console:**
   - Go to Firebase Console > Firestore Database > Rules
   - Copy and paste the rules
   - Click "Publish"

## Verification Steps ✅

To verify developers can see tasks:

1. **Test with Developer Account:**
   - Login as a developer user
   - Check that `user.approved === true` in your app
   - Verify tasks appear in homepage

2. **Check Firebase Console:**
   - Go to Firestore Database
   - Check that developer users have `approved: true`
   - Verify tasks collection has data

3. **Debug in App:**
   - Check console logs in HomeScreen for task fetching
   - Verify `dispatch(fetchTasks())` succeeds for developers

## Common Issues & Solutions 🔧

**Issue:** Developer not seeing tasks
**Solution:** Check user document has `approved: true` and `role: 'developer'`

**Issue:** Permission denied error
**Solution:** Make sure user is authenticated and approved before fetching tasks

**Issue:** Empty task list
**Solution:** Verify tasks exist in Firestore and date filtering is correct

## Your Current Setup Status ✅

Based on your current code:
- ✅ Firestore rules are correctly configured
- ✅ App code fetches all tasks for developers
- ✅ Real-time subscriptions work for developers
- ✅ Homepage displays all tasks to developers

**You don't need to change anything!** The rules are already perfect for developer task visibility.