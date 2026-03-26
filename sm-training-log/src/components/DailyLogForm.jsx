import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  FEEL_EMOJIS,
  HRV_STATUS,
  RECOVERY_STATUS,
  SPO2_STATUS,
  SLEEP_SCORE_STATUS,
  SESSION_TYPES,
  ALCOHOL_OPTIONS,
  RECOVERY_MODALITIES,
  SUPPLEMENTS,
  INHALERS,
} from '../lib/constants';
import StatusBadge from './StatusBadge';

export default function DailyLogForm({ userId, onSubmit, initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [formData, setFormData] = useState({
    log_date: today,
    feel_overall: 3,
    feel_legs: 3,
    feel_breathing: 3,
    feel_motivation: 3,
    hrv_ms: '',
    recovery_pct: '',
    rhr: '',
    spo2_pct: '',
    sleep_score: '',
    sleep_hours: '',
    inhaler_am: false,
    inhaler_pm: false,
    inhaler_prerace: false,
    inhaler_notes: '',
    alcohol_units: 0,
    late_night: false,
    travel: false,
    high_stress: false,
    illness: false,
    illness_notes: '',
    sauna_duration: '',
    boots_duration: '',
    altitude_chamber_duration: '',
    heat_treadmill_duration: '',
    supplements: '',
    trained_today: false,
    session_type: '',
    session_duration: '',
    session_distance: '',
    session_elevation: '',
    session_avg_hr: '',
    session_rpe: 5,
    coaching_notes: '',
    coaching_flag: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    feel: true,
    wearable: false,
    medication: false,
    lifestyle: false,
    recovery: false,
    supplements: false,
    training: false,
    notes: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Load existing entry if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert(
          {
            user_id: userId,
            log_date: formData.log_date,
            feel_overall: formData.feel_overall,
            feel_legs: formData.feel_legs,
            feel_breathing: formData.feel_breathing,
            feel_motivation: formData.feel_motivation,
            hrv_ms: formData.hrv_ms ? parseFloat(formData.hrv_ms) : null,
            recovery_pct: formData.recovery_pct ? parseInt(formData.recovery_pct) : null,
            resting_hr: formData.rhr ? parseInt(formData.rhr) : null,
            spo2_pct: formData.spo2_pct ? parseFloat(formData.spo2_pct) : null,
            sleep_score: formData.sleep_score ? parseInt(formData.sleep_score) : null,
            sleep_hrs: formData.sleep_hours ? parseFloat(formData.sleep_hours) : null,
            inhaler_brown_am: formData.inhaler_am || false,
            inhaler_brown_pm: formData.inhaler_pm || false,
            inhaler_blue_prerace: formData.inhaler_prerace || false,
            inhaler_notes: formData.inhaler_notes || null,
            alcohol_units: parseFloat(formData.alcohol_units) || 0,
            late_night: formData.late_night,
            travel: formData.travel,
            high_stress: formData.high_stress,
            illness: formData.illness,
            illness_notes: formData.illness_notes || null,
            sauna_mins: formData.sauna_duration ? parseInt(formData.sauna_duration) : null,
            boots_mins: formData.boots_duration ? parseInt(formData.boots_duration) : null,
            altitude_chamber_mins: formData.altitude_chamber_duration ? parseInt(formData.altitude_chamber_duration) : null,
            heat_treadmill_mins: formData.heat_treadmill_duration ? parseInt(formData.heat_treadmill_duration) : null,
            supp_vitamin_c: false,
            supp_omega3: false,
            supp_magnesium: false,
            supp_vitamin_d: false,
            supp_other: formData.supplements || null,
            trained_today: formData.trained_today,
            session_type: formData.session_type || null,
            session_duration_mins: formData.session_duration ? parseInt(formData.session_duration) : null,
            session_distance_km: formData.session_distance ? parseFloat(formData.session_distance) : null,
            session_elevation_m: formData.session_elevation ? parseInt(formData.session_elevation) : null,
            session_avg_hr: formData.session_avg_hr ? parseInt(formData.session_avg_hr) : null,
            session_rpe: formData.session_rpe ? parseInt(formData.session_rpe) : null,
            notes: formData.coaching_notes || null,
            coaching_flag: formData.coaching_flag,
          },
          { onConflict: 'user_id,log_date' }
        );

      if (error) throw error;

      setMessage({ type: 'success', text: '✓ Log saved successfully!' });
      if (onSubmit) onSubmit();

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          feel_overall: 3,
          feel_legs: 3,
          feel_breathing: 3,
          feel_motivation: 3,
          hrv_ms: '',
          recovery_pct: '',
          rhr: '',
          spo2_pct: '',
          sleep_score: '',
          sleep_hours: '',
          coaching_notes: '',
        }));
        setMessage(null);
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Helper: Render emoji scale buttons (1-5)
  const EmojiScale = ({ field, value }) => (
    <div className="flex gap-2 justify-between mb-4">
      {[1, 2, 3, 4, 5].map(num => (
        <button
          key={num}
          onClick={() => handleChange(field, num)}
          className={`flex-1 py-3 rounded-lg font-bold text-2xl transition ${
            value === num
              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          {FEEL_EMOJIS[num]}
        </button>
      ))}
    </div>
  );

  // Helper: Number input with color coding
  const NumericInput = ({ label, field, value, status, unit, min, max, step }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          min={min}
          max={max}
          step={step || 1}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
        {status && (
          <div className={`px-3 py-2 rounded-md ${status.bg} ${status.text} font-medium text-sm whitespace-nowrap`}>
            {status.label}
          </div>
        )}
      </div>
    </div>
  );

  // Helper: Toggle switch
  const ToggleSwitch = ({ label, field, value }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button
        onClick={() => handleChange(field, !value)}
        className={`w-12 h-6 rounded-full transition ${
          value ? 'bg-green-600' : 'bg-gray-300'
        } flex items-center justify-end px-1`}
      >
        <div className="w-5 h-5 bg-white rounded-full" />
      </button>
    </div>
  );

  // Helper: Collapsible section
  const Section = ({ title, id, children }) => (
    <div className="bg-white rounded-lg shadow mb-4 border border-gray-200">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`text-2xl transition ${expandedSections[id] ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expandedSections[id] && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">{children}</div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Section A: How do you feel today? */}
      <Section title="How do you feel today?" id="feel">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Overall
            </label>
            <EmojiScale field="feel_overall" value={formData.feel_overall} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Leg Freshness
            </label>
            <EmojiScale field="feel_legs" value={formData.feel_legs} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Breathing
            </label>
            <EmojiScale field="feel_breathing" value={formData.feel_breathing} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Motivation
            </label>
            <EmojiScale field="feel_motivation" value={formData.feel_motivation} />
          </div>
        </div>
      </Section>

      {/* Section B: Wearable numbers */}
      <Section title="From your Whoop / Garmin" id="wearable">
        <NumericInput
          label="HRV"
          field="hrv_ms"
          value={formData.hrv_ms}
          status={formData.hrv_ms ? HRV_STATUS(parseFloat(formData.hrv_ms)) : null}
          unit="ms"
          min="0"
          step="0.1"
        />
        <NumericInput
          label="Recovery"
          field="recovery_pct"
          value={formData.recovery_pct}
          status={formData.recovery_pct ? RECOVERY_STATUS(parseInt(formData.recovery_pct)) : null}
          unit="%"
          min="0"
          max="100"
        />
        <NumericInput
          label="Resting HR"
          field="rhr"
          value={formData.rhr}
          unit="bpm"
          min="30"
          max="120"
        />
        <NumericInput
          label="SpO2"
          field="spo2_pct"
          value={formData.spo2_pct}
          status={formData.spo2_pct ? SPO2_STATUS(parseFloat(formData.spo2_pct)) : null}
          unit="%"
          min="80"
          max="100"
          step="0.1"
        />
        <NumericInput
          label="Sleep Score"
          field="sleep_score"
          value={formData.sleep_score}
          status={formData.sleep_score ? SLEEP_SCORE_STATUS(parseInt(formData.sleep_score)) : null}
          unit="%"
          min="0"
          max="100"
        />
        <NumericInput
          label="Sleep"
          field="sleep_hours"
          value={formData.sleep_hours}
          unit="hours"
          min="0"
          max="16"
          step="0.5"
        />
      </Section>

      {/* Section C: Medication */}
      <Section title="Medication" id="medication">
        {INHALERS.map(inhaler => (
          <ToggleSwitch
            key={inhaler.key}
            label={inhaler.label}
            field={`inhaler_${inhaler.key}`}
            value={formData[`inhaler_${inhaler.key}`]}
          />
        ))}
        <textarea
          value={formData.inhaler_notes}
          onChange={(e) => handleChange('inhaler_notes', e.target.value)}
          placeholder="Any notes about medication..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </Section>

      {/* Section D: Lifestyle context */}
      <Section title="What else happened?" id="lifestyle">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Alcohol
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ALCOHOL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleChange('alcohol_units', opt.value)}
                className={`py-2 px-3 rounded-lg font-medium transition ${
                  formData.alcohol_units === opt.value
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <ToggleSwitch label="Late night (after midnight)" field="late_night" value={formData.late_night} />
        <ToggleSwitch label="Travel day" field="travel" value={formData.travel} />
        <ToggleSwitch label="High stress" field="high_stress" value={formData.high_stress} />
        <ToggleSwitch label="Illness / feeling unwell" field="illness" value={formData.illness} />

        {formData.illness && (
          <textarea
            value={formData.illness_notes}
            onChange={(e) => handleChange('illness_notes', e.target.value)}
            placeholder="What symptoms?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />
        )}
      </Section>

      {/* Section E: Recovery modalities */}
      <Section title="Recovery modalities used" id="recovery">
        {RECOVERY_MODALITIES.map(modality => (
          <div key={modality.key} className="mb-4 p-3 bg-gray-100 rounded-lg">
            <ToggleSwitch
              label={modality.label}
              field={`used_${modality.key}`}
              value={formData[`used_${modality.key}`]}
            />
            {formData[`used_${modality.key}`] && (
              <div className="mt-3 space-y-2">
                <input
                  type="number"
                  value={formData[`${modality.key}_mins`]}
                  onChange={(e) => handleChange(`${modality.key}_mins`, e.target.value)}
                  placeholder={`Duration (${modality.unit})`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
                {modality.extra && (
                  <input
                    type="number"
                    value={formData[`${modality.extra}`]}
                    onChange={(e) => handleChange(modality.extra, e.target.value)}
                    placeholder="Simulated altitude (m)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </Section>

      {/* Section F: Supplements */}
      <Section title="Supplements taken" id="supplements">
        {SUPPLEMENTS.map(supp => (
          <ToggleSwitch
            key={supp.key}
            label={supp.label}
            field={`supp_${supp.key}`}
            value={formData[`supp_${supp.key}`]}
          />
        ))}
        <textarea
          value={formData.supp_other}
          onChange={(e) => handleChange('supp_other', e.target.value)}
          placeholder="Other supplements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="2"
        />
      </Section>

      {/* Section G: Training session */}
      <Section title="Training session" id="training">
        <ToggleSwitch label="Did you train today?" field="trained_today" value={formData.trained_today} />

        {formData.trained_today && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session type
              </label>
              <select
                value={formData.session_type}
                onChange={(e) => handleChange('session_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                {SESSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <NumericInput label="Duration" field="session_duration_mins" value={formData.session_duration_mins} unit="mins" min="0" />
            <NumericInput label="Distance" field="session_distance_km" value={formData.session_distance_km} unit="km" min="0" step="0.1" />
            <NumericInput label="Elevation" field="session_elevation_m" value={formData.session_elevation_m} unit="m" min="0" />
            <NumericInput label="Avg HR" field="session_avg_hr" value={formData.session_avg_hr} unit="bpm" min="60" max="220" />

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">RPE (Rate of Perceived Exertion)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <button
                    key={num}
                    onClick={() => handleChange('session_rpe', num)}
                    className={`flex-1 py-2 rounded font-bold transition ${
                      formData.session_rpe === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Section H: Notes for coaching team */}
      <Section title="Notes for coaching team" id="notes">
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Anything else your team should know?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          rows="3"
        />
        <ToggleSwitch label="Flag for coach attention" field="coaching_flag" value={formData.coaching_flag} />
      </Section>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
      >
        {loading ? 'Saving...' : '✓ Save today\'s log'}
      </button>
    </form>
  );
}
