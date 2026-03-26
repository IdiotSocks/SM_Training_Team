import { useState, useEffect } from 'react';

/**
 * TimeInput Component
 * A simple HH:MM time picker for tracking when medications/interventions occur
 *
 * Props:
 * - value: string (HH:MM format, e.g. "06:30")
 * - onChange: function(timeString) - called with HH:MM format
 * - placeholder: string (default: "HH:MM")
 * - disabled: boolean (default: false)
 */
export default function TimeInput({ value, onChange, placeholder = 'HH:MM', disabled = false }) {
  const [input, setInput] = useState(value || '');

  useEffect(() => {
    setInput(value || '');
  }, [value]);

  const handleChange = (e) => {
    let val = e.target.value;

    // Allow only numbers and colon
    val = val.replace(/[^\d:]/g, '');

    // Auto-format: if user types 4 digits, insert colon
    if (val.length === 2 && val.indexOf(':') === -1) {
      val = val + ':';
    }

    // Validate and format
    if (val.length <= 5) {
      setInput(val);

      // Only call onChange if it's a valid time
      if (/^\d{2}:\d{2}$/.test(val)) {
        const [hours, minutes] = val.split(':');
        const h = parseInt(hours);
        const m = parseInt(minutes);

        // Validate hours (0-23) and minutes (0-59)
        if (h >= 0 && h < 24 && m >= 0 && m < 60) {
          onChange(val);
        }
      }
    }
  };

  const handleBlur = () => {
    // If incomplete, clear it
    if (input && !/^\d{2}:\d{2}$/.test(input)) {
      setInput('');
      onChange('');
    }
  };

  return (
    <input
      type="text"
      value={input}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      maxLength="5"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-center"
    />
  );
}
