import { useEffect, useMemo, useState } from "react";
import {
  analyticsData,
  type PlatformAnalytics,
  type PlatformKey,
} from "../data/mockAnalytics";
import { useAnalytics } from "../hooks/useAnalytics";
import { api } from "../lib/api";
import AnalyticsChart from "../components/AnalyticsChart";

const platformKeys: PlatformKey[] = ["TikTok", "YouTube", "Instagram"];

function metricClass(accent: "positive" | "neutral" | "negative") {
  if (accent === "positive") return "text-emerald-300";
  if (accent === "negative") return "text-rose-300";
  return "text-zinc-300";
}

function progressColor(value: number) {
  if (value >= 80) return "from-emerald-400/95 to-lime-400/70";
  if (value >= 60) return "from-emerald-400/80 to-teal-500/50";
  return "from-zinc-600 to-zinc-500";
}

const revenueTracking = {
  revenue: "$14.3K",
  mrr: "$3.4K",
  dealCount: "4 active deals",
  change: "+27%",
};

const subscriptionPlan = {
  name: "Starter",
  price: "$19/mo",
  status: "Trial active",
  nextBilling: "July 1",
  trialDaysRemaining: 30,
};

const agencyPackages = [
  {
    name: "Growth Accelerator",
    details:
      "Cross-platform strategy, sponsorship rollout, and creator ops support.",
  },
  {
    name: "Revenue Booster",
    details: "Branded deals, commission tracking, and payout forecasting.",
  },
];

const captionExample =
  "Boost your next upload with this hook: “The secret behind 10x engagement? It’s not what you think — watch until the end to see the jump!”";

interface DashboardPageProps {
  user?: {
    name: string;
    email: string;
  } | null;
  isOnline?: boolean;
}

const cachedPricingPlans = [
  {
    name: "Starter",
    price: "$19 / mo",
    description: "Best for new creators and launch bundles.",
    features: [
      "30-day free trial",
      "TikTok, YouTube, Instagram basics",
      "Starter revenue tracking",
    ],
  },
  {
    name: "Pro Creator",
    price: "$49 / mo",
    description: "Perfect for mid-tier creators with 10K–500K followers.",
    features: [
      "All analytics, revenue, and agency package support",
      "AI caption suggestions and viral insights",
      "Stripe billing and subscription management",
    ],
  },
];

const offlineTools = [
  "Review locally saved content drafts",
  "Update workspace settings and creator profile notes",
  "Plan hooks, captions, and sponsor ideas until sync resumes",
];

const OfflineDashboard = ({ user }: Pick<DashboardPageProps, "user">) => (
  <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
    <div className="overflow-hidden rounded-[2rem] border border-amber-200/20 bg-zinc-950 p-8 text-white shadow-glow sm:p-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            Offline mode active
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {user
              ? `${user.name}, CreatorScope is ready offline.`
              : "CreatorScope is ready offline."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-300">
            Live chat, provider sign-in, and connected analytics are paused
            because the browser reports no network connection. Your workspace is
            protected with cached pricing, planning tools, and local settings
            access.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
            Chat status
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            Disabled safely
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Reconnect to start new AI chats or sync analytics.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
            Offline tools
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Keep planning without a connection
          </h2>
          <div className="mt-6 space-y-3">
            {offlineTools.map((tool) => (
              <div
                key={tool}
                className="rounded-3xl border border-white/10 bg-zinc-900/80 p-4 text-zinc-200"
              >
                {tool}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                Cached pricing
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Plans available for offline review
              </h2>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-zinc-300">
              Cached locally
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {cachedPricingPlans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-[1.75rem] border border-white/10 bg-zinc-950/80 p-5"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                  {plan.name}
                </p>
                <p className="mt-4 text-3xl font-semibold">{plan.price}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {plan.description}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-zinc-300">
                  {plan.features.map((feature) => (
                    <li key={feature}>✔ {feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  </div>
);

const DashboardPage = ({ user, isOnline = true }: DashboardPageProps) => {
  const [platform, setPlatform] = useState<PlatformKey>("TikTok");
  const { data, isLoading, error } = useAnalytics(platform);
  const platformData: PlatformAnalytics = data ?? analyticsData[platform];
  const [liveRevenue] = useState(revenueTracking);
  const [channel, setChannel] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const maxTrend = useMemo(
    () => Math.max(...platformData.trend.map((point) => point.value)),
    [platformData.trend],
  );
  const maxGrowth = useMemo(
    () => Math.max(...platformData.growth.map((item) => item.value)),
    [platformData.growth],
  );

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const loadData = async () => {
      try {
        const analytics = await api.get("/youtube/analytics");
        const historyData = await api.get("/youtube/history");

        setChannel(analytics.data.data);
        setHistory(historyData.data.snapshots);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [isOnline]);

  if (!isOnline) {
    return <OfflineDashboard user={user} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              Multi-platform creator analytics
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {user ? `Welcome back, ${user.name}` : "CreatorScope Dashboard"}
              </h1>
              <p className="mt-3 max-w-2xl text-zinc-300">
                TikTok, YouTube, and Instagram analytics fused into a single
                command center. Launch your product now with cross-channel
                momentum, strategy triggers, and audience growth forecasts.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-zinc-950/80 p-4 shadow-xl shadow-emerald-500/10 ring-1 ring-white/5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
              Momentum Score
            </p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {platformData.score}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Out of 100, powered by Creator DNA and trend velocity.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-emerald-400/10 bg-zinc-950/90 p-5 text-zinc-200 ring-1 ring-emerald-400/20">
            Loading analytics for {platform}...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-3xl border border-rose-400/10 bg-zinc-950/90 p-5 text-rose-300 ring-1 ring-rose-400/20">
            Unable to load analytics yet. The dashboard will use fallback data
            while the API is connected.
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-sm shadow-emerald-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                YouTube channel
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {channel?.channelName ?? "Connected YouTube channel"}
              </h2>
            </div>
            <p className="rounded-full bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
              Total Snapshots: {history.length}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                Subscribers
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {channel?.subscribers ?? "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                Total views
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {channel?.totalViews ?? "—"}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                Total videos
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {channel?.totalVideos ?? "—"}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <AnalyticsChart data={history} />
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] bg-zinc-950/90 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                Platform
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {platform} Overview
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {platformKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${key === platform ? "bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformData.kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-sm shadow-emerald-500/5"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                  {item.label}
                </p>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {item.value}
                </p>
                <p
                  className={`mt-3 text-sm font-medium ${metricClass(item.accent)}`}
                >
                  {item.change}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    Views over time
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Weekly engagement curve
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-300">
                  Live simulation
                </span>
              </div>
              <div className="mt-8 h-60 overflow-hidden rounded-3xl bg-zinc-900 p-4">
                <svg viewBox="0 0 360 160" className="h-full w-full">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#84cc16" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    points={platformData.trend
                      .map((point, index) => {
                        const x = 40 + index * 44;
                        const y = 140 - (point.value / maxTrend) * 110;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                  {platformData.trend.map((point, index) => {
                    const x = 40 + index * 44;
                    const y = 140 - (point.value / maxTrend) * 110;
                    return (
                      <circle
                        key={point.label}
                        cx={x}
                        cy={y}
                        r={4}
                        fill="#10b981"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                  Engagement mix
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {platformData.mix.map((item) => {
                    const circumference = 2 * Math.PI * 26;
                    const dash = `${(item.value / 100) * circumference} ${circumference}`;
                    return (
                      <div
                        key={item.label}
                        className="rounded-3xl bg-zinc-950/90 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <svg width="72" height="72" viewBox="0 0 72 72">
                            <circle
                              cx="36"
                              cy="36"
                              r="26"
                              fill="none"
                              stroke="rgba(255,255,255,0.06)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="36"
                              cy="36"
                              r="26"
                              fill="none"
                              stroke={item.color}
                              strokeWidth="10"
                              strokeDasharray={dash}
                              strokeLinecap="round"
                              transform="rotate(-90 36 36)"
                            />
                          </svg>
                          <div>
                            <p className="text-base font-semibold text-white">
                              {item.label}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {item.value}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                  Growth funnel
                </p>
                <div className="mt-6 space-y-4">
                  {platformData.growth.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${progressColor(item.value)}`}
                          style={{
                            width: `${(item.value / maxGrowth) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    Revenue tracking
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Creator earnings overview
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
                  Stripe ready
                </span>
              </div>
              <div className="mt-8 space-y-4 text-white">
                <div className="rounded-3xl bg-zinc-900/90 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                    This period
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {liveRevenue.revenue}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {liveRevenue.dealCount} · {liveRevenue.change} vs last month
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-zinc-900/90 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                      MRR
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {liveRevenue.mrr}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-900/90 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                      Deals live
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {liveRevenue.dealCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    Subscription plan
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Creator package status
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  Trial
                </span>
              </div>
              <div className="mt-8 space-y-4 text-white">
                <div className="rounded-3xl bg-zinc-900/90 p-4">
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                    Plan
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {subscriptionPlan.name}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {subscriptionPlan.price}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-zinc-900/90 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                      Status
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {subscriptionPlan.status}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-zinc-900/90 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                      Next billing
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {subscriptionPlan.nextBilling}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    Agency package system
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Sell creator services
                  </p>
                </div>
                <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-lime-200">
                  Agency ready
                </span>
              </div>
              <div className="mt-8 space-y-4">
                {agencyPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="rounded-3xl bg-zinc-900/90 p-4"
                  >
                    <p className="font-semibold text-white">{pkg.name}</p>
                    <p className="mt-2 text-sm text-zinc-400">{pkg.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    AI caption generator
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Copy built for engagement
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  Draft
                </span>
              </div>
              <div className="mt-8 rounded-3xl bg-zinc-900/90 p-5 text-sm leading-7 text-zinc-300">
                {captionExample}
              </div>
            </div>
          </div>

          <section className="mt-10 rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-sm shadow-emerald-500/5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                  Content strategy insights
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  AI growth bullets built for creators
                </h2>
              </div>
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-zinc-300">
                Ready to ship as your app core
              </span>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {platformData.insights.map((insight) => (
                <div
                  key={insight}
                  className="rounded-3xl border border-white/5 bg-zinc-950/90 p-5 text-sm leading-7 text-zinc-300 shadow-inner shadow-zinc-950/30"
                >
                  {insight}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
