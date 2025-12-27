import { createDocument, getDocuments, updateDocument, deleteDocument, subscribeToCollection } from './firestoreService';

/**
 * Create a new tournament
 */
export const createTournament = async (tournamentData) => {
  try {
    const { id, error } = await createDocument('tournaments', {
      ...tournamentData,
      status: 'upcoming', // upcoming, ongoing, completed
      participants: [],
      createdBy: tournamentData.createdBy || null,
    });

    if (error) {
      return { success: false, error, tournamentId: null };
    }

    return { success: true, error: null, tournamentId: id };
  } catch (error) {
    return { success: false, error: error.message, tournamentId: null };
  }
};

/**
 * Get all tournaments
 */
export const getAllTournaments = async () => {
  try {
    const { data, error } = await getDocuments('tournaments', [
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);

    if (error) {
      return { tournaments: [], error };
    }

    return { tournaments: data, error: null };
  } catch (error) {
    return { tournaments: [], error: error.message };
  }
};

/**
 * Get upcoming tournaments
 */
export const getUpcomingTournaments = async () => {
  try {
    const { data, error } = await getDocuments('tournaments', [
      { type: 'where', field: 'status', operator: '==', value: 'upcoming' },
      { type: 'orderBy', field: 'date', direction: 'asc' }
    ]);

    if (error) {
      return { tournaments: [], error };
    }

    return { tournaments: data, error: null };
  } catch (error) {
    return { tournaments: [], error: error.message };
  }
};

/**
 * Update tournament details
 */
export const updateTournament = async (tournamentId, updates) => {
  try {
    const { error } = await updateDocument('tournaments', tournamentId, updates);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete a tournament
 */
export const deleteTournament = async (tournamentId) => {
  try {
    const { error } = await deleteDocument('tournaments', tournamentId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to real-time tournament updates
 */
export const subscribeTournaments = (callback) => {
  return subscribeToCollection(
    'tournaments',
    [{ type: 'orderBy', field: 'createdAt', direction: 'desc' }],
    callback
  );
};
