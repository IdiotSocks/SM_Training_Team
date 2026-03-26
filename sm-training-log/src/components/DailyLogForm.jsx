import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import TimeInput from './TimeInput';
import {
  FEEL_EMOJIS,
  ALCOHOL_OPTIONS,
  RECOVERY_MODALITIES,
  SUPPLEMENTS,
  INHALERS,
} from '../lib/constants';

export default function DailyLogForm({ userId, onSubmit, initialData = null }) {
  const today = new Date().toISOString().split('T')[0];

  // Form state
  const [formData, setFormData] = useState({
    log_date: today,
    feel_overall: 3,
    feel_legs: 3,
    feel_breathing: 3,
    feel_motivation: 3,
    inhaler_am: false,
    inhaler_am_time: '',
    inhaler_pm: false,
    inhaler_pm_time: '',
    inhaler_prerace: false,
    inhaler_prerace_time: '',
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
    coaching_notes: '',
  });

  const [expandedSections, setExpandedSections] = useState({
    feel: true,
    medication: false,
    lifestyle: false,
    recovery: false,
    supplements: false,
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
            inhaler_brown_am: formData.inhaler_am || false,
            inhaler_brown_am_time: formData.inhaler_am_time || null,
            inhaler_brown_pm: formData.inhaler_pm || false,
            inhaler_brown_pm_time: formData.inhaler_pm_time || null,
            inhaler_blue_prerace: formData.inhaler_prerace || false,
            inhaler_blue_prerace_time: formData.inhaler_prerace_time || null,
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
            notes: formData.coaching_notes || null,
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

      {/* Section B: Medication */}
      <Section title="Medication" id="medication">
        {/* Brown AM Inhaler */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <ToggleSwitch
            label="Brown inhaler (AM)"
            field="inhaler_am"
            value={formData.inhaler_am}
          />
          {formData.inhaler_am && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Time taken
              </label>
              <TimeInput
                value={formData.inhaler_am_time}
                onChange={(time) => handleChange('inhaler_am_time', time)}
                placeholder="06:30"
              />
            </div>
          )}
        </div>

        {/* Brown PM Inhaler */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <ToggleSwitch
            label="Brown inhaler (PM)"
            field="inhaler_pm"
            value={formData.inhaler_pm}
          />
          {formData.inhaler_pm && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Time taken
              </label>
              <TimeInput
                value={formData.inhaler_pm_time}
                onChange={(time) => handleChange('inhaler_pm_time', time)}
                placeholder="18:00"
              />
            </div>
          )}
        </div>

        {/* Blue Pre-race Inhaler */}
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <ToggleSwitch
            label="Blue inhaler (pre-race/session)"
            field="inhaler_prerace"
            value={formData.inhaler_prerace}
          />
          {formData.inhaler_prerace && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Time taken
              </label>
              <TimeInput
                value={formData.inhaler_prerace_time}
                onChange={(time) => handleChange('inhaler_prerace_time', time)}
                placeholder="09:15"
              />
            </div>
          )}
        </div>

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

      {/* Section F: Notes */}
      <Section title="Notes" id="notes">
        <textarea
          value={formData.coaching_notes}
          onChange={(e) => handleChange('coaching_notes', e.target.value)}
          placeholder="Anything else to note about today?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
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
