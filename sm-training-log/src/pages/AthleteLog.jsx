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
          <h2 className="text-2xl font-bold mb-4">
            {showHistory ? 'All Entries' : 'Recent Entries'}
          </h2>

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
                          {log.trained_today && ` | 🏃 ${log.session_type}`}
                        </p>
                        <p>
                          HRV: {log.hrv_ms || '—'}ms | Recovery: {log.recovery_pct || '—'}%
                        </p>
                        {log.coaching_flag && (
                          <p className="text-red-600 font-medium">⚠️ Flagged for coach</p>
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
