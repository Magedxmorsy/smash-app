import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Create a new document in a collection
 */
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

/**
 * Create or update a document with a specific ID
 */
export const setDocument = async (collectionName, documentId, data) => {
  try {
    await setDoc(doc(db, collectionName, documentId), {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: 'Document not found' };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
};

/**
 * Get all documents from a collection
 */
export const getDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);

    // Apply query conditions if provided
    if (conditions.length > 0) {
      const constraints = conditions.map(condition => {
        if (condition.type === 'where') {
          return where(condition.field, condition.operator, condition.value);
        } else if (condition.type === 'orderBy') {
          return orderBy(condition.field, condition.direction || 'asc');
        } else if (condition.type === 'limit') {
          return limit(condition.value);
        }
      });
      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const documents = [];

    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    return { data: documents, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

/**
 * Update a document
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName, documentId) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Listen to real-time updates on a document
 */
export const subscribeToDocument = (collectionName, documentId, callback) => {
  const docRef = doc(db, collectionName, documentId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

/**
 * Listen to real-time updates on a collection
 */
export const subscribeToCollection = (collectionName, conditions = [], callback) => {
  let q = collection(db, collectionName);

  if (conditions.length > 0) {
    const constraints = conditions.map(condition => {
      if (condition.type === 'where') {
        return where(condition.field, condition.operator, condition.value);
      } else if (condition.type === 'orderBy') {
        return orderBy(condition.field, condition.direction || 'asc');
      } else if (condition.type === 'limit') {
        return limit(condition.value);
      }
    });
    q = query(q, ...constraints);
  }

  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};
