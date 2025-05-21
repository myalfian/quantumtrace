<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Firebase configuration error: Missing environment variables: ${missingVars.join(', ')}`);
    console.error('Please check your .env file and ensure all Firebase configuration variables are set.');
    console.error('You may need to enable the authentication providers in your Firebase console.');
    return false;
  }
  
  return true;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with validation
const isConfigValid = validateFirebaseConfig();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Log initialization status
if (isConfigValid) {
  console.log('Firebase initialized successfully');
} else {
  console.warn('Firebase initialized with incomplete configuration');
}

export default app;
=======
... (file content here) ...
>>>>>>> bc89eace20afea15e84765f55420225a62189f67
