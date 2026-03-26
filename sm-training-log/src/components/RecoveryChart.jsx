import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

export default function RecoveryChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
        <p className="text-gray-500">No data available yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recovery % Trend (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="log_date"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => [value ? `${value}%` : 'N/A', 'Recovery']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />

          {/* Reference lines for thresholds */}
          <ReferenceLine
            y={70}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{ value: 'Green (70%)', position: 'right', fill: '#22c55e' }}
          />
          <ReferenceLine
            y={50}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: 'Amber (50%)', position: 'right', fill: '#f59e0b' }}
          />

          <Line
            type="monotone"
            dataKey="recovery_pct"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Recovery %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
