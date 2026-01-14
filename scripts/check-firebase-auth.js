/**
 * Script to check Firebase Authentication for a user
 * Run with: node scripts/check-firebase-auth.js <email>
 */

const { initializeApp } = require('firebase/app');
const { getAuth, fetchSignInMethodsForEmail } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0VYVf5N9RZJxPdkTnc0XFcP1hFU0AhKI",
  authDomain: "smash-81b66.firebaseapp.com",
  projectId: "smash-81b66",
  storageBucket: "smash-81b66.firebasestorage.app",
  messagingSenderId: "481612942062",
  appId: "1:481612942062:web:8e0f71e7e3a4e6c8f2f1f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function checkAuthEmail(email) {
  console.log('\n🔍 Checking Firebase Auth for email:', email);
  console.log('=====================================\n');

  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length === 0) {
      console.log('✅ Email is NOT registered in Firebase Auth');
      console.log('👉 You should be able to create an account\n');
    } else {
      console.log('❌ Email IS registered in Firebase Auth');
      console.log('Sign-in methods:', signInMethods);
      console.log('\n⚠️  You need to delete this user from Firebase Auth Console');
      console.log('👉 Go to: https://console.firebase.google.com/project/smash-81b66/authentication/users\n');
    }
  } catch (error) {
    console.error('❌ Error checking auth:', error.message);
    console.log('\nError code:', error.code);
  }

  process.exit(0);
}

const emailToCheck = process.argv[2] || 'magedmorsy@aol.com';
checkAuthEmail(emailToCheck);
