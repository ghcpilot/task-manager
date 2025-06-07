# Firebase Setup Guide for TimeMate

This guide will help you set up Firebase for the TimeMate application with authentication, Firestore database, and security rules.

## Prerequisites

1. Node.js installed on your system
2. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
3. Firebase CLI installed globally: `npm install -g firebase-tools`

## Firebase Project Configuration

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `task-mates-1a798`
3. Enable the following services:

#### Authentication
- Go to Authentication > Sign-in method
- Enable Email/Password authentication
- Optionally enable Google, GitHub, or other providers

#### Firestore Database
- Go to Firestore Database
- Create database in production mode
- Choose a location close to your users

#### Storage (Optional)
- Go to Storage
- Set up Cloud Storage for file uploads

### 2. Web App Configuration

The Firebase configuration is already set up in `lib/firebase.ts` with your project details:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCdnD1eniP8lrBA6ZECfPfnSeR8rji3OZo",
  authDomain: "task-mates-1a798.firebaseapp.com",
  projectId: "task-mates-1a798",
  storageBucket: "task-mates-1a798.firebasestorage.app",
  messagingSenderId: "650000730020",
  appId: "1:650000730020:web:4fd9f2088b86a791402331",
  measurementId: "G-HWBS8099TM"
};
```

## Database Structure

### Collections

#### 1. `users` Collection
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email
  displayName: string,   // User display name
  photoURL?: string,     // Profile photo URL
  createdAt: Timestamp,  // Account creation date
  updatedAt: Timestamp   // Last update date
}
```

#### 2. `projects` Collection
```javascript
{
  id: string,            // Auto-generated document ID
  name: string,          // Project name
  description?: string,  // Project description
  color: string,         // Project color (hex)
  status: 'active' | 'completed' | 'archived',
  userId: string,        // Owner's Firebase Auth UID
  createdAt: Timestamp,  // Creation date
  updatedAt: Timestamp,  // Last update date
  taskCount?: number     // Number of tasks (computed)
}
```

#### 3. `tasks` Collection
```javascript
{
  id: string,            // Auto-generated document ID
  title: string,         // Task title
  description?: string,  // Task description
  status: 'pending' | 'in_progress' | 'completed' | 'overdue',
  priority: 'low' | 'medium' | 'high',
  dueDate?: Timestamp,   // Due date and time
  projectId?: string,    // Associated project ID
  userId: string,        // Owner's Firebase Auth UID
  createdAt: Timestamp,  // Creation date
  updatedAt: Timestamp,  // Last update date
  completedAt?: Timestamp // Completion date
}
```

## Security Rules Deployment

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init firestore
```

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

## Security Rules

The security rules in `firestore.rules` ensure:

- Users can only access their own data
- Authentication is required for all operations
- Proper data validation on creation and updates

Key rules:
- Users can read/write their own user document
- Users can read/write projects they own
- Users can read/write tasks they own
- All other access is denied

## Environment Variables (Optional)

For additional security, you can move sensitive configuration to environment variables:

Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCdnD1eniP8lrBA6ZECfPfnSeR8rji3OZo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=task-mates-1a798.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=task-mates-1a798
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=task-mates-1a798.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=650000730020
NEXT_PUBLIC_FIREBASE_APP_ID=1:650000730020:web:4fd9f2088b86a791402331
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-HWBS8099TM
```

## Testing the Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test Authentication
- Go to `/auth/register` to create a new account
- Go to `/auth/login` to sign in
- Verify that authentication state persists across page refreshes

### 3. Test Database Operations
- Create a new project in the dashboard
- Add tasks to projects
- Verify data appears in Firebase Console > Firestore Database

### 4. Test Calendar Integration
- Go to `/dashboard/calendar`
- Add tasks with specific dates
- Verify tasks appear on the correct calendar dates

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check if Email/Password is enabled in Firebase Console
   - Verify the Firebase config is correct

2. **Firestore permission denied**
   - Ensure security rules are deployed
   - Check that user is authenticated
   - Verify userId matches in database documents

3. **Calendar not loading tasks**
   - Check browser console for errors
   - Verify Firestore indexes are deployed
   - Ensure tasks have proper dueDate timestamps

### Debug Mode

Enable debug logging by adding to your component:
```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

// Only in development
if (process.env.NODE_ENV === 'development') {
  // Connect to emulators if needed
}
```

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Firebase Hosting (Optional)
```bash
firebase deploy --only hosting
```

### 3. Monitor Usage
- Check Firebase Console > Usage tab
- Monitor authentication metrics
- Review Firestore usage and costs

## Support

For issues with Firebase setup:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
3. Check the browser console for detailed error messages

## API Reference

The main Firebase service functions are available in `lib/firebaseService.ts`:

### Authentication
- `registerUser(email, password, displayName)`
- `loginUser(email, password)`
- `logoutUser()`
- `getUserProfile(uid)`

### Projects
- `createProject(projectData)`
- `getProjects(userId)`
- `updateProject(projectId, updates)`
- `deleteProject(projectId)`

### Tasks
- `createTask(taskData)`
- `getTasks(userId, projectId?)`
- `updateTask(taskId, updates)`
- `deleteTask(taskId)`

### Real-time Listeners
- `subscribeToProjects(userId, callback)`
- `subscribeToTasks(userId, callback, projectId?)`

### Utilities
- `getTasksByDate(userId, date)`
- `getProjectStats(userId)` 