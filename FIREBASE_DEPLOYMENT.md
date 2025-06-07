# Firebase Deployment Guide

## Quick Fix for Performance Issues

The app is currently experiencing slow queries due to missing Firebase composite indexes. Here's how to fix it:

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase (if not already done)
```bash
firebase init firestore
```

### 4. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 5. Alternative: Deploy via Firebase Console
If CLI doesn't work, manually create these indexes in the [Firebase Console](https://console.firebase.google.com):

#### Projects Collection
- **Fields**: `userId` (Ascending), `updatedAt` (Descending)
- **Query scope**: Collection

#### Tasks Collection  
- **Fields**: `userId` (Ascending), `createdAt` (Descending)
- **Query scope**: Collection

- **Fields**: `projectId` (Ascending), `createdAt` (Descending)  
- **Query scope**: Collection

- **Fields**: `userId` (Ascending), `status` (Ascending), `priority` (Descending)
- **Query scope**: Collection

## Expected Performance Improvements

After deploying these indexes:
- ✅ Query times should reduce from 30+ seconds to under 2 seconds
- ✅ No more "Composite index not found" errors in terminal
- ✅ Smoother user experience throughout the app

## Verification

Once deployed, check the browser console and terminal logs to confirm the errors are gone. 