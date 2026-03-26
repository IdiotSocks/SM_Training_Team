import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import DailyLogForm from '../components/DailyLogForm';
import { supabase } from '../lib/supabase';
import { FEEL_EMOJIS } from '../lib/constants';

export default function AthleteLog({ showHistory = false }) {
  const { user, userRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setEditingId(null);
    setEditingData(null);
    fetchLogs();
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    setEditingData(log);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const downloadCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }

    // CSV columns: date, feel_overall, feel_legs, feel_breathing, feel_motivation,
    // inhaler_am, inhaler_pm, inhaler_pre_race, inhaler_notes,
    // alcohol_units, late_night, travel, high_stress, illness, illness_notes,
    // sauna, boots, altitude_chamber, heat_treadmill, recovery_notes,
    // supplements, notes
    const headers = [
      'Date',
      'Feel Overall',
      'Feel Legs',
      'Feel Breathing',
      'Feel Motivation',
      'Inhaler AM',
      'Inhaler PM',
      'Inhaler Pre-Race',
      'Medication Notes',
      'Alcohol Units',
      'Late Night',
      'Travel',
      'High Stress',
      'Illness',
      'Illness Notes',
      'Sauna (mins)',
      'Compression Boots (mins)',
      'Altitude Chamber (mins)',
      'Heat Treadmill (mins)',
      'Supplements',
      'Notes',
    ];

    const rows = logs.map(log => [
      log.log_date,
      log.feel_overall || '',
      log.feel_legs || '',
      log.feel_breathing || '',
      log.feel_motivation || '',
      log.inhaler_brown_am ? 'Yes' : 'No',
      log.inhaler_brown_pm ? 'Yes' : 'No',
      log.inhaler_blue_prerace ? 'Yes' : 'No',
      log.inhaler_notes || '',
      log.alcohol_units || '',
      log.late_night ? 'Yes' : 'No',
      log.travel ? 'Yes' : 'No',
      log.high_stress ? 'Yes' : 'No',
      log.illness ? 'Yes' : 'No',
      log.illness_notes || '',
      log.sauna_mins || '',
      log.boots_mins || '',
      log.altitude_chamber_mins || '',
      log.heat_treadmill_mins || '',
      log.supp_other || '',
      log.notes || '',
    ]);

    // Escape CSV values
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `training-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Layout userRole={userRole} title="Daily Log">
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout userRole={userRole} title={showHistory ? 'Training History' : 'Daily Log'}>
      <div className="space-y-6">
        {/* Form Section */}
        {!showHistory && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Today's Log</h2>
              {editingId && (
                <button
                  onClick={handleCancel}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ✕ Cancel edit
                </button>
              )}
            </div>
            <DailyLogForm
              userId={user.id}
              onSubmit={handleFormSubmit}
              initialData={editingData}
            />
          </div>
        )}

        {/* History Section */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {showHistory ? 'All Entries' : 'Recent Entries'}
            </h2>
            {logs.length > 0 && (
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium transition"
              >
                ⬇ Export CSV
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No log entries yet. Create your first entry above!</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p>
                          {FEEL_EMOJIS[log.feel_overall] || '—'} Feel: {log.feel_overall}/5
                        </p>
                        {(log.late_night || log.travel || log.high_stress || log.illness) && (
                          <p>
                            {log.late_night && '🌙 Late night '}
                            {log.travel && '✈️ Travel '}
                            {log.high_stress && '😟 Stress '}
                            {log.illness && '🤒 Illness'}
                          </p>
                        )}
                        {log.notes && (
                          <p className="text-gray-700 italic">{log.notes.substring(0, 60)}...</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(log)}
                      className="whitespace-nowrap px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded font-medium transition"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
