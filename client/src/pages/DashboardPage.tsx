import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Database, GitBranch, RadioTower, ShieldCheck } from "lucide-react";
import AnalyticsChart from "../components/AnalyticsChart";
import UnifiedDashboard from "../components/UnifiedDashboard";
import { useAnalytics } from "../hooks/useAnalytics";
import { api } from "../lib/api";
import {
  emptyUnifiedAnalytics,
  platformKeys,
  type PlatformAnalytics,
  type PlatformKey,
  type UnifiedAnalytics,
} from "../types/analytics";

function metricClass(accent: "positive" | "neutral" | "negative" = "neutral") {
  if (accent === "positive") return "text-emerald-300";
  if (accent === "negative") return "text-rose-300";
  return "text-zinc-300";
}

function progressColor(value: number) {
  if (value >= 80) return "from-emerald-400/95 to-lime-400/70";
  if (value >= 60) return "from-emerald-400/80 to-teal-500/50";
  return "from-zinc-600 to-zinc-500";
}

interface DashboardPageProps {
  user?: {
    name: string;
    email: string;
  } | null;
  isOnline?: boolean;
  section?: WorkspaceSectionKey;
}

type YouTubeStudioPoint = {
  day?: string;
  views?: number;
  estimatedMinutesWatched?: number;
  averageViewDuration?: number;
  subscribersGained?: number;
  likes?: number;
  comments?: number;
  shares?: number;
};

type YouTubeChannel = {
  channelName?: string;
  subscribers?: string;
  totalViews?: string;
  totalVideos?: string;
  studioAnalytics?: YouTubeStudioPoint[];
  studioAnalyticsError?: string | null;
};

const offlineTools = [
  "Review locally saved content drafts",
  "Update workspace settings and creator profile notes",
  "Plan hooks, captions, and sponsor ideas until sync resumes",
];

const enterpriseBlueprints = [
  {
    icon: Database,
    title: "Analytics warehouse",
    detail:
      "PostgreSQL + TimescaleDB hypertables, materialized rollups, partitioned event tables, and cross-platform correlation facts.",
  },
  {
    icon: RadioTower,
    title: "Realtime event mesh",
    detail:
      "WebSockets, Server-Sent Events, Redis Streams, anomaly fan-out, live velocity baselines, and upload surge notifications.",
  },
  {
    icon: BrainCircuit,
    title: "AI prediction layer",
    detail:
      "Forecasting, virality, retention, recommendation, psychographic clustering, and monetization arbitrage models.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise governance",
    detail:
      "Multi-tenant creator workspaces, RBAC, platform-token vaulting, audit logs, rate-limit protection, and data residency controls.",
  },
];


const workspaceSections = {
  overview: {
    title: "Overview command center",
    eyebrow: "Overview",
    body: "Unified creator health, cross-platform KPIs, alerts, and next-best actions for daily growth decisions.",
    features: ["Creator health score", "Platform comparison", "AI action queue", "Sync status"],
    workflow: [
      "Review cross-platform sync health before campaign decisions.",
      "Prioritize the highest-impact growth lane from alerts, revenue, and retention signals.",
      "Convert AI recommendations into weekly experiments with owners and deadlines.",
    ],
    panels: [
      { label: "Daily command brief", value: "Health, alerts, blockers", detail: "Summarizes ingestion status, platform momentum, and action readiness." },
      { label: "Platform control", value: "YouTube · TikTok · Instagram", detail: "Switch platform contracts without leaving the overview workspace." },
      { label: "Operating cadence", value: "Daily / weekly / monthly", detail: "Keeps tactical checks separate from strategic creator growth reviews." },
    ],
    actions: ["Connect missing data sources", "Audit stale integrations", "Review top growth experiments"],
  },
  audience: {
    title: "Audience intelligence",
    eyebrow: "Audience",
    body: "Follower growth, affinity clusters, attendance windows, demographic quality, and overlap between TikTok, Instagram, and YouTube.",
    features: ["Audience overlap", "Psychographic cohorts", "Activity heatmaps", "Retention segments"],
    workflow: [
      "Map each platform's active audience windows and recurring topic affinities.",
      "Segment first-time viewers, returning fans, loyal subscribers, and sponsor-ready cohorts.",
      "Use overlap gaps to decide which content should be repackaged for another platform.",
    ],
    panels: [
      { label: "Cohort model", value: "Psychographic + behavioral", detail: "Prepares segments for interests, intent, attendance, and creator affinity scoring." },
      { label: "Attendance windows", value: "Heatmap-ready", detail: "Reserved for platform-native active time, live attendance, and replay behavior." },
      { label: "Audience quality", value: "Retention-weighted", detail: "Ranks followers by depth of engagement instead of vanity reach alone." },
    ],
    actions: ["Define creator personas", "Find overlap gaps", "Plan cohort-specific hooks"],
  },
  content: {
    title: "Content history",
    eyebrow: "Content History",
    body: "A searchable history for posts, videos, reels, shorts, snapshots, publishing cadence, and performance baselines.",
    features: ["Upload archive", "Snapshot charting", "Format breakdown", "Historical baselines"],
    workflow: [
      "Capture every upload, short, reel, livestream, and sponsor asset in one canonical archive.",
      "Compare performance by format, topic, hook pattern, length, and publishing window.",
      "Promote winning assets into reusable playbooks and flag weak segments for refreshes.",
    ],
    panels: [
      { label: "Asset library", value: "Search + filter ready", detail: "Designed for titles, platform IDs, content types, campaigns, and canonical groups." },
      { label: "Performance baseline", value: "Variance tracking", detail: "Compares each upload against historical medians once snapshots exist." },
      { label: "Creative QA", value: "Hook · CTA · retention", detail: "Keeps structural diagnostics close to the content history timeline." },
    ],
    actions: ["Create a YouTube snapshot", "Tag content pillars", "Review underperforming assets"],
  },
  revenue: {
    title: "Revenue cockpit",
    eyebrow: "Revenue",
    body: "Subscriptions, sponsorships, AdSense, affiliate, commerce, memberships, RPM, CPM, and future earnings forecasts.",
    features: ["Revenue mix", "Brand deal ledger", "Predictive earnings", "Billing health"],
    workflow: [
      "Unify AdSense, sponsorship, membership, affiliate, and commerce revenue into one ledger.",
      "Compare RPM, CPM, category, geography, device, and content format for monetization arbitrage.",
      "Forecast creator runway and identify sponsor packages with the best margin potential.",
    ],
    panels: [
      { label: "Monetization ledger", value: "Multi-source", detail: "Separates creator earnings from CreatorScope subscription billing." },
      { label: "Deal operations", value: "Sponsor pipeline", detail: "Tracks package status, deliverables, renewal dates, and projected payout." },
      { label: "Forecasting", value: "Runway + upside", detail: "Prepares revenue predictions once connected payment and platform data exist." },
    ],
    actions: ["Open billing settings", "Review sponsorship pipeline", "Connect revenue feeds"],
  },
};

type WorkspaceSectionKey = keyof typeof workspaceSections;

const platformContracts: Record<PlatformKey, string[]> = {
  YouTube: [
    "Views, watch time, average view duration, impressions, CTR, likes, comments, shares, subscribers gained/lost",
    "Audience retention, key moments, ad break drops, end screen conversion, traffic sources, browse, suggested, search, external",
    "Estimated revenue, RPM, CPM, AdSense attribution, memberships, Super Chat, Super Stickers, live timeline revenue",
  ],
  TikTok: [
    "Video views, completion rate, average watch time, shares, comments, likes, saves, profile actions, follower deltas",
    "Sound velocity, hashtag lift, For You distribution, retention curves, creator competitor velocity, trend semantic gaps",
    "Spark Ads, commerce attribution, sponsorship revenue, cohort engagement, cross-post conversion velocity",
  ],
  Instagram: [
    "Reach, impressions, reel plays, completion, saves, shares, comments, profile visits, story taps, follower growth",
    "Explore distribution, reel audio trends, audience attendance heatmaps, affinity clusters, community interest mapping",
    "Brand deal ledger, affiliate attribution, DM conversion, category RPM proxy, creator business reporting",
  ],
};

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
            because the browser reports no network connection. Real analytics
            remain empty until platform ingestion resumes.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
            Data status
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">
            Ingestion paused
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Reconnect to sync YouTube, TikTok, Instagram, revenue, and audience feeds.
          </p>
        </div>
      </div>

      <section className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
          Offline tools
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          Keep planning without a connection
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
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
    </div>
  </div>
);

const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
    <p className="text-lg font-semibold text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400">{body}</p>
  </div>
);

const WorkspaceSectionDetail = ({
  section,
}: {
  section: (typeof workspaceSections)[WorkspaceSectionKey];
}) => (
  <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
        Professional workflow
      </p>
      <ol className="mt-5 space-y-4">
        {section.workflow.map((item, index) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-emerald-400 text-xs font-black text-zinc-950">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {section.panels.map((panel) => (
        <article
          key={panel.label}
          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {panel.label}
          </p>
          <p className="mt-3 text-lg font-semibold text-white">{panel.value}</p>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{panel.detail}</p>
        </article>
      ))}
    </div>

    <div className="xl:col-span-2 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.06] p-5">
      <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
        Action queue
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {section.actions.map((action) => (
          <span
            key={action}
            className="rounded-full border border-emerald-300/20 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-emerald-100"
          >
            {action}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const DashboardPage = ({ user, isOnline = true, section = "overview" }: DashboardPageProps) => {
  const activeSection = workspaceSections[section] ?? workspaceSections.overview;
  const [platform, setPlatform] = useState<PlatformKey>("YouTube");
  const { data: platformData, isLoading, error } = useAnalytics(platform);
  const [unifiedAnalytics, setUnifiedAnalytics] = useState<UnifiedAnalytics>(emptyUnifiedAnalytics);
  const [unifiedError, setUnifiedError] = useState<unknown>(null);
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const hasTrendData = platformData.trend.length > 0;
  const hasGrowthData = platformData.growth.length > 0;
  const hasMixData = platformData.mix.length > 0;
  const maxTrend = useMemo(
    () => Math.max(1, ...platformData.trend.map((point) => point.value)),
    [platformData.trend],
  );
  const maxGrowth = useMemo(
    () => Math.max(1, ...platformData.growth.map((item) => item.value)),
    [platformData.growth],
  );

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const loadData = async () => {
      try {
        setUnifiedError(null);
        const [unified, analytics, historyData] = await Promise.all([
          api.get<UnifiedAnalytics>("/analytics/unified"),
          api.get("/youtube/analytics").catch(() => null),
          api.get("/youtube/history").catch(() => null),
        ]);

        setUnifiedAnalytics({ ...emptyUnifiedAnalytics, ...unified.data });
        setChannel(analytics?.data?.data ?? null);
        setHistory(historyData?.data?.snapshots ?? []);
      } catch (loadError) {
        setUnifiedError(loadError);
        setUnifiedAnalytics(emptyUnifiedAnalytics);
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
              Enterprise creator intelligence platform
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {user ? `Welcome back, ${user.name}` : "CreatorScope Dashboard"}
              </h1>
              <p className="mt-3 max-w-3xl text-zinc-300">
                A real-data-only operating system for YouTube Studio Analytics,
                TikTok, Instagram, revenue, audience psychographics, trend
                discovery, traffic attribution, and AI forecasting. No mock
                metrics are rendered; empty panels reserve space for connected data.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-zinc-950/80 p-4 shadow-xl shadow-emerald-500/10 ring-1 ring-white/5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
              Ingestion mode
            </p>
            <p className="mt-3 text-2xl font-semibold text-white">
              Real data only
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Mock data removed from dashboard surfaces
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-emerald-400/10 bg-zinc-950/90 p-5 text-zinc-200 ring-1 ring-emerald-400/20">
            Loading analytics contract for {platform}...
          </div>
        ) : error || unifiedError ? (
          <div className="mt-8 rounded-3xl border border-amber-400/10 bg-zinc-950/90 p-5 text-amber-200 ring-1 ring-amber-400/20">
            Some connected analytics APIs are not available yet. CreatorScope is
            showing real-data placeholders instead of fabricated metrics.
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-sm shadow-emerald-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                YouTube channel
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {channel?.channelName ?? "Connect a YouTube channel"}
              </h2>
            </div>
            <p className="rounded-full bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300">
              Total Snapshots: {history.length}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Subscribers", channel?.subscribers],
              ["Total views", channel?.totalViews],
              ["Total videos", channel?.totalVideos],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{value ?? "—"}</p>
              </div>
            ))}
          </div>

          {channel?.studioAnalytics?.length ? (
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
              <div className="grid grid-cols-4 gap-3 bg-zinc-900 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                <span>Date</span>
                <span>Views</span>
                <span>Watch minutes</span>
                <span>Subscribers gained</span>
              </div>
              {channel.studioAnalytics.slice(-7).map((point) => (
                <div key={point.day} className="grid grid-cols-4 gap-3 border-t border-white/10 px-5 py-3 text-sm text-zinc-200">
                  <span>{point.day}</span>
                  <span>{point.views ?? "—"}</span>
                  <span>{point.estimatedMinutesWatched ?? "—"}</span>
                  <span>{point.subscribersGained ?? "—"}</span>
                </div>
              ))}
            </div>
          ) : channel?.studioAnalyticsError ? (
            <p className="mt-8 rounded-3xl border border-amber-400/10 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100">
              {channel.studioAnalyticsError}
            </p>
          ) : null}

          <div className="mt-10">
            {history.length ? (
              <AnalyticsChart data={history} />
            ) : (
              <EmptyState
                title="No YouTube snapshot history yet"
                body="Create snapshots from connected YouTube channel data to activate historical baseline comparison, variance visualization, and velocity forecasting."
              />
            )}
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-zinc-950/90 p-6 shadow-sm shadow-emerald-500/5" id={section}>
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">{activeSection.eyebrow}</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-white">{activeSection.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{activeSection.body}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSection.features.map((feature) => (
                <div key={feature} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-zinc-200">
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <WorkspaceSectionDetail section={activeSection} />
        </section>

        <div className="mt-10">
          <UnifiedDashboard analytics={unifiedAnalytics} />
        </div>

        <div className="mt-10 rounded-[2rem] bg-zinc-950/90 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                Platform contracts
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {platform} real-data ingestion surface
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

          <div className="mt-6 grid gap-3">
            {platformContracts[platform].map((contract) => (
              <div key={contract} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">
                <GitBranch className="mt-0.5 flex-none text-emerald-300" size={18} />
                <span>{contract}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformData.kpis.length ? (
              platformData.kpis.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-sm shadow-emerald-500/5"
                >
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    {item.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-white">
                    {item.value ?? "—"}
                  </p>
                  <p className={`mt-3 text-sm font-medium ${metricClass(item.accent)}`}>
                    {item.change ?? "Awaiting baseline"}
                  </p>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EmptyState
                  title={`No ${platform} KPI data connected`}
                  body="This section intentionally contains no sample numbers. Once ingestion is connected, it will display platform-native KPIs and CreatorScope predictive enrichments."
                />
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                    Views over time
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Historical engagement curve
                  </p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-zinc-300">
                  Real data
                </span>
              </div>
              <div className="mt-8 h-60 overflow-hidden rounded-3xl bg-zinc-900 p-4">
                {hasTrendData ? (
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
                      return <circle key={point.label} cx={x} cy={y} r={4} fill="#10b981" />;
                    })}
                  </svg>
                ) : (
                  <div className="grid h-full place-items-center text-center text-sm leading-6 text-zinc-400">
                    Awaiting time-series events from connected platform APIs.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                  Engagement mix
                </p>
                {hasMixData ? (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {platformData.mix.map((item) => {
                      const circumference = 2 * Math.PI * 26;
                      const dash = `${(item.value / 100) * circumference} ${circumference}`;
                      return (
                        <div key={item.label} className="rounded-3xl bg-zinc-950/90 p-4">
                          <div className="flex items-center gap-3">
                            <svg width="72" height="72" viewBox="0 0 72 72">
                              <circle cx="36" cy="36" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                              <circle cx="36" cy="36" r="26" fill="none" stroke={item.color} strokeWidth="10" strokeDasharray={dash} strokeLinecap="round" transform="rotate(-90 36 36)" />
                            </svg>
                            <div>
                              <p className="text-base font-semibold text-white">{item.label}</p>
                              <p className="text-sm text-zinc-400">{item.value}%</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-6 rounded-3xl bg-zinc-900 p-5 text-sm leading-6 text-zinc-400">
                    Awaiting real engagement mix data.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-sm shadow-emerald-500/5">
                <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">
                  Growth funnel
                </p>
                {hasGrowthData ? (
                  <div className="mt-6 space-y-4">
                    {platformData.growth.map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${progressColor(item.value)}`} style={{ width: `${(item.value / maxGrowth) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 rounded-3xl bg-zinc-900 p-5 text-sm leading-6 text-zinc-400">
                    Awaiting real growth funnel data.
                  </p>
                )}
              </div>
            </div>
          </div>

          <section className="mt-10 rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-sm shadow-emerald-500/5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                  Architecture plan
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Enterprise expansion blueprint
                </h2>
              </div>
              <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-zinc-300">
                Database, APIs, realtime, AI, security, monitoring, tenancy
              </span>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {enterpriseBlueprints.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="rounded-3xl border border-white/5 bg-zinc-950/90 p-5 text-sm leading-7 text-zinc-300 shadow-inner shadow-zinc-950/30">
                  <Icon className="text-emerald-300" size={24} />
                  <p className="mt-4 text-lg font-semibold text-white">{title}</p>
                  <p className="mt-2">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-[2rem] border border-white/10 bg-zinc-950/80 p-8 shadow-sm shadow-emerald-500/5">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
              AI growth intelligence
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Recommendations reserved for model output
            </h2>
            {platformData.insights.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {platformData.insights.map((insight) => (
                  <div key={insight} className="rounded-3xl border border-white/5 bg-zinc-950/90 p-5 text-sm leading-7 text-zinc-300 shadow-inner shadow-zinc-950/30">
                    {insight}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState
                  title="No AI recommendations generated"
                  body="Connect real creator data and enable forecasting models to generate trend, retention, revenue, audience, and traffic recommendations."
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
