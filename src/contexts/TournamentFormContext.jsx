import React, { createContext, useContext, useState } from 'react';

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
  const [joinAsPlayer, setJoinAsPlayer] = useState(initialData?.joinAsPlayer ?? true);

  const [errors, setErrors] = useState({
    name: '',
    location: '',
    date: '',
    time: '',
    teamCount: '',
  });

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
