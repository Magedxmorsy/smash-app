/**
 * Script to DELETE all Firestore documents for a specific email
 * Run with: node scripts/delete-user-by-email.js <email>
 *
 * WARNING: This will permanently delete user data!
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVdwD4_OPSA_qRURoXJEhmAPx1897O7bI",
  authDomain: "smash-cb23e.firebaseapp.com",
  projectId: "smash-cb23e",
  storageBucket: "smash-cb23e.firebasestorage.app",
  messagingSenderId: "1049556459478",
  appId: "1:1049556459478:web:91a3f346874bd717b0ce77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteUserByEmail(email) {
  console.log('\n🔍 Searching for all documents with email:', email);
  console.log('=====================================\n');

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('✅ No documents found with this email');
      console.log('👉 Email is clean, you can register now\n');
      process.exit(0);
    }

    console.log(`⚠️  Found ${querySnapshot.size} document(s) with this email:\n`);

    const docsToDelete = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      console.log('Document ID:', docSnapshot.id);
      console.log('Data:', {
        email: data.email,
        displayName: data.displayName || '(null)',
        emailVerified: data.emailVerified,
        passwordSet: data.passwordSet,
        createdAt: data.createdAt
      });
      console.log('---');
      docsToDelete.push({ id: docSnapshot.id, data });
    });

    console.log(`\n🗑️  Deleting ${docsToDelete.length} document(s)...\n`);

    // Delete all documents
    for (const docToDelete of docsToDelete) {
      try {
        await deleteDoc(doc(db, 'users', docToDelete.id));
        console.log(`✅ Deleted document: ${docToDelete.id}`);
      } catch (deleteError) {
        console.error(`❌ Failed to delete ${docToDelete.id}:`, deleteError.message);
      }
    }

    console.log('\n✅ All documents deleted successfully!');
    console.log('👉 You should now be able to register with this email\n');
    console.log('⚠️  NOTE: You still need to delete the user from Firebase Authentication Console');
    console.log('    Go to: https://console.firebase.google.com/u/0/project/smash-cb23e/authentication/users\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error('❌ Error: Email argument required');
  console.log('Usage: node scripts/delete-user-by-email.js <email>');
  process.exit(1);
}

deleteUserByEmail(emailToDelete);
