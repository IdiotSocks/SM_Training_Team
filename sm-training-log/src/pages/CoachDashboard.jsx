import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import MetricCard from '../components/MetricCard';
import FlagBadge from '../components/FlagBadge';
import StatusBadge from '../components/StatusBadge';
import { supabase } from '../lib/supabase';
import { HRV_STATUS, RECOVERY_STATUS, SPO2_STATUS, SLEEP_SCORE_STATUS, getCurrentPhase, FEEL_EMOJIS, calculateTrend } from '../lib/constants';

export default function CoachDashboard() {
  const { user, userRole } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .order('log_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout userRole={userRole} title="Coach Dashboard">
        <div className="text-center py-8">Loading dashboard...</div>
      </Layout>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(log => log.log_date === today);
  const last7Days = logs.slice(0, 7).reverse();
  const previousLog = last7Days.length > 1 ? last7Days[last7Days.length - 2] : null;

  const last3Logs = logs.slice(0, 3).reverse();
  const phase = getCurrentPhase();
  const gateThreshold = phase.gate.min;
  const gateMetLogs = last3Logs.filter(log => log.hrv_ms && parseFloat(log.hrv_ms) >= gateThreshold);
  const gateConditionMet = gateMetLogs.length >= 3;
  const gateStatus = gateConditionMet ? 'MET ✓' : 'NOT MET';
  const gateColor = gateConditionMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const todayFlags = [];
  if (todayLog) {
    if (todayLog.illness) todayFlags.push('illness');
    if (todayLog.alcohol_units > 0) todayFlags.push('alcohol');
    if (todayLog.travel) todayFlags.push('travel');
    if (todayLog.high_stress) todayFlags.push('stress');
    if (todayLog.late_night) todayFlags.push('late_night');
  }

  return (
    <Layout userRole={userRole} title="Coach Dashboard">
      <div className="space-y-6">
        {todayLog && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Today's Snapshot</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="HRV"
                value={todayLog.hrv_ms}
                unit="ms"
                status={todayLog.hrv_ms ? HRV_STATUS(parseFloat(todayLog.hrv_ms)) : null}
                trend={previousLog ? calculateTrend(todayLog.hrv_ms, previousLog.hrv_ms) : null}
              />
              <MetricCard
                label="Recovery"
                value={todayLog.recovery_pct}
                unit="%"
                status={todayLog.recovery_pct ? RECOVERY_STATUS(parseInt(todayLog.recovery_pct)) : null}
                trend={previousLog ? calculateTrend(todayLog.recovery_pct, previousLog.recovery_pct) : null}
              />
              <MetricCard
                label="SpO2"
                value={todayLog.spo2_pct}
                unit="%"
                status={todayLog.spo2_pct ? SPO2_STATUS(parseFloat(todayLog.spo2_pct)) : null}
              />
              <MetricCard
                label="Sleep Score"
                value={todayLog.sleep_score}
                unit="%"
                status={todayLog.sleep_score ? SLEEP_SCORE_STATUS(parseInt(todayLog.sleep_score)) : null}
              />
            </div>
            {todayFlags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {todayFlags.map(flag => (
                  <FlagBadge key={flag} flag={flag} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`rounded-lg shadow p-6 ${gateColor}`}>
          <h3 className="font-bold text-lg mb-2">HRV Gate Status</h3>
          <p className="text-sm mb-2">Phase: <strong>{phase.phase}</strong></p>
          <p className="text-sm mb-2">Threshold: <strong>{gateThreshold}ms</strong> (last 3 entries)</p>
          <p className="text-xl font-bold">Status: {gateStatus}</p>
          {!gateConditionMet && last3Logs.length > 0 && (
            <p className="text-sm mt-2">{gateMetLogs.length}/3 entries above threshold</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">📊 Trend Charts</h3>
          <p className="text-gray-600">30-day HRV and Recovery charts coming in Phase 8</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Last 30 Days</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Feel</th>
                  <th className="text-left px-3 py-2">HRV</th>
                  <th className="text-left px-3 py-2">Recovery</th>
                  <th className="text-left px-3 py-2">SpO2</th>
                  <th className="text-left px-3 py-2">RHR</th>
                  <th className="text-left px-3 py-2">Sleep</th>
                  <th className="text-left px-3 py-2">Flags</th>
                  <th className="text-left px-3 py-2">Session</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`border-b hover:bg-gray-50 transition cursor-pointer ${
                        log.coaching_flag ? 'bg-red-50' : ''
                      }`}
                      onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                    >
                      <td className="px-3 py-2 font-medium">
                        {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-lg">{FEEL_EMOJIS[log.feel_overall] || '—'}</span>
                      </td>
                      <td className="px-3 py-2">
                        {log.hrv_ms ? (
                          <StatusBadge
                            label={`${log.hrv_ms}ms`}
                            status={HRV_STATUS(parseFloat(log.hrv_ms))}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {log.recovery_pct ? (
                          <StatusBadge
                            label={`${log.recovery_pct}%`}
                            status={RECOVERY_STATUS(parseInt(log.recovery_pct))}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2">{log.spo2_pct ? `${log.spo2_pct}%` : '—'}</td>
                      <td className="px-3 py-2">{log.resting_hr ? `${log.resting_hr}` : '—'}</td>
                      <td className="px-3 py-2">
                        {log.sleep_score ? `${log.sleep_score}% / ${log.sleep_hrs}h` : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 flex-wrap">
                          {log.illness && <FlagBadge flag="illness" />}
                          {log.alcohol_units > 0 && <FlagBadge flag="alcohol" />}
                          {log.travel && <FlagBadge flag="travel" />}
                          {log.high_stress && <FlagBadge flag="stress" />}
                          {log.late_night && <FlagBadge flag="late_night" />}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {log.trained_today ? `🏃 ${log.session_type}` : '—'}
                      </td>
                    </tr>
                    {expandedRow === log.id && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan="9" className="px-3 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong>Inhalers:</strong>
                              <p>
                                {log.inhaler_brown_am && '🟤 AM '}
                                {log.inhaler_brown_pm && '🟤 PM '}
                                {log.inhaler_blue_prerace && '🔵 Pre-race'}
                                {!log.inhaler_brown_am && !log.inhaler_brown_pm && !log.inhaler_blue_prerace && '—'}
                              </p>
                            </div>
                            {log.trained_today && (
                              <>
                                <div><strong>Duration:</strong> {log.session_duration_mins} mins</div>
                                <div><strong>Distance:</strong> {log.session_distance_km} km</div>
                                <div><strong>Elevation:</strong> {log.session_elevation_m} m</div>
                                <div><strong>Avg HR:</strong> {log.session_avg_hr} bpm</div>
                                <div><strong>RPE:</strong> {log.session_rpe}/10</div>
                              </>
                            )}
                            {log.notes && (
                              <div className="md:col-span-3">
                                <strong>Notes:</strong>
                                <p className="mt-1">{log.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
