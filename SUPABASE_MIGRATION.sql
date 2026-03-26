-- Supabase Migration: Add inhaler timing and correlation support
-- Date: 2026-03-26
-- Purpose: Add time-of-use tracking for inhalers and computed fields for correlation analysis

-- Step 1: Add inhaler timing columns (TIME format)
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_brown_am_time TIME;

ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_brown_pm_time TIME;

ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_blue_prerace_time TIME;

-- Step 2: Add comments for clarity
COMMENT ON COLUMN public.daily_logs.inhaler_brown_am_time IS 'Time brown inhaler was taken in morning (HH:MM format)';
COMMENT ON COLUMN public.daily_logs.inhaler_brown_pm_time IS 'Time brown inhaler was taken in evening (HH:MM format)';
COMMENT ON COLUMN public.daily_logs.inhaler_blue_prerace_time IS 'Time blue inhaler was taken before race/session (HH:MM format)';

-- Step 3: Verify new columns exist
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name='daily_logs' AND column_name LIKE 'inhaler%time';
