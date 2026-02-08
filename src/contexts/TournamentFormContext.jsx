import React, { createContext, useContext, useState, useEffect } from 'react';

const TournamentFormContext = createContext();

export function TournamentFormProvider({ children, initialData = null }) {
  const [tournamentName, setTournamentName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [courtNumbers, setCourtNumbers] = useState(initialData?.courts || '');
  const [date, setDate] = useState(initialData?.dateTime ? new Date(initialData.dateTime) : null);
  const [time, setTime] = useState(initialData?.dateTime ? new Date(initialData.dateTime) : null);
  const [format, setFormat] = useState(initialData?.format || 'World cup');
  const [teamCount, setTeamCount] = useState(initialData?.teamCount || null);
  const [rules, setRules] = useState(initialData?.rules || '');
  const [matchDuration, setMatchDuration] = useState(initialData?.matchDuration || 30);
  const [joinAsPlayer, setJoinAsPlayer] = useState(initialData?.joinAsPlayer ?? true);

  const [errors, setErrors] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    teamCount: '',
  });

  // Update form state when initialData changes (for edit mode)
  // Use initialData.id as dependency to avoid unnecessary updates on object reference changes
  useEffect(() => {
    if (initialData) {
      const parsedDate = initialData.dateTime ? new Date(initialData.dateTime) : null;

      console.log('🔄 TournamentFormProvider: Updating form with initialData', {
        tournamentId: initialData.id,
        name: initialData.name,
        location: initialData.location,
        dateTimeISO: initialData.dateTime,
        parsedDate: parsedDate,
        parsedDateLocal: parsedDate?.toString()
      });

      setTournamentName(initialData.name || '');
      setLocation(initialData.location || '');
      setCourtNumbers(initialData.courts || '');
      setDate(parsedDate);
      setTime(parsedDate);
      setFormat(initialData.format || 'World cup');
      setTeamCount(initialData.teamCount || null);
      setTeamCount(initialData.teamCount || null);
      setRules(initialData.rules || '');
      setMatchDuration(initialData.matchDuration || 30);
      setJoinAsPlayer(initialData.joinAsPlayer ?? true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const formData = {
    tournamentName,
    setTournamentName,
    location,
    setLocation,
    courtNumbers,
    setCourtNumbers,
    date,
    setDate,
    time,
    setTime,
    format,
    setFormat,
    teamCount,
    setTeamCount,
    rules,
    setRules,
    matchDuration,
    setMatchDuration,
    joinAsPlayer,
    setJoinAsPlayer,
    errors,
    setErrors,
  };

  return (
    <TournamentFormContext.Provider value={formData}>
      {children}
    </TournamentFormContext.Provider>
  );
}

export function useTournamentForm() {
  const context = useContext(TournamentFormContext);
  if (!context) {
    throw new Error('useTournamentForm must be used within TournamentFormProvider');
  }
  return context;
}
