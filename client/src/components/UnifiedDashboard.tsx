import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  DollarSign,
  Eye,
  Layers3,
  Sparkles,
  Users,
} from "lucide-react";
import {
  emptyUnifiedAnalytics,
  type EnterpriseModule,
  type UnifiedAnalytics,
} from "../types/analytics";

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(value);

const formatCurrency = (cents: number | null) =>
  cents === null
    ? "Awaiting data"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(cents / 100);

const formatMetric = (value: number | null, suffix = "") =>
  value === null ? "Awaiting data" : `${formatCompact(value)}${suffix}`;

const defaultModules: EnterpriseModule[] = [
  {
    id: "research-trend-intelligence",
    title: "Research & Trend Intelligence Engine",
    description:
      "Cross-platform semantic gap analysis, AI search intent mapping, competitor velocity tracking, and content blueprint generation.",
    dataSources: ["YouTube", "TikTok", "Instagram", "Reddit", "Forums"],
    capabilities: [
      "High-demand / low-supply opportunity scoring",
      "Informational, transactional, entertainment, community, and commercial-investigation intent labels",
      "Competitor upload velocity anomaly alerts",
    ],
    status: "awaiting_data",
  },
  {
    id: "live-command-center",
    title: "Omni-Channel Live Command Center",
    description:
      "Real-time creator operations with live view velocity, watch-time velocity, baseline variance, outlier detection, and health scoring.",
    dataSources: ["YouTube", "TikTok", "Instagram", "Redis Streams"],
    capabilities: [
      "Top 5% upload alerts",
      "Traffic source surge attribution",
      "Unified creator equity index",
    ],
    status: "awaiting_data",
  },
  {
    id: "hook-retention-intelligence",
    title: "Advanced Hook & Retention Intelligence",
    description:
      "Behavioral diagnostics for structural drop-offs, intros, ad breaks, CTAs, end screens, and session watch-time optimization.",
    dataSources: ["YouTube Long Form", "YouTube Shorts", "TikTok", "Instagram Reels"],
    capabilities: [
      "Retention comparison engine",
      "End screen conversion predictor",
      "Recommended next video engine",
    ],
    status: "awaiting_data",
  },
  {
    id: "audience-psychographics",
    title: "Deep Audience Psychographic Intelligence",
    description:
      "Cohort, affinity, attendance, community interest, and niche discovery models beyond basic demographics.",
    dataSources: ["Channels", "Communities", "Forums", "Reddit", "Cultural trends"],
    capabilities: [
      "Platform attendance heatmaps",
      "Cross-platform activity matrices",
      "Content affinity graph",
    ],
    status: "awaiting_data",
  },
  {
    id: "monetization-arbitrage",
    title: "Monetization Arbitrage Engine",
    description:
      "Institutional-grade RPM, CPM, sponsorship, AdSense, membership, Super Chat, sticker, and live revenue analytics.",
    dataSources: ["YouTube", "Stripe", "AdSense", "Sponsorship CRM"],
    capabilities: [
      "Geographic revenue optimization",
      "Device and category revenue analysis",
      "Live stream revenue timeline analysis",
    ],
    status: "awaiting_data",
  },
  {
    id: "traffic-algorithm-discovery",
    title: "Traffic Attribution & Algorithm Discovery",
    description:
      "Distribution mapping for browse, suggested video propagation, recommendation waves, external referrers, and dark social.",
    dataSources: ["YouTube", "Reddit", "Discord", "Slack", "WhatsApp", "Direct"],
    capabilities: [
      "Recommendation wave detection",
      "External and dark social attribution",
      "Conversion velocity modeling",
    ],
    status: "awaiting_data",
  },
];

type Props = {
  analytics?: UnifiedAnalytics;
};

export default function UnifiedDashboard({ analytics = emptyUnifiedAnalytics }: Props) {
  const modules = analytics.modules.length ? analytics.modules : defaultModules;
  const hasPerformanceData = analytics.performance.length > 0;
  const kpis = [
    {
      label: "Total Views",
      value: formatMetric(analytics.totals.totalViews),
      detail: "YouTube, TikTok, Instagram",
      icon: Eye,
    },
    {
      label: "Total Followers",
      value: formatMetric(analytics.totals.totalFollowers),
      detail: "Unified audience graph",
      icon: Users,
    },
    {
      label: "Creator Health",
      value:
        analytics.totals.creatorHealthScore === null
          ? "Awaiting data"
          : `${analytics.totals.creatorHealthScore}/100`,
      detail: "Equity, retention, revenue, velocity",
      icon: Activity,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {kpis.map(({ label, value, detail, icon: Icon }) => (
          <article
            key={label}
            className="rounded-[1.75rem] border border-emerald-900/10 bg-white/80 p-5 shadow-[0_24px_70px_rgba(17,45,30,0.08)] backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-black text-zinc-950">{value}</p>
              </div>
              <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Icon size={22} />
              </span>
            </div>
            <p className="mt-5 text-sm text-zinc-500">{detail}</p>
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
            <p className="text-sm text-zinc-400">Reserved for real connected platform data</p>
          </div>

          <div className="h-80 rounded-3xl border border-white/10 bg-white/[0.03]">
            {hasPerformanceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.performance} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <Layers3 className="text-emerald-300" size={36} />
                <p className="mt-4 text-lg font-bold">No synthetic performance data</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                  Connect YouTube, TikTok, Instagram, AdSense, and sponsorship systems to populate this real-time velocity matrix.
                </p>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-emerald-900/10 bg-white/90 p-6 shadow-[0_24px_70px_rgba(17,45,30,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Revenue forecast
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-950">Monetization arbitrage</h2>
            </div>
            <span className="rounded-2xl bg-lime-100 p-3 text-emerald-700">
              <DollarSign size={22} />
            </span>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-zinc-950 p-5 text-white">
              <p className="text-sm text-zinc-400">Next 30 days</p>
              <p className="mt-2 text-3xl font-black">
                {formatCurrency(analytics.predictiveEarnings.next30DaysCents)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Brand ROI</p>
                <p className="mt-2 text-xl font-black text-zinc-950">
                  {analytics.predictiveEarnings.brandDealRoi ?? "Awaiting data"}
                </p>
              </div>
              <div className="rounded-3xl border border-zinc-200 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CPM blend</p>
                <p className="mt-2 text-xl font-black text-zinc-950">
                  {analytics.predictiveEarnings.cpmBlend ?? "Awaiting data"}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Enterprise analytics layers
            </p>
            <h2 className="mt-2 text-2xl font-black">YouTube Studio Analytics upgraded to CreatorScope OS</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 ring-1 ring-emerald-300/20">
            <BrainCircuit size={16} /> AI-ready schema, awaiting ingestion
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {modules.map((module) => (
            <article key={module.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">{module.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{module.description}</p>
                </div>
                <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                  {module.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {module.dataSources.map((source) => (
                  <span key={source} className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                    {source}
                  </span>
                ))}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                {module.capabilities.map((capability) => (
                  <li key={capability} className="flex gap-2">
                    <Sparkles className="mt-0.5 flex-none text-emerald-300" size={15} />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-amber-300/20 bg-amber-50 p-6 text-amber-950">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} />
            <h3 className="text-xl font-black">Anomaly alerts</h3>
          </div>
          {analytics.alerts.length ? (
            <ul className="mt-4 space-y-3">
              {analytics.alerts.map((alert) => (
                <li key={alert} className="rounded-2xl bg-white/70 p-4 text-sm font-semibold">
                  {alert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-amber-900/70">
              Alert space is ready. Real upload velocity, traffic source, retention, revenue, and competitor events will appear here after ingestion.
            </p>
          )}
        </article>

        <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-50 p-6 text-emerald-950">
          <div className="flex items-center gap-3">
            <Sparkles size={22} />
            <h3 className="text-xl font-black">AI recommendations</h3>
          </div>
          {analytics.aiSuggestions.length ? (
            <ul className="mt-4 space-y-3">
              {analytics.aiSuggestions.map((suggestion) => (
                <li key={suggestion} className="rounded-2xl bg-white/70 p-4 text-sm font-semibold">
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-emerald-900/70">
              AI insight slots are intentionally empty until real creator, content, audience, trend, and revenue signals are connected.
            </p>
          )}
        </article>
      </section>
    </section>
  );
}
