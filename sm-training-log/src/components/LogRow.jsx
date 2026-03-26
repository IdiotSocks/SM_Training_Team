import { useState } from 'react';
import { FEEL_EMOJIS, HRV_STATUS, RECOVERY_STATUS } from '../lib/constants';
import FlagBadge from './FlagBadge';
import StatusBadge from './StatusBadge';

export default function LogRow({ entry, expanded, onExpandToggle }) {
  if (!entry) return null;

  const hrvStatus = entry.hrv_ms ? HRV_STATUS(entry.hrv_ms) : null;
  const recoveryStatus = entry.recovery_pct
    ? RECOVERY_STATUS(entry.recovery_pct)
    : null;

  const flags = {
    illness: entry.illness,
    alcohol: entry.alcohol_units,
    travel: entry.travel,
    high_stress: entry.high_stress,
    late_night: entry.late_night,
  };

  const hasCoachingFlag = entry.coaching_flag;
  const missingInhaler =
    !entry.inhaler_brown_am ||
    !entry.inhaler_brown_pm;

  return (
    <>
      <tr
        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
          hasCoachingFlag ? 'bg-red-50' : ''
        }`}
        onClick={() => onExpandToggle(entry.id)}
      >
        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
          {new Date(entry.log_date).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-lg">
          {FEEL_EMOJIS[entry.feel_overall] || '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.hrv_ms ? (
            <div className="flex items-center gap-2">
              <span>{entry.hrv_ms}ms</span>
              {hrvStatus && (
                <StatusBadge
                  label={hrvStatus.label}
                  bg={hrvStatus.bg}
                  text={hrvStatus.text}
                  size="sm"
                />
              )}
            </div>
          ) : (
            '—'
          )}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.recovery_pct ? (
            <div className="flex items-center gap-2">
              <span>{entry.recovery_pct}%</span>
              {recoveryStatus && (
                <StatusBadge
                  label={recoveryStatus.label}
                  bg={recoveryStatus.bg}
                  text={recoveryStatus.text}
                  size="sm"
                />
              )}
            </div>
          ) : (
            '—'
          )}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.spo2_pct ? `${entry.spo2_pct}%` : '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.resting_hr ? `${entry.resting_hr}bpm` : '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.sleep_score ? `${entry.sleep_score}%` : '—'} /{' '}
          {entry.sleep_hrs ? `${entry.sleep_hrs}h` : '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.inhaler_brown_am && entry.inhaler_brown_pm ? (
            <span className="text-green-600 font-semibold">✓ Both</span>
          ) : entry.inhaler_brown_am || entry.inhaler_brown_pm ? (
            <span className="text-yellow-600 font-semibold">⚠ Partial</span>
          ) : (
            <span className="text-red-600 font-semibold">✗ Missed</span>
          )}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <FlagBadge flags={flags} />
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          {entry.trained_today ? entry.session_type || '—' : 'Rest day'}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {entry.notes ? entry.notes.substring(0, 30) + '...' : '—'}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan="11" className="px-4 py-4">
            <div className="space-y-3">
              {entry.illness && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Illness Notes:
                  </p>
                  <p className="text-sm text-gray-600">{entry.illness_notes}</p>
                </div>
              )}

              {entry.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Coaching Notes:
                  </p>
                  <p className="text-sm text-gray-600">{entry.notes}</p>
                </div>
              )}

              {entry.trained_today && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>{' '}
                    {entry.session_duration_mins}min
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Distance:</span>{' '}
                    {entry.session_distance_km}km
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Elevation:</span>{' '}
                    {entry.session_elevation_m}m
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Avg HR:</span>{' '}
                    {entry.session_avg_hr}bpm
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">RPE:</span>{' '}
                    {entry.session_rpe}/10
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
