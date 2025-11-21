import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// In production, these should come from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.FIREBASE_APP_ID || 'demo-app-id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
