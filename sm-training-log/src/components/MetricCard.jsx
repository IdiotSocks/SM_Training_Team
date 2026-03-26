import StatusBadge from './StatusBadge';

export default function MetricCard({
  title,
  value,
  unit,
  status,
  trend,
  lastValue,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {trend && (
          <span className="text-xl font-bold text-gray-400">
            {trend}
          </span>
        )}
      </div>

      <div className="mb-3">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900">
          {value}
          <span className="text-lg text-gray-500 ml-1">{unit}</span>
        </p>
      </div>

      {status && (
        <StatusBadge
          label={status.label}
          bg={status.bg}
          text={status.text}
          size="sm"
        />
      )}

      {lastValue !== undefined && lastValue !== null && (
        <p className="text-xs text-gray-500 mt-2">
          Previous: {lastValue}{unit}
        </p>
      )}
    </div>
  );
}
