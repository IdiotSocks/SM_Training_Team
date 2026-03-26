import { useMemo } from 'react';

/**
 * MedicationInsights Component
 * Analyzes medication timing patterns and their correlation with breathing quality
 *
 * Props:
 * - logs: array of log objects with inhaler info and feel_breathing
 * - days: number of days to analyze (default: 30)
 */
export default function MedicationInsights({ logs, days = 30 }) {
  const insights = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const recentLogs = logs.slice(0, days);

    // Analyze each inhaler type
    const analyzeinhalers = (field, timeField) => {
      const used = recentLogs.filter(l => l[field]);
      const notUsed = recentLogs.filter(l => !l[field]);

      if (used.length === 0) return null;

      // Calculate usage percentage
      const usagePercent = ((used.length / recentLogs.length) * 100).toFixed(0);

      // Average breathing on days used vs not used
      const avgBreathingUsed = (used.reduce((sum, l) => sum + (l.feel_breathing || 0), 0) / used.length).toFixed(1);
      const avgBreathingNotUsed = notUsed.length > 0
        ? (notUsed.reduce((sum, l) => sum + (l.feel_breathing || 0), 0) / notUsed.length).toFixed(1)
        : null;

      // Extract times
      const times = used
        .filter(l => l[timeField])
        .map(l => l[timeField])
        .sort();

      // Calculate average time
      let avgHour = null;
      let avgMinute = null;
      if (times.length > 0) {
        let totalMinutes = 0;
        times.forEach(time => {
          const [h, m] = time.split(':').map(Number);
          totalMinutes += h * 60 + m;
        });
        const avgTotalMinutes = totalMinutes / times.length;
        avgHour = Math.floor(avgTotalMinutes / 60);
        avgMinute = Math.round(avgTotalMinutes % 60);
      }

      return {
        usagePercent,
        used: used.length,
        total: recentLogs.length,
        avgBreathingUsed,
        avgBreathingNotUsed,
        times,
        avgHour,
        avgMinute,
      };
    };

    return {
      brownAm: analyzeinhalers('inhaler_brown_am', 'inhaler_brown_am_time'),
      brownPm: analyzeinhalers('inhaler_brown_pm', 'inhaler_brown_pm_time'),
      bluePrerace: analyzeinhalers('inhaler_blue_prerace', 'inhaler_blue_prerace_time'),
      period: `Last ${days} days`,
    };
  }, [logs, days]);

  if (!insights || (!insights.brownAm && !insights.brownPm && !insights.bluePrerace)) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No medication data yet. Start logging your inhalers to see patterns.</p>
      </div>
    );
  }

  const InhalerCard = ({ title, data, icon }) => {
    if (!data) return null;

    const improvement = data.avgBreathingNotUsed
      ? ((data.avgBreathingUsed - data.avgBreathingNotUsed) * 100).toFixed(0)
      : null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Usage frequency */}
        <div>
          <p className="text-xs text-gray-600">Usage Frequency</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition"
                style={{ width: `${data.usagePercent}%` }}
              />
            </div>
            <p className="text-sm font-bold text-gray-700 w-12 text-right">
              {data.usagePercent}%
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {data.used} of {data.total} days
          </p>
        </div>

        {/* Breathing comparison */}
        <div>
          <p className="text-xs text-gray-600 mb-1">Breathing Quality</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs text-gray-600">Days with inhaler</p>
              <p className="text-lg font-bold text-blue-600">{data.avgBreathingUsed}/5</p>
            </div>
            {data.avgBreathingNotUsed && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-600">Days without</p>
                <p className="text-lg font-bold text-gray-600">{data.avgBreathingNotUsed}/5</p>
              </div>
            )}
          </div>
          {improvement && (
            <p className="text-xs text-green-600 mt-1">
              ↑ {improvement}% better breathing with inhaler
            </p>
          )}
        </div>

        {/* Timing pattern */}
        {data.avgHour !== null && (
          <div>
            <p className="text-xs text-gray-600 mb-1">Typical Time</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {String(data.avgHour).padStart(2, '0')}:{String(data.avgMinute).padStart(2, '0')}
            </p>
            {data.times.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {data.times.length} measurements over {days} days
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 italic">Analysis period: {insights.period}</p>

      {/* Inhaler cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InhalerCard title="Brown Inhaler (AM)" data={insights.brownAm} icon="🟤" />
        <InhalerCard title="Brown Inhaler (PM)" data={insights.brownPm} icon="🟤" />
        <InhalerCard title="Blue Inhaler (Pre-race)" data={insights.bluePrerace} icon="🔵" />
      </div>

      {/* Insights summary */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-gray-900">Key Insights</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {insights.brownAm && (
            <li>
              • Brown AM: Used on <strong>{insights.brownAm.usagePercent}%</strong> of days
              {insights.brownAm.avgHour !== null && (
                <>, typically at <strong>{String(insights.brownAm.avgHour).padStart(2, '0')}:{String(insights.brownAm.avgMinute).padStart(2, '0')}</strong></>
              )}
            </li>
          )}
          {insights.brownPm && (
            <li>
              • Brown PM: Used on <strong>{insights.brownPm.usagePercent}%</strong> of days
              {insights.brownPm.avgHour !== null && (
                <>, typically at <strong>{String(insights.brownPm.avgHour).padStart(2, '0')}:{String(insights.brownPm.avgMinute).padStart(2, '0')}</strong></>
              )}
            </li>
          )}
          {insights.bluePrerace && (
            <li>
              • Blue pre-race: Used on <strong>{insights.bluePrerace.usagePercent}%</strong> of days
              {insights.bluePrerace.avgHour !== null && (
                <>, typically at <strong>{String(insights.bluePrerace.avgHour).padStart(2, '0')}:{String(insights.bluePrerace.avgMinute).padStart(2, '0')}</strong></>
              )}
            </li>
          )}
          <li>
            • Patterns help you understand medication timing and breathing response.
          </li>
        </ul>
      </div>
    </div>
  );
}
