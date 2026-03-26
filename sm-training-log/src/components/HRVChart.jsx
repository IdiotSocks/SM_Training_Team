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

export default function HRVChart({ data = [] }) {
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
        HRV Trend (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="log_date"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value) => [value ? `${value}ms` : 'N/A', 'HRV']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />

          {/* Reference lines for thresholds */}
          <ReferenceLine
            y={55}
            stroke="#22c55e"
            strokeDasharray="5 5"
            label={{ value: 'Green (55ms)', position: 'right', fill: '#22c55e' }}
          />
          <ReferenceLine
            y={40}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: 'Amber (40ms)', position: 'right', fill: '#f59e0b' }}
          />

          <Line
            type="monotone"
            dataKey="hrv_ms"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="HRV (ms)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
