export const platformKeys = ["YouTube", "TikTok", "Instagram"] as const;

export type PlatformKey = (typeof platformKeys)[number];

export type MetricAccent = "positive" | "neutral" | "negative";

export type KpiMetric = {
  label: string;
  value: string | number | null;
  change?: string | null;
  accent?: MetricAccent;
};

export type TimeSeriesPoint = {
  label: string;
  value: number;
};

export type MixMetric = {
  label: string;
  value: number;
  color: string;
};

export type GrowthMetric = {
  label: string;
  value: number;
};

export type PlatformAnalytics = {
  platform: PlatformKey;
  score: number | null;
  kpis: KpiMetric[];
  trend: TimeSeriesPoint[];
  mix: MixMetric[];
  growth: GrowthMetric[];
  insights: string[];
  lastSyncedAt?: string | null;
};

export type EnterpriseModule = {
  id: string;
  title: string;
  description: string;
  dataSources: PlatformKey[] | string[];
  capabilities: string[];
  status: "awaiting_data" | "ready" | "disabled";
};

export type UnifiedPerformancePoint = {
  date: string;
  YouTube?: number | null;
  TikTok?: number | null;
  Instagram?: number | null;
  earnings?: number | null;
};

export type UnifiedAnalytics = {
  totals: {
    totalViews: number | null;
    totalFollowers: number | null;
    totalEarningsCents: number | null;
    creatorHealthScore: number | null;
  };
  performance: UnifiedPerformancePoint[];
  audienceOverlap: Array<{ segment: string; overlap: number | null }>;
  predictiveEarnings: {
    next30DaysCents: number | null;
    brandDealRoi: number | null;
    cpmBlend: number | null;
  };
  alerts: string[];
  aiSuggestions: string[];
  modules: EnterpriseModule[];
};

export const emptyPlatformAnalytics = (platform: PlatformKey): PlatformAnalytics => ({
  platform,
  score: null,
  kpis: [],
  trend: [],
  mix: [],
  growth: [],
  insights: [],
  lastSyncedAt: null,
});

export const emptyUnifiedAnalytics: UnifiedAnalytics = {
  totals: {
    totalViews: null,
    totalFollowers: null,
    totalEarningsCents: null,
    creatorHealthScore: null,
  },
  performance: [],
  audienceOverlap: [],
  predictiveEarnings: {
    next30DaysCents: null,
    brandDealRoi: null,
    cpmBlend: null,
  },
  alerts: [],
  aiSuggestions: [],
  modules: [],
};
