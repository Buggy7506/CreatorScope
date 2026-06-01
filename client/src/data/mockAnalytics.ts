export type PlatformKey = "TikTok" | "YouTube" | "Instagram";

export type AccentType = "positive" | "neutral" | "negative";

export interface KPI {
  label: string;
  value: string;
  change: string;
  accent: AccentType;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface MixItem {
  label: string;
  value: number;
  color: string;
}

export interface GrowthItem {
  label: string;
  value: number;
}

export interface HeatmapDay {
  day: string;
  hours: number[];
}

export interface TopContent {
  title: string;
  metric: string;
  engagement: string;
  viralScore: string;
}

export interface PlatformAnalytics {
  title: string;
  tagline: string;
  score: number;

  kpis: KPI[];
  trend: TrendPoint[];
  mix: MixItem[];
  growth: GrowthItem[];
  heatmap: HeatmapDay[];
  topContent: TopContent[];
  insights: string[];
}

export const analyticsData: Record<PlatformKey, PlatformAnalytics> = {
  TikTok: {
    title: "TikTok Pulse",
    tagline: "Capture viral motion, creator momentum, and sound-level spikes.",
    score: 87,

    kpis: [
      { label: "Views", value: "1.2M", change: "+24%", accent: "positive" },
      { label: "Engagement", value: "8.5%", change: "+1.6%", accent: "positive" },
      { label: "New Followers", value: "9.1K", change: "+18%", accent: "positive" },
      { label: "Likes", value: "94K", change: "+22%", accent: "positive" },
      { label: "Avg Views/Day", value: "41K", change: "+12%", accent: "positive" },
      { label: "Viral Videos", value: "12", change: "+3", accent: "positive" },
    ],

    trend: [
      { label: "Mon", value: 72 },
      { label: "Tue", value: 88 },
      { label: "Wed", value: 95 },
      { label: "Thu", value: 112 },
      { label: "Fri", value: 135 },
      { label: "Sat", value: 160 },
      { label: "Sun", value: 143 },
    ],

    mix: [
      { label: "Likes", value: 46, color: "#22D3EE" },
      { label: "Comments", value: 18, color: "#C084FC" },
      { label: "Shares", value: 11, color: "#A5B4FC" },
      { label: "Saves", value: 25, color: "#38BDF8" },
    ],

    growth: [
      { label: "Followers", value: 12 },
      { label: "Engagement", value: 9 },
      { label: "Reach", value: 14 },
      { label: "Traffic", value: 11 },
    ],

    heatmap: [
      { day: "Mon", hours: [1, 0, 0, 1, 2, 3, 7, 9, 11, 14, 17, 15, 12, 11, 10, 8, 6, 5] },
      { day: "Tue", hours: [1, 0, 0, 1, 2, 4, 8, 10, 12, 16, 19, 18, 15, 12, 10, 9, 7, 6] },
      { day: "Wed", hours: [1, 0, 0, 1, 2, 3, 9, 12, 14, 18, 21, 20, 17, 15, 12, 10, 8, 6] },
      { day: "Thu", hours: [1, 0, 0, 1, 3, 5, 10, 13, 16, 20, 22, 21, 18, 16, 14, 12, 10, 8] },
      { day: "Fri", hours: [2, 0, 0, 1, 4, 6, 11, 15, 18, 22, 26, 24, 20, 18, 16, 14, 12, 10] },
      { day: "Sat", hours: [3, 0, 0, 1, 5, 7, 12, 17, 20, 24, 29, 27, 22, 19, 17, 15, 13, 12] },
      { day: "Sun", hours: [2, 0, 0, 1, 4, 6, 11, 16, 19, 23, 28, 26, 21, 18, 16, 14, 12, 11] },
    ],

    topContent: [
      {
        title: "Algorithm hack: 34M reach",
        metric: "1.8M views",
        engagement: "15.2%",
        viralScore: "98",
      },
      {
        title: "Trend remix viral spinner",
        metric: "980K views",
        engagement: "12.7%",
        viralScore: "91",
      },
      {
        title: "Hook in 1s challenge loop",
        metric: "650K views",
        engagement: "14.9%",
        viralScore: "89",
      },
    ],

    insights: [
      "Post between 7PM and 10PM for max share velocity.",
      "High energy opening + second caption boost increases reach.",
      "Viral Pulse Predictor flags trending audio formats.",
    ],
  },

  YouTube: {
    title: "YouTube Momentum",
    tagline: "Measure watch-time gravity, retention spikes, subscriber velocity.",
    score: 82,

    kpis: [
      { label: "Watch Hours", value: "48.4K", change: "+16%", accent: "positive" },
      { label: "CTR", value: "10.2%", change: "+1.4%", accent: "positive" },
      { label: "Subscribers", value: "3.4K", change: "+7%", accent: "positive" },
      { label: "Likes", value: "12.9K", change: "+12%", accent: "positive" },
      { label: "Avg View %", value: "63%", change: "+4%", accent: "positive" },
      { label: "Shorts Views", value: "511K", change: "+26%", accent: "positive" },
    ],

    trend: [
      { label: "Mon", value: 44 },
      { label: "Tue", value: 48 },
      { label: "Wed", value: 57 },
      { label: "Thu", value: 69 },
      { label: "Fri", value: 77 },
      { label: "Sat", value: 91 },
      { label: "Sun", value: 84 },
    ],

    mix: [
      { label: "Views", value: 52, color: "#38BDF8" },
      { label: "Watch Time", value: 28, color: "#A78BFA" },
      { label: "Likes", value: 10, color: "#60A5FA" },
      { label: "Comments", value: 10, color: "#22D3EE" },
    ],

    growth: [
      { label: "Subs", value: 10 },
      { label: "Retention", value: 11 },
      { label: "Sessions", value: 8 },
      { label: "Shares", value: 9 },
    ],

    heatmap: [
      { day: "Mon", hours: [0, 0, 0, 0, 1, 2, 5, 8, 11, 13, 15, 15, 13, 11, 10, 9, 8, 6] },
      { day: "Tue", hours: [0, 0, 0, 0, 1, 2, 6, 9, 13, 15, 17, 16, 14, 12, 11, 10, 9, 7] },
      { day: "Wed", hours: [0, 0, 0, 0, 1, 3, 7, 11, 15, 17, 19, 18, 16, 14, 12, 11, 10, 8] },
      { day: "Thu", hours: [0, 0, 0, 0, 2, 4, 9, 13, 17, 19, 22, 20, 17, 15, 13, 12, 11, 9] },
      { day: "Fri", hours: [0, 0, 0, 0, 3, 5, 11, 16, 20, 24, 27, 23, 19, 16, 14, 13, 12, 10] },
      { day: "Sat", hours: [0, 0, 0, 0, 3, 6, 12, 17, 22, 26, 30, 26, 22, 18, 16, 14, 13, 11] },
      { day: "Sun", hours: [0, 0, 0, 0, 2, 5, 11, 16, 21, 25, 28, 24, 20, 17, 15, 13, 12, 10] },
    ],

    topContent: [
      {
        title: "Mini doc creator economy",
        metric: "74K watch hrs",
        engagement: "11.9%",
        viralScore: "94",
      },
    ],

    insights: [
      "Retention strongest in first 18 seconds.",
      "Shorts increase traffic on cross-post days.",
      "Upload timing optimization improves reach.",
    ],
  },

  Instagram: {
    title: "Instagram Insight",
    tagline: "Track reels reach, saves, stories spike, and resonance.",
    score: 79,

    kpis: [
      { label: "Reach", value: "243K", change: "+19%", accent: "positive" },
      { label: "Impressions", value: "410K", change: "+21%", accent: "positive" },
      { label: "Saves", value: "8.9K", change: "+5%", accent: "positive" },
      { label: "Shares", value: "5.5K", change: "+12%", accent: "positive" },
      { label: "Reel Plays", value: "330K", change: "+28%", accent: "positive" },
      { label: "DMs Started", value: "4.2K", change: "+9%", accent: "positive" },
    ],

    trend: [
      { label: "Mon", value: 32 },
      { label: "Tue", value: 42 },
      { label: "Wed", value: 48 },
      { label: "Thu", value: 56 },
      { label: "Fri", value: 61 },
      { label: "Sat", value: 74 },
      { label: "Sun", value: 69 },
    ],

    mix: [
      { label: "Reels", value: 46, color: "#38BDF8" },
      { label: "Carousel", value: 18, color: "#A78BFA" },
      { label: "Stories", value: 16, color: "#22D3EE" },
      { label: "Live", value: 20, color: "#67E8F9" },
    ],

    growth: [
      { label: "Reach", value: 12 },
      { label: "Saves", value: 10 },
      { label: "Shares", value: 9 },
      { label: "Profile Visits", value: 13 },
    ],

    heatmap: [
      { day: "Mon", hours: [0, 0, 0, 0, 1, 1, 4, 6, 9, 12, 14, 14, 12, 11, 10, 9, 7, 5] },
      { day: "Tue", hours: [0, 0, 0, 0, 1, 1, 5, 7, 10, 13, 15, 15, 13, 12, 11, 10, 8, 6] },
      { day: "Wed", hours: [0, 0, 0, 0, 2, 2, 6, 8, 12, 15, 17, 16, 14, 13, 12, 11, 9, 7] },
      { day: "Thu", hours: [0, 0, 0, 0, 2, 3, 7, 10, 14, 17, 19, 18, 16, 14, 13, 12, 10, 8] },
      { day: "Fri", hours: [0, 0, 0, 0, 3, 4, 9, 13, 17, 20, 22, 19, 17, 15, 14, 13, 11, 9] },
      { day: "Sat", hours: [0, 0, 0, 0, 3, 5, 10, 14, 18, 22, 24, 21, 18, 16, 15, 14, 12, 10] },
      { day: "Sun", hours: [0, 0, 0, 0, 2, 4, 9, 13, 17, 21, 23, 20, 17, 15, 14, 13, 11, 9] },
    ],

    topContent: [
      {
        title: "Reel trend loop sync",
        metric: "142K plays",
        engagement: "13.1%",
        viralScore: "93",
      },
    ],

    insights: [
      "Reels after 8PM perform best.",
      "CTA stickers improve conversion.",
      "Cross-posting increases reach.",
    ],
  },
};