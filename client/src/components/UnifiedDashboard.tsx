import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, DollarSign, Eye, Sparkles, Users } from "lucide-react";

const performanceData = [
  { date: "Mon", YouTube: 74000, TikTok: 95000, Instagram: 85000, earnings: 1800 },
  { date: "Tue", YouTube: 82000, TikTok: 115000, Instagram: 92000, earnings: 2100 },
  { date: "Wed", YouTube: 98000, TikTok: 128000, Instagram: 108000, earnings: 2400 },
  { date: "Thu", YouTube: 105000, TikTok: 140000, Instagram: 120000, earnings: 2600 },
  { date: "Fri", YouTube: 118000, TikTok: 160000, Instagram: 132000, earnings: 3100 },
  { date: "Sat", YouTube: 126000, TikTok: 148000, Instagram: 128000, earnings: 2900 },
  { date: "Sun", YouTube: 142000, TikTok: 170000, Instagram: 148000, earnings: 3400 },
];

const kpis = [
  {
    label: "Total Views",
    value: "1.88M",
    delta: "+21.4%",
    detail: "YouTube, TikTok, Instagram",
    icon: Eye,
  },
  {
    label: "Total Followers",
    value: "432.8K",
    delta: "+31.0% g(t)",
    detail: "P₀e^(rt) growth model",
    icon: Users,
  },
  {
    label: "Total Earnings",
    value: "$14.3K",
    delta: "+$3.4K MRR",
    detail: "Brand deals + platform RPM",
    icon: DollarSign,
  },
];

const suggestions = [
  "Best posting window: TikTok 7–10 PM, YouTube 6 PM, Instagram Reels 8 PM.",
  "Thumbnail tests favor emerald/yellow contrast for +8% projected CTR.",
  "Hook retention drops after 2.7s; move the payoff into the first sentence.",
];

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(value);

export default function UnifiedDashboard() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {kpis.map(({ label, value, delta, detail, icon: Icon }) => (
          <article
            key={label}
            className="rounded-[1.75rem] border border-emerald-900/10 bg-white/80 p-5 shadow-[0_24px_70px_rgba(17,45,30,0.08)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {label}
                </p>
                <p className="mt-3 text-4xl font-black text-zinc-950">{value}</p>
              </div>
              <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Icon size={22} />
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 font-bold text-white">
                <ArrowUpRight size={15} /> {delta}
              </span>
              <span className="text-right text-zinc-500">{detail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <article className="rounded-[2rem] border border-emerald-900/10 bg-zinc-950 p-6 text-white shadow-glow">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Cross-platform performance
              </p>
              <h2 className="mt-2 text-2xl font-black">Views and monetization velocity</h2>
            </div>
            <p className="text-sm text-zinc-400">Last 7 days · normalized by UTC publish day</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="yt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="tt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="date" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" tickFormatter={formatCompact} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number, name) => [name === "earnings" ? `$${value}` : formatCompact(value), name]}
                  contentStyle={{ background: "#101810", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18 }}
                />
                <Legend />
                <Area type="monotone" dataKey="YouTube" stroke="#ef4444" fill="url(#yt)" strokeWidth={3} />
                <Area type="monotone" dataKey="TikTok" stroke="#22d3ee" fill="url(#tt)" strokeWidth={3} />
                <Area type="monotone" dataKey="Instagram" stroke="#c084fc" fill="url(#ig)" strokeWidth={3} />
                <Line type="monotone" dataKey="earnings" stroke="#a3e635" strokeWidth={3} dot={false} yAxisId={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/80 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-zinc-950 p-3 text-lime-300">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                AI optimization
              </p>
              <h2 className="text-xl font-black text-zinc-950">CreatorScope advantage</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-emerald-900/10 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-zinc-700">
                {suggestion}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">Predictive ROI</p>
            <p className="mt-2 text-3xl font-black">3.7x</p>
            <p className="mt-2 text-sm text-zinc-300">
              Forecasted brand-deal return using blended CPM, overlap-adjusted reach, and historical retention.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
