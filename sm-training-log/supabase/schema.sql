-- Daily log entries
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Subjective feel (1–5 scale)
  feel_overall INTEGER CHECK (feel_overall BETWEEN 1 AND 5),
  feel_legs INTEGER CHECK (feel_legs BETWEEN 1 AND 5),
  feel_breathing INTEGER CHECK (feel_breathing BETWEEN 1 AND 5),
  feel_motivation INTEGER CHECK (feel_motivation BETWEEN 1 AND 5),

  -- Wearable manual entry (auto-populated via Whoop if API available later)
  hrv_ms DECIMAL(6,1),
  recovery_pct INTEGER,
  resting_hr INTEGER,
  spo2_pct DECIMAL(4,1),
  sleep_score INTEGER,
  sleep_hrs DECIMAL(4,1),

  -- Medication adherence
  inhaler_brown_am BOOLEAN DEFAULT FALSE,
  inhaler_brown_pm BOOLEAN DEFAULT FALSE,
  inhaler_blue_prerace BOOLEAN DEFAULT FALSE,
  inhaler_notes TEXT,

  -- Lifestyle context flags
  alcohol_units DECIMAL(4,1) DEFAULT 0,
  late_night BOOLEAN DEFAULT FALSE,         -- sleep after midnight
  travel BOOLEAN DEFAULT FALSE,
  high_stress BOOLEAN DEFAULT FALSE,
  illness BOOLEAN DEFAULT FALSE,
  illness_notes TEXT,

  -- Recovery modalities used (checkboxes)
  used_sauna BOOLEAN DEFAULT FALSE,
  sauna_mins INTEGER,
  used_boots BOOLEAN DEFAULT FALSE,
  boots_mins INTEGER,
  used_altitude_chamber BOOLEAN DEFAULT FALSE,
  altitude_chamber_mins INTEGER,
  altitude_simulated_m INTEGER,
  used_heat_treadmill BOOLEAN DEFAULT FALSE,
  heat_treadmill_mins INTEGER,

  -- Supplements taken today (checkboxes)
  supp_vitamin_c BOOLEAN DEFAULT FALSE,
  supp_omega3 BOOLEAN DEFAULT FALSE,
  supp_magnesium BOOLEAN DEFAULT FALSE,
  supp_vitamin_d BOOLEAN DEFAULT FALSE,
  supp_other TEXT,

  -- Training session (optional — only if trained)
  trained_today BOOLEAN DEFAULT FALSE,
  session_type TEXT,                        -- 'easy', 'tempo', 'long', 'race', 'altitude', 'heat', 'rest'
  session_duration_mins INTEGER,
  session_distance_km DECIMAL(6,2),
  session_elevation_m INTEGER,
  session_avg_hr INTEGER,
  session_rpe INTEGER CHECK (session_rpe BETWEEN 1 AND 10),  -- Rate of Perceived Exertion

  -- Free text
  notes TEXT,                               -- anything else for the coaching team
  coaching_flag BOOLEAN DEFAULT FALSE,      -- mark entry as needing coach attention

  UNIQUE(user_id, log_date)
);

-- Enable Row Level Security
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Athlete can read/write their own logs
CREATE POLICY "Athletes manage own logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);

-- Coach role can read all logs (set up coach users with role='coach' in user metadata)
CREATE POLICY "Coaches read all logs" ON daily_logs
  FOR SELECT USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'coach'
  );

-- Index for common queries
CREATE INDEX idx_daily_logs_user_id_log_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX idx_daily_logs_user_id_created ON daily_logs(user_id, created_at DESC);
