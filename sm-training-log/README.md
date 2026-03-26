# Simba Training Log

A progressive web app (PWA) for ultra-marathon athletes to log daily training context that wearables can't capture. Built for Simba's Snowdonia 80K (May 15) and Val d'Aran 75K (July 1) race prep.

**Live:** https://sm-training-log.vercel.app/

## Features

### Athlete Dashboard
- **Daily Log Form** (6 sections):
  - How you feel (Overall, Legs, Breathing, Motivation) with emoji scales
  - Medication (inhalers AM/PM/pre-race)
  - Lifestyle context (alcohol, late night, travel, stress, illness)
  - Recovery modalities (sauna, boots, altitude chamber, heat treadmill)
  - Supplements
  - Notes

- **Training History** - View and edit past entries
- **CSV Export** - Download all logs as CSV for external analysis
- **Mobile-first** - Optimized for logging subjective context on phone in <3 minutes
- **Offline Support** - Form submissions cached and synced on reconnect (PWA)

### Future: Wearable Data Integration
- CSV upload for Garmin/Whoop metrics (coming in Phase 12)
- External API integration for automatic data sync
- Coach dashboard redesign (in progress)

## Tech Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth)
- **Real-time:** Supabase Row-Level Security (RLS) policies
- **PWA:** vite-plugin-pwa with Workbox service worker
- **Charts:** Recharts (Phase 8+)
- **Routing:** React Router v7
- **Deployment:** Vercel

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Supabase project
- Vercel account (for deployment)

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd sm-training-log
   npm install --legacy-peer-deps
   ```

2. **Create `.env.local`:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

### Supabase Setup

1. **Create Supabase project** at supabase.com

2. **Run schema SQL** in SQL Editor:
   - Execute `supabase/schema.sql` to create `daily_logs` table

3. **Create test user:**
   ```sql
   -- Athlete (via Supabase Auth UI)
   Email: mugomba@gmail.com
   Password: TEST
   Metadata: {"role": "athlete"}
   ```

4. **Add RLS Policies** in SQL Editor:
   ```sql
   -- Athletes: read/write own logs
   CREATE POLICY "read_own_logs" ON daily_logs
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "insert_own_logs" ON daily_logs
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "update_own_logs" ON daily_logs
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "delete_own_logs" ON daily_logs
     FOR DELETE USING (auth.uid() = user_id);
   ```

## Deployment to Vercel

1. **Push to GitHub** (if not already)
2. **Connect to Vercel:**
   ```bash
   npx vercel --prod
   ```
3. **Set Environment Variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Redeploy** in Vercel dashboard

## Mobile Installation (PWA)

1. Open app in browser
2. **iOS:** Tap Share → Add to Home Screen
3. **Android:** Tap Menu (⋮) → Install app

App works offline and syncs when reconnected.

## Project Structure

```
sm-training-log/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components (Login, AthleteLog, CoachDashboard)
│   ├── hooks/            # Custom React hooks (useAuth)
│   ├── lib/
│   │   ├── supabase.js   # Supabase client
│   │   ├── constants.js  # HRV thresholds, status colors, phases
│   │   └── ...
│   ├── App.jsx           # Main router
│   └── main.jsx          # Entry point
├── public/               # Static assets + PWA icons
├── supabase/
│   └── schema.sql        # Database schema
├── vite.config.js        # Vite + PWA config
└── tailwind.config.js    # Tailwind theming
```

## Future Enhancements

- **Phase 12:** CSV upload for wearable metrics (Garmin, Whoop)
- **Phase 13:** External API auto-population of wearable data
- **Phase 14:** Coach dashboard redesign
- Weekly summary emails to coaching team
- Race countdown widgets
- Illness trend detection
- 30-day trend charts (HRV, Recovery, Alcohol)

## Testing

### Manual Test Flow
1. **As Athlete:**
   - Log in, fill daily log with subjective data
   - Save entry and check history
   - Export logs to CSV and verify data

2. **PWA Offline:**
   - Install app on mobile
   - Disable network, fill log form
   - Re-enable network, verify sync

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Form won't submit | Validation error or network issue | Check console for errors; verify network connection |
| CSV export downloads empty file | No logs in database | Create and save at least one daily log entry first |
| PWA not installing | Missing icons | Verify `public/icon-192x192.png` and `icon-512x512.png` exist |
| Cannot log in | Invalid credentials or user doesn't exist | Verify email and password in Supabase Authentication users |

## Support & Questions

For issues or questions:
1. Check console for errors (`F12 → Console`)
2. Verify Supabase tables and RLS policies
3. Confirm environment variables are set in Vercel
4. Review Supabase logs for database errors

## License

Private project for Simba's race training.
