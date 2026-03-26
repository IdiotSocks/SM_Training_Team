# Simba Training Logger: Enhancement Deployment Guide

**Date:** March 26, 2026
**Version:** 1.0
**Features Added:**
1. ✅ **Asthma Medication Timing** — Track when you use inhalers (AM, PM, pre-race)
2. ✅ **Breathing-to-Performance Correlation** — Visualize link between breathing quality and leg freshness
3. ✅ **Medication Insights** — Pattern analysis for inhaler usage and timing

---

## Quick Start (3 Steps)

### Step 1: Update Supabase Database Schema (5 minutes)

1. Open your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste the SQL from `SUPABASE_MIGRATION.sql`:

```sql
-- Add inhaler timing columns (TIME format)
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_brown_am_time TIME;

ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_brown_pm_time TIME;

ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS inhaler_blue_prerace_time TIME;
```

4. Click **Run**
5. Verify success: Go to **Editor** → Select `daily_logs` table → You should see the 3 new columns

### Step 2: Deploy Updated Frontend Code (5 minutes)

All changes have been made to your React codebase:

**New Files Created:**
- ✅ `src/components/TimeInput.jsx` — HH:MM time picker input
- ✅ `src/components/CorrelationChart.jsx` — Breathing vs legs scatterplot
- ✅ `src/components/MedicationInsights.jsx` — Medication pattern analysis

**Files Modified:**
- ✅ `src/components/DailyLogForm.jsx` — Added time fields for inhalers
- ✅ `src/pages/AthleteLog.jsx` — Added Analytics section with 2 tabs

**To deploy:**

1. **Commit changes to git:**
   ```bash
   cd ~/GitHub/SM_Training_Team
   git add -A
   git commit -m "feat: add medication timing tracking and breathing-leg correlation analysis"
   git push origin main
   ```

2. **Vercel auto-deploys on push** (should be live in 1-2 minutes)

3. **Verify deployment:**
   - Visit https://sm-training-log.vercel.app/log
   - Click on "Medication" section → Should see time inputs when you toggle inhalers
   - Scroll to "Performance Analytics" section → Should see 2 tabs (Breathing vs Legs, Medication Timing)

---

## What's New: User Guide

### Feature 1: Medication Timing

**Where:** Daily Log Form → "Medication" section

**What changed:**
- Each inhaler now has an optional time field
- When you toggle an inhaler ON, a "Time taken" field appears
- Format: HH:MM (e.g., `06:30`)
- Autocompletes as you type (type `0630` → becomes `06:30`)

**Example:**
```
✓ Brown inhaler (AM)
  Time taken: [06:30]

✓ Brown inhaler (PM)
  Time taken: [18:45]

☐ Blue inhaler (pre-race/session)
```

**What this enables:**
- See your inhaler usage patterns
- Understand if you use AM/PM consistently
- Track pre-race preparation timing

---

### Feature 2: Breathing-to-Legs Correlation

**Where:** AthleteLog page → "Performance Analytics" → 📊 Breathing vs Legs tab

**What you see:**
1. **Correlation Score** (-1 to +1)
   - `+1.0` = Perfect correlation (low breathing → low legs always)
   - `+0.0` = No relationship
   - Interpretation helps you understand if breathing is a blocker

2. **Scatterplot**
   - X-axis: Breathing quality (1-5)
   - Y-axis: Leg freshness (1-5)
   - Point color: Your overall feel (red=bad → green=good)
   - Blue trend line: Shows the average pattern

3. **Key Metrics**
   - Average breathing score (last 30 days)
   - Average leg freshness (last 30 days)
   - Correlation strength (strong/moderate/weak)

**Example interpretation:**
- If correlation = `0.85`: "Poor breathing usually means poor legs" → breathing is likely your limiting factor
- If correlation = `0.25`: "Breathing and legs vary independently" → leg performance depends on other factors

---

### Feature 3: Medication Insights

**Where:** AthleteLog page → "Performance Analytics" → 💊 Medication Timing tab

**What you see:**

1. **Usage Frequency**
   - For each inhaler: "Used on X% of days"
   - Progress bar showing consistency
   - E.g., "Brown AM: 80% (12 of 15 days)"

2. **Breathing Quality Comparison**
   - Average breathing score on days you used the inhaler
   - Average breathing score on days you didn't
   - Shows the impact of medication
   - E.g., "Days with AM inhaler: 3.2/5 | Days without: 2.5/5"

3. **Timing Pattern**
   - Shows your typical time for each inhaler
   - E.g., "Brown AM usually at 06:32"
   - Based on all your logged times (average)

4. **Key Insights Summary**
   - Quick bullet-point analysis
   - Highlights patterns worth noting

**Example:**
```
🟤 Brown Inhaler (AM)
├─ Usage: 80% (12/15 days)
├─ Breathing quality
│  ├─ Days with inhaler: 3.5/5 ✓
│  └─ Days without: 2.1/5
└─ Typical time: 06:32

Key insight: Breathing improves 67% better with AM inhaler
```

---

## CSV Export Update

**New columns added:**
- `Inhaler AM Time`
- `Inhaler PM Time`
- `Inhaler Pre-Race Time`

**Example export row:**
```csv
2026-03-26,3,3,3,2,Yes,06:30,No,,Yes,09:15,"","0","No",...
```

This lets you:
- Analyze timing data in Excel/spreadsheets
- Share data with your coach/doctor
- Track trends over time

---

## Technical Details

### Database Changes

Three new TIME columns added to `daily_logs` table:

```sql
inhaler_brown_am_time TIME        -- e.g., '06:30'
inhaler_brown_pm_time TIME        -- e.g., '18:45'
inhaler_blue_prerace_time TIME    -- e.g., '09:15'
```

- All are optional (NULL if not used)
- Only populated when corresponding boolean is TRUE
- Standard TIME format (HH:MM:SS, displays as HH:MM)

### Component Architecture

**TimeInput.jsx** (Reusable)
- Props: `value`, `onChange`, `placeholder`, `disabled`
- Auto-formats: `0630` → `06:30`
- Validates: Hours 0-23, Minutes 0-59
- Clean input: Removes invalid chars on blur

**CorrelationChart.jsx** (Visualization)
- Computes Pearson correlation coefficient
- Generates SVG scatterplot with trend line
- Color gradient: 1=red → 5=dark green
- Hover effects for data points

**MedicationInsights.jsx** (Analysis)
- Aggregates inhaler usage over N days (default 30)
- Calculates average breathing on/off days
- Extracts timing patterns (average time)
- Generates human-readable insights

**AthleteLog.jsx** (Page)
- Added `analyticsTab` state for tab switching
- Conditionally renders CorrelationChart or MedicationInsights
- Passes `logs` and `days=30` to both components

---

## Testing Checklist

### Unit Tests (Manual)

- [ ] **TimeInput Component**
  - [ ] Type `0630` → displays `06:30`
  - [ ] Type `23:59` → valid (stores as `23:59`)
  - [ ] Type `24:00` → invalid (no change)
  - [ ] Type `12:60` → invalid (no change)
  - [ ] Clear field → onChange called with empty string

- [ ] **Medication Form**
  - [ ] Toggle AM inhaler ON → time field appears
  - [ ] Toggle AM inhaler OFF → time field hides
  - [ ] Enter time `06:30` → saves correctly
  - [ ] Submit form → no errors in console
  - [ ] Edit existing entry → time field pre-populates
  - [ ] Time field can be empty while inhaler is ON

- [ ] **CorrelationChart**
  - [ ] Displays with 10+ logs
  - [ ] Shows correlation coefficient
  - [ ] Shows scatterplot with points
  - [ ] Shows trend line (if >3 unique breathing levels)
  - [ ] Hover over points → highlight
  - [ ] Color gradient visible (red → green)

- [ ] **MedicationInsights**
  - [ ] Displays all 3 inhalers with usage stats
  - [ ] Shows percentage usage
  - [ ] Shows breathing comparison
  - [ ] Shows timing pattern
  - [ ] Key insights summary visible

- [ ] **Analytics Page**
  - [ ] Both tabs visible (Breathing vs Legs, Medication Timing)
  - [ ] Tab switching works
  - [ ] Analytics only shows if logs.length > 0
  - [ ] 30-day rolling window working

### Integration Tests

- [ ] Log entry with AM inhaler at `07:00` → appears in CSV export
- [ ] Edit entry to change time from `07:00` → `06:30` → updates correctly
- [ ] Add 20 logs with different breathing/legs scores → correlation calculates
- [ ] Add logs with varying inhaler times → average time computes correctly

### Browser/Device Tests

- [ ] Desktop (Chrome, Safari, Firefox)
- [ ] Mobile (iPhone, Android) — time input responsive
- [ ] Tablet — charts scale properly

### Rollback Plan

If issues arise, simply remove the new time columns:

```sql
ALTER TABLE public.daily_logs
DROP COLUMN IF EXISTS inhaler_brown_am_time CASCADE;
DROP COLUMN IF EXISTS inhaler_brown_pm_time CASCADE;
DROP COLUMN IF EXISTS inhaler_blue_prerace_time CASCADE;
```

Then redeploy the previous app version.

---

## Troubleshooting

### "Time field doesn't appear when I toggle inhaler"
- **Cause:** Form state not updating
- **Fix:** Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- **Check:** Browser DevTools Console for errors

### "Analytics tab shows 'Not enough data'"
- **Cause:** Less than 3 recent logs with complete breathing/legs data
- **Fix:** Log more entries
- **Expected:** Needs 3+ entries with both breathing and legs scores

### "Correlation chart shows blue line but no points"
- **Cause:** Points outside SVG bounds (rare)
- **Fix:** Check data values (should be 1-5)
- **Contact:** Unlikely; if persists, check logs in Supabase

### "CSV export shows empty time columns"
- **Cause:** Time field wasn't saved (toggled OFF or empty)
- **Expected:** Empty cells are normal for days without inhalers
- **Check:** Verify toggle is ON and time is set before saving

### "Mobile time input keyboard looks weird"
- **Expected:** Native keyboard depends on browser
- **Workaround:** Type `HHMM` without colon, auto-formats

---

## Future Enhancements

Potential improvements for v2:

1. **Weekly Recovery Heatmap**
   - Visual grid showing breathing/legs for each day of week
   - Helps spot weekly patterns

2. **Medication Effectiveness Score**
   - ML model: "You're 45% more likely to run faster after AM inhaler"
   - Personalised insights from your data

3. **Race Week Indicator**
   - Toggle to mark race weeks
   - Compare training feel: race week vs normal

4. **Illness Severity Tracking**
   - Add severity scale (1-5) to illness checkbox
   - Filter analytics by illness type

5. **Sleep Quality Rating**
   - Add 1-5 sleep quality scale
   - Correlate sleep → breathing → legs

6. **Breathing/Legs Trend Analysis**
   - 7-day rolling average
   - Detect improving/declining trends

7. **Export Formats**
   - PDF report generation
   - Coach-specific view (filtered fields)

---

## Support & Questions

**Issue with deployment?**
- Check git status: `git status`
- Verify Vercel logs: https://vercel.com/dashboard → sm-training-log → Deployments
- Browser DevTools Console (F12) for JS errors

**Data looks wrong?**
- Verify Supabase schema changes applied
- Check recent logs in Supabase editor
- Export CSV to inspect raw data

**Want to customize?**
- Components are in `src/components/` — modify freely
- Color scheme: Update Tailwind classes
- Analysis period: Change `days={30}` prop to `days={60}`, etc.

---

## Summary

✅ **All changes implemented and ready to deploy:**

| Feature | Files | Status |
|---------|-------|--------|
| Medication timing | TimeInput.jsx, DailyLogForm.jsx | ✅ Complete |
| Breathing-legs correlation | CorrelationChart.jsx, AthleteLog.jsx | ✅ Complete |
| Medication insights | MedicationInsights.jsx, AthleteLog.jsx | ✅ Complete |
| CSV export | AthleteLog.jsx | ✅ Complete |
| Database schema | SUPABASE_MIGRATION.sql | ✅ Ready |

**Next steps:**
1. Run Supabase migration
2. Push code to GitHub
3. Verify Vercel deployment
4. Test with real data
5. Enjoy insights! 🎉
