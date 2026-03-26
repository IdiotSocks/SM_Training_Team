// HRV Status Logic (green/amber/red)
export const HRV_STATUS = (ms) => {
  if (ms >= 55) {
    return {
      label: 'GREEN',
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-800',
    };
  }
  if (ms >= 40) {
    return {
      label: 'AMBER',
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    };
  }
  return {
    label: 'RED',
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
  };
};

// Recovery % Status Logic
export const RECOVERY_STATUS = (pct) => {
  if (pct >= 70) {
    return {
      label: 'GREEN',
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-800',
    };
  }
  if (pct >= 50) {
    return {
      label: 'AMBER',
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    };
  }
  return {
    label: 'RED',
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
  };
};

// SpO2 Status Logic
export const SPO2_STATUS = (pct) => {
  if (pct >= 95) {
    return {
      label: 'NORMAL',
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-800',
    };
  }
  if (pct >= 92) {
    return {
      label: 'WATCH',
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    };
  }
  return {
    label: 'ALERT',
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
  };
};

// Sleep Score Status Logic
export const SLEEP_SCORE_STATUS = (score) => {
  if (score >= 85) {
    return {
      label: 'GREEN',
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-800',
    };
  }
  if (score >= 70) {
    return {
      label: 'AMBER',
      color: 'amber',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    };
  }
  return {
    label: 'RED',
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
  };
};

// Race Dates
export const RACE_DATES = {
  snowdonia: new Date('2026-05-15'),
  valDAran: new Date('2026-07-01'),
};

// HRV Gates for Training Phases
export const HRV_GATES = {
  recovery: { min: 45, days: 3, phase: 'Recovery → Activation' },
  activation: { min: 50, days: 3, phase: 'Activation → Build' },
  build: { min: 55, days: 3, phase: 'Pre-race target' },
};

// Session Types
export const SESSION_TYPES = [
  'Easy run',
  'Tempo',
  'Long run',
  'Intervals',
  'Race',
  'Altitude chamber',
  'Heat treadmill',
  'Strength',
  'Rest',
];

// Emoji scale for feel (1-5)
export const FEEL_EMOJIS = {
  1: '😫',
  2: '😟',
  3: '😐',
  4: '🙂',
  5: '💪',
};

// Alcohol units options
export const ALCOHOL_OPTIONS = [
  { label: '0 units', value: 0 },
  { label: '1-2 units', value: 1.5 },
  { label: '3-4 units', value: 3.5 },
  { label: '5+ units', value: 5 },
];

// Recovery modalities
export const RECOVERY_MODALITIES = [
  { key: 'sauna', label: 'Sauna', unit: 'mins' },
  { key: 'boots', label: 'Compression boots', unit: 'mins' },
  { key: 'altitude', label: 'Altitude chamber', unit: 'mins', extra: 'simulated_m' },
  { key: 'heat_treadmill', label: 'Heat treadmill', unit: 'mins' },
];

// Supplements
export const SUPPLEMENTS = [
  { key: 'vitamin_c', label: 'Vitamin C' },
  { key: 'omega3', label: 'Omega-3' },
  { key: 'magnesium', label: 'Magnesium glycinate' },
  { key: 'vitamin_d', label: 'Vitamin D' },
];

// Inhalers
export const INHALERS = [
  { key: 'brown_am', label: 'Brown inhaler (AM)' },
  { key: 'brown_pm', label: 'Brown inhaler (PM)' },
  { key: 'blue_prerace', label: 'Blue inhaler (pre-race/session)' },
];

// Function to calculate current training phase based on days to race
export const getCurrentPhase = (today = new Date()) => {
  const daysToSnowdonia = Math.floor((RACE_DATES.snowdonia - today) / (1000 * 60 * 60 * 24));
  const daysToValDAran = Math.floor((RACE_DATES.valDAran - today) / (1000 * 60 * 60 * 24));

  // Determine which race is coming first
  const nextRaceDate = daysToSnowdonia >= 0 ? RACE_DATES.snowdonia : RACE_DATES.valDAran;
  const daysToRace = Math.floor((nextRaceDate - today) / (1000 * 60 * 60 * 24));

  // Phase progression based on days to race
  if (daysToRace > 56) return { phase: 'Recovery', gate: HRV_GATES.recovery };
  if (daysToRace > 28) return { phase: 'Activation', gate: HRV_GATES.activation };
  return { phase: 'Build', gate: HRV_GATES.build };
};

// Function to calculate trend arrow (up/down/same)
export const calculateTrend = (current, previous) => {
  if (current == null || previous == null) return '→';
  if (current > previous) return '↑';
  if (current < previous) return '↓';
  return '→';
};
