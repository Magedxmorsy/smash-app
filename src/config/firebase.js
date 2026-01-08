import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVdwD4_OPSA_qRURoXJEhmAPx1897O7bI",
  authDomain: "smash-cb23e.firebaseapp.com",
  projectId: "smash-cb23e",
  storageBucket: "smash-cb23e.firebasestorage.app",
  messagingSenderId: "1049556459478",
  appId: "1:1049556459478:web:91a3f346874bd717b0ce77",
  measurementId: "G-3Z18783WE8"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with AsyncStorage persistence
// Use getAuth if already initialized, otherwise initializeAuth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth, EmailAuthProvider, reauthenticateWithCredential };

// Initialize other Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
