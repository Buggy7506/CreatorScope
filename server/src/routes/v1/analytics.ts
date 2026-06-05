import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db';
import type { ConnectedAccountRow } from '../../types/database';
import { requireAuth, type AuthRequest } from '../../middleware/auth';

const router = Router();

const platforms = ['TikTok', 'YouTube', 'Instagram'] as const;
type PlatformName = (typeof platforms)[number];

const platformAnalytics: Record<PlatformName, ReturnType<typeof buildPlatformAnalytics>> = {} as Record<PlatformName, ReturnType<typeof buildPlatformAnalytics>>;

function buildPlatformAnalytics(
  platform: PlatformName,
  score: number,
  kpis: Array<{ label: string; value: string | number; change: string; accent: 'positive' | 'neutral' | 'negative' }>,
  trend: number[],
  mix: Array<{ label: string; value: number; color: string }>,
  growth: Array<{ label: string; value: number }>,
  insights: string[],
) {
  return {
    platform,
    score,
    kpis,
    trend: trend.map((value, index) => ({ label: `W${index + 1}`, value })),
    mix,
    growth,
    insights,
    lastSyncedAt: new Date().toISOString(),
  };
}

platformAnalytics.YouTube = buildPlatformAnalytics(
  'YouTube',
  82,
  [
    { label: 'Views', value: '428K', change: '+12.4% vs. last cycle', accent: 'positive' },
    { label: 'Watch time', value: '31.8K hrs', change: '+8.1% retention lift', accent: 'positive' },
    { label: 'Subscribers gained', value: '6,920', change: '+1,104 net gain', accent: 'positive' },
  ],
  [32, 41, 39, 56, 62, 71, 88],
  [
    { label: 'Long form', value: 44, color: '#ef4444' },
    { label: 'Shorts', value: 36, color: '#22c55e' },
    { label: 'Live', value: 20, color: '#38bdf8' },
  ],
  [
    { label: 'Browse', value: 84 },
    { label: 'Suggested', value: 71 },
    { label: 'Search', value: 58 },
  ],
  ['Double down on Shorts that convert to long-form sessions.', 'Move sponsor CTA after the first retention plateau.', 'Search-driven tutorials are creating durable subscriber growth.'],
);

platformAnalytics.TikTok = buildPlatformAnalytics(
  'TikTok',
  88,
  [
    { label: 'Video views', value: '1.2M', change: '+24.8% For You lift', accent: 'positive' },
    { label: 'Completion rate', value: '41%', change: '+6.7% hook quality', accent: 'positive' },
    { label: 'Shares', value: '18.4K', change: '+3.2K viral saves', accent: 'positive' },
  ],
  [45, 52, 61, 59, 74, 86, 103],
  [
    { label: 'For You', value: 62, color: '#06b6d4' },
    { label: 'Profile', value: 22, color: '#a855f7' },
    { label: 'Search', value: 16, color: '#84cc16' },
  ],
  [
    { label: 'Hook', value: 92 },
    { label: 'Retention', value: 77 },
    { label: 'Follower conversion', value: 63 },
  ],
  ['Pin the highest-completion tutorial series before launching new drops.', 'Trending audio is lifting saves more than likes this cycle.', 'Repurpose the top TikTok into an Instagram Reel within 24 hours.'],
);

platformAnalytics.Instagram = buildPlatformAnalytics(
  'Instagram',
  79,
  [
    { label: 'Reach', value: '643K', change: '+15.2% Explore lift', accent: 'positive' },
    { label: 'Reel plays', value: '902K', change: '+11.9% reel velocity', accent: 'positive' },
    { label: 'Saves', value: '27.1K', change: '+4.5K content utility', accent: 'positive' },
  ],
  [28, 35, 49, 46, 58, 65, 72],
  [
    { label: 'Reels', value: 58, color: '#c084fc' },
    { label: 'Stories', value: 24, color: '#fb7185' },
    { label: 'Posts', value: 18, color: '#f59e0b' },
  ],
  [
    { label: 'Explore', value: 74 },
    { label: 'Stories', value: 68 },
    { label: 'Profile actions', value: 59 },
  ],
  ['Carousel explainers are producing high saves and DM shares.', 'Reels posted after TikTok spikes retain momentum best.', 'Story polls can qualify brand-deal audiences before outreach.'],
);

const emptyPlatformAnalytics = (platform: PlatformName) => platformAnalytics[platform] ?? {
  platform,
  score: null,
  kpis: [],
  trend: [],
  mix: [],
  growth: [],
  insights: [],
  lastSyncedAt: null,
};

const enterpriseModules = [
  {
    id: 'research-trend-intelligence',
    title: 'Research & Trend Intelligence Engine',
    description:
      'Cross-platform semantic gap analysis, AI search intent mapping, competitor velocity tracking, and content blueprint generation.',
    dataSources: ['YouTube', 'TikTok', 'Instagram', 'Reddit', 'Forums'],
    capabilities: [
      'High-demand / low-supply opportunity scoring',
      'Informational, transactional, entertainment, community, and commercial-investigation intent labels',
      'Competitor upload velocity anomaly alerts',
    ],
    status: 'awaiting_data',
  },
  {
    id: 'live-command-center',
    title: 'Omni-Channel Live Command Center',
    description:
      'Live view velocity, watch-time velocity, historical baselines, dynamic variance, top 5% upload alerts, and unified creator health scoring.',
    dataSources: ['YouTube', 'TikTok', 'Instagram', 'Redis Streams'],
    capabilities: [
      'Traffic source surge attribution',
      'Automated outlier detection',
      'Creator equity index calculation',
    ],
    status: 'awaiting_data',
  },
  {
    id: 'hook-retention-intelligence',
    title: 'Advanced Hook & Retention Intelligence',
    description:
      'Structural drop-off diagnostics, timeline event mapping, intro weakness, ad break, CTA, end screen, and session optimizer analytics.',
    dataSources: ['YouTube Long Form', 'YouTube Shorts', 'TikTok', 'Instagram Reels'],
    capabilities: [
      'Retention comparison engine',
      'End screen conversion predictor',
      'Recommended next video engine',
    ],
    status: 'awaiting_data',
  },
  {
    id: 'audience-psychographics',
    title: 'Deep Audience Psychographic Intelligence',
    description:
      'Attendance heatmaps, activity matrices, cohorts, content affinity graph, community interest mapping, and external niche discovery.',
    dataSources: ['Channels', 'Communities', 'Forums', 'Reddit', 'Cultural trends'],
    capabilities: [
      'New, returning, loyal, and casual subscriber cohorts',
      'Cross-platform activity matrices',
      'External niche discovery',
    ],
    status: 'awaiting_data',
  },
  {
    id: 'monetization-arbitrage',
    title: 'Monetization Arbitrage Engine',
    description:
      'RPM, CPM, geographic, device, category, sponsorship, AdSense, membership, Super Chat, sticker, and live timeline revenue analytics.',
    dataSources: ['YouTube', 'AdSense', 'Stripe', 'Sponsorship CRM'],
    capabilities: [
      'Revenue mix visualization',
      'CPM opportunity detection',
      'Live stream revenue timeline analysis',
    ],
    status: 'awaiting_data',
  },
  {
    id: 'traffic-algorithm-discovery',
    title: 'Traffic Attribution & Algorithm Discovery',
    description:
      'Browse feature tracking, suggested propagation, recommendation waves, external traffic, dark social, and conversion velocity modeling.',
    dataSources: ['Reddit', 'Discord', 'Slack', 'WhatsApp', 'Direct traffic', 'Dark social'],
    capabilities: [
      'Algorithmic distribution mapping',
      'Recommendation wave detection',
      'External traffic attribution',
    ],
    status: 'awaiting_data',
  },
];

const numberFormat = new Intl.NumberFormat('en-US');

const readMetadataValue = (metadata: unknown, key: string) => {
  if (!metadata || typeof metadata !== 'object' || !(key in metadata)) return undefined;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
};

const buildRealPlatformAnalytics = async (userId: string, platform: PlatformName) => {
  if (platform !== 'YouTube') return emptyPlatformAnalytics(platform);

  const account = (await query<ConnectedAccountRow>(
    'SELECT * FROM "ConnectedAccount" WHERE "userId" = $1 AND "platform" = $2::"Platform" ORDER BY "updatedAt" DESC LIMIT 1',
    [userId, 'YOUTUBE'],
  )).rows[0];

  if (!account) return emptyPlatformAnalytics(platform);

  const snapshots = (await query<{ subscribers: number; totalViews: number; totalVideos: number; snapshotDate: Date }>(
    'SELECT "subscribers", "totalViews", "totalVideos", "snapshotDate" FROM "AnalyticsSnapshot" WHERE "userId" = $1 AND "platform" = $2::"Platform" ORDER BY "snapshotDate" ASC LIMIT 12',
    [userId, 'YOUTUBE'],
  )).rows;

  const subscribers = snapshots.at(-1)?.subscribers ?? Number(readMetadataValue(account.metadata, 'subscribers') ?? 0);
  const totalViews = snapshots.at(-1)?.totalViews ?? Number(readMetadataValue(account.metadata, 'totalViews') ?? 0);
  const totalVideos = snapshots.at(-1)?.totalVideos ?? Number(readMetadataValue(account.metadata, 'totalVideos') ?? 0);

  return {
    platform,
    score: null,
    kpis: [
      { label: 'Subscribers', value: subscribers ? numberFormat.format(subscribers) : null, change: snapshots.length > 1 ? `${numberFormat.format(subscribers - snapshots[0].subscribers)} since first snapshot` : 'Connect more snapshots for trend deltas', accent: 'neutral' as const },
      { label: 'Total views', value: totalViews ? numberFormat.format(totalViews) : null, change: snapshots.length > 1 ? `${numberFormat.format(totalViews - snapshots[0].totalViews)} since first snapshot` : 'Live channel statistic from YouTube', accent: 'neutral' as const },
      { label: 'Total videos', value: totalVideos ? numberFormat.format(totalVideos) : null, change: snapshots.length > 1 ? `${numberFormat.format(totalVideos - snapshots[0].totalVideos)} since first snapshot` : 'Live channel statistic from YouTube', accent: 'neutral' as const },
    ],
    trend: snapshots.map((snapshot) => ({
      label: snapshot.snapshotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.totalViews,
    })),
    mix: [],
    growth: snapshots.map((snapshot) => ({
      label: snapshot.snapshotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.subscribers,
    })),
    insights: [],
    lastSyncedAt: account.updatedAt.toISOString(),
  };
};

const buildRealUnifiedDashboard = async (userId: string) => {
  const youtube = await buildRealPlatformAnalytics(userId, 'YouTube');
  const snapshots = (await query<{ subscribers: number; totalViews: number; totalVideos: number; snapshotDate: Date }>(
    'SELECT "subscribers", "totalViews", "totalVideos", "snapshotDate" FROM "AnalyticsSnapshot" WHERE "userId" = $1 AND "platform" = $2::"Platform" ORDER BY "snapshotDate" ASC LIMIT 12',
    [userId, 'YOUTUBE'],
  )).rows;
  const latestSnapshot = snapshots.at(-1);

  return {
    totals: {
      totalViews: latestSnapshot?.totalViews ?? null,
      totalFollowers: latestSnapshot?.subscribers ?? null,
      totalEarningsCents: null,
      creatorHealthScore: null,
    },
    performance: snapshots.map((snapshot) => ({
      date: snapshot.snapshotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      YouTube: snapshot.totalViews,
      TikTok: null,
      Instagram: null,
      earnings: null,
    })),
    audienceOverlap: [],
    predictiveEarnings: {
      next30DaysCents: null,
      brandDealRoi: null,
      cpmBlend: null,
    },
    alerts: youtube.lastSyncedAt ? [`YouTube connected account last synced at ${youtube.lastSyncedAt}.`] : [],
    aiSuggestions: [],
    modules: enterpriseModules,
  };
};

const platformSchema = z.object({
  platform: z.enum(platforms).optional(),
});

const platformParamSchema = z.object({
  platform: z.string().transform((value) => {
    const normalized = value.toLowerCase();
    if (normalized === 'tiktok') return 'TikTok';
    if (normalized === 'youtube') return 'YouTube';
    if (normalized === 'instagram') return 'Instagram';
    return value;
  }).pipe(z.enum(platforms)),
});

router.use(requireAuth);

router.get('/unified', async (req: AuthRequest, res) => {
  res.json(await buildRealUnifiedDashboard(req.userId!));
});

router.get('/architecture', (_req, res) => {
  res.json({
    directoryStructure: {
      client: [
        'app/(workspace)/dashboard/overview',
        'app/(workspace)/dashboard/research',
        'app/(workspace)/dashboard/retention',
        'app/(workspace)/dashboard/audience',
        'app/(workspace)/dashboard/monetization',
        'app/(workspace)/dashboard/traffic',
        'components/analytics',
        'components/realtime',
        'components/visualization/canvas',
      ],
      server: [
        'src/routes/v1/analytics',
        'src/routes/v1/ingestion',
        'src/routes/v1/realtime',
        'src/services/platforms',
        'src/services/forecasting',
        'src/services/anomaly-detection',
        'src/workers/redis-streams',
      ],
      database: [
        'server/sql/schema.sql',
        'timescale/hypertables.sql',
        'warehouse/materialized-views.sql',
      ],
    },
    apiRoutes: [
      'GET /api/v1/analytics/unified',
      'GET /api/v1/analytics/:platform',
      'GET /api/v1/analytics/architecture',
      'POST /api/v1/ingestion/platform-events',
      'GET /api/v1/realtime/events',
      'GET /api/v1/realtime/command-center',
      'POST /api/v1/ai/forecast',
      'POST /api/v1/ai/retention',
      'POST /api/v1/ai/virality',
      'POST /api/v1/ai/audience-segments',
    ],
    realtimeArchitecture: [
      'Platform webhook/API collectors normalize events into Redis Streams.',
      'Workers enrich events with baselines, anomaly scores, and correlation IDs.',
      'Server-Sent Events fan out operational alerts to dashboards.',
      'WebSockets power high-frequency command-center updates.',
    ],
    warehouseDesign: [
      'Partitioned creator events by tenant, platform, event type, and observed timestamp.',
      'Timescale hypertables for metric time series and retention curve samples.',
      'Materialized views for creator health, revenue mix, velocity baselines, and traffic waves.',
      'Cross-platform correlation tables for content identity, audience cohorts, and source attribution.',
    ],
    aiPredictionArchitecture: [
      'Forecasting engine for views, watch time, revenue, and subscriber/follower growth.',
      'Retention predictor for hook, intro, ad-break, CTA, and end-screen outcomes.',
      'Virality predictor combining velocity, source wave, trend, and competitor features.',
      'Audience segmentation models for psychographic and behavioral cohorts.',
    ],
    infrastructurePlan: [
      'Next.js App Router frontend with TypeScript, TailwindCSS, Recharts, and Canvas visualizations.',
      'Node.js TypeScript API with intelligent caching and rate-limit protection.',
      'PostgreSQL + TimescaleDB, Redis Streams, background workers, and object storage exports.',
      'Horizontal API scaling, worker autoscaling, read replicas, and materialized-view refresh orchestration.',
    ],
    securityMonitoringTenancy: [
      'Multi-tenant workspaces with creator, team, agency, and enterprise roles.',
      'Token vaulting, encrypted platform credentials, least-privilege scopes, and audit trails.',
      'OpenTelemetry traces, structured logs, ingestion lag metrics, model drift checks, and anomaly pipeline health.',
      'Tenant-aware row-level security, workspace billing boundaries, and per-platform rate budgets.',
    ],
  });
});

router.get('/', async (req: AuthRequest, res) => {
  const { platform } = platformSchema.parse(req.query);
  const selectedPlatform = platform ?? 'YouTube';
  res.json({ platform: selectedPlatform, data: await buildRealPlatformAnalytics(req.userId!, selectedPlatform) });
});

router.get('/:platform', async (req: AuthRequest, res) => {
  const { platform } = platformParamSchema.parse(req.params);
  res.json(await buildRealPlatformAnalytics(req.userId!, platform));
});

export default router;
