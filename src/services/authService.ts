import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });

    // Create user document in Firestore
    const user: User = {
      id: userCredential.user.uid,
      email,
      displayName,
      photoURL: userCredential.user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        tournamentsPlayed: 0,
        tournamentTrophies: 0,
        matchesPlayed: 0,
        matchesWon: 0,
      },
    };

    await setDoc(doc(db, 'users', user.id), user);

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
