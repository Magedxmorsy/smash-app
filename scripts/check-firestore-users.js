/**
 * Script to check all users in Firestore
 * Run with: node scripts/check-firestore-users.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyD0VYVf5N9RZJxPdkTnc0XFcP1hFU0AhKI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "smash-81b66.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "smash-81b66",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "smash-81b66.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "481612942062",
  appId: process.env.FIREBASE_APP_ID || "1:481612942062:web:8e0f71e7e3a4e6c8f2f1f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkEmail(email) {
  console.log('\n🔍 Searching for email:', email);
  console.log('=====================================\n');

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('✅ No documents found with this email');
      console.log('👉 You should be able to register with this email\n');
    } else {
      console.log(`❌ Found ${querySnapshot.size} document(s) with this email:\n`);

      querySnapshot.forEach((doc) => {
        console.log('Document ID:', doc.id);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
        console.log('---');
      });

      console.log('\n⚠️  You need to delete these documents to register with this email');
      console.log('👉 Delete command: Use Firebase Console or delete via script\n');
    }
  } catch (error) {
    console.error('❌ Error checking email:', error.message);
  }

  process.exit(0);
}

// Get email from command line argument or use default
const emailToCheck = process.argv[2] || 'magedmorsy@aol.com';
checkEmail(emailToCheck);
