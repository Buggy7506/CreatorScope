import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Props = {
  data: any[];
};

export default function AnalyticsChart({
  data,
}: Props) {
  const formatted = data.map((item) => ({
    date: new Date(item.snapshotDate).toLocaleDateString(),
    subscribers: item.subscribers,
    views: item.totalViews,
    likes: item.totalLikes, // New metric
    comments: item.totalComments, // New metric
  }));

  return (
    <div
      style={{
        width: '100%',
        height: 500,
        background: '#1e293b',
        padding: 20,
        borderRadius: 16,
        color: '#e2e8f0',
      }}
    >
      <ResponsiveContainer>
        <LineChart data={formatted} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#e2e8f0" />
          <YAxis stroke="#e2e8f0" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }} />
          <Legend wrapperStyle={{ color: '#e2e8f0' }} />
          <Line type="monotone" dataKey="subscribers" stroke="#22d3ee" strokeWidth={2} />
          <Line type="monotone" dataKey="views" stroke="#a78bfa" strokeWidth={2} />
          <Line type="monotone" dataKey="likes" stroke="#34d399" strokeWidth={2} />
          <Line type="monotone" dataKey="comments" stroke="#f87171" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
