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
    const cleanData = sanitizeForFirestore(data);
    const docRef = await addDoc(collection(db, collectionName), {
      ...cleanData,
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
    const cleanData = sanitizeForFirestore(data);
    await setDoc(doc(db, collectionName, documentId), {
      ...cleanData,
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
/**
 * Helper to remove undefined fields recursively
 */
const sanitizeForFirestore = (data) => {
  if (data === undefined) return undefined;
  if (data === null) return null;
  // Preserve Date and Timestamp objects
  if (data instanceof Date) return data;
  if (data && typeof data.toDate === 'function') return data; // Firestore Timestamp

  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore).filter(item => item !== undefined);
  }

  if (typeof data === 'object') {
    const cleanData = {};
    Object.keys(data).forEach(key => {
      const sanitizedValue = sanitizeForFirestore(data[key]);
      if (sanitizedValue !== undefined) {
        cleanData[key] = sanitizedValue;
      }
    });
    return cleanData;
  }

  return data;
};

/**
 * Update a document
 */
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const cleanData = sanitizeForFirestore(data);
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...cleanData,
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
  return onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      // Return empty data on permission errors (expected for unauthenticated users)
      if (error.code === 'permission-denied') {
        callback(null);
      } else {
        // Log other unexpected errors
        console.error('Error in document snapshot listener:', error);
      }
    }
  );
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

  return onSnapshot(
    q,
    (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    },
    (error) => {
      // Return empty array on permission errors (expected for unauthenticated users)
      if (error.code === 'permission-denied') {
        callback([]);
      } else {
        // Log other unexpected errors
        console.error('Error in collection snapshot listener:', error);
      }
    }
  );
};
