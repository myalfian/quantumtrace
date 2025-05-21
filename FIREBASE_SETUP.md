# Firebase Authentication Setup Guide

## Fixing the "auth/configuration-not-found" Error

If you're encountering the `auth/configuration-not-found` error when using Firebase Authentication, follow these steps to resolve it:

### 1. Check Your Firebase Configuration

Ensure all required Firebase configuration variables are properly set in your `.env` file:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Enable Authentication Providers in Firebase Console

The most common cause of the `auth/configuration-not-found` error is that the authentication provider (like Google Sign-In) is not enabled in your Firebase project.

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** in the left sidebar
4. Click on the **Sign-in method** tab
5. Enable the authentication methods you're using in your app:
   - For Google Sign-In: Click on Google provider, toggle the "Enable" switch, and configure it with your Web Client ID
   - For Email/Password: Simply toggle the "Enable" switch

### 3. Verify Your Firebase Project Settings

1. In the Firebase Console, go to **Project settings** (gear icon in the top left)
2. Under the **General** tab, scroll down to "Your apps" section
3. Make sure your web app is registered
4. Verify that the configuration details match what's in your `.env` file

### 4. Check for Correct Implementation

The code has been updated to provide better error handling for the `auth/configuration-not-found` error. The key improvements include:

- Validation of Firebase configuration variables
- Specific error handling for the Google Sign-In authentication provider
- Detailed error messages to help diagnose the issue

### 5. Restart Your Development Server

After making these changes, restart your development server:

```bash
npm run dev
```

## Additional Troubleshooting

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify that you're using the correct Firebase project credentials
3. Make sure your Firebase project has the correct authentication domains configured
4. If using Google authentication, ensure you've completed the OAuth consent screen setup in the Google Cloud Console

## Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication Errors](https://firebase.google.com/docs/auth/admin/errors)