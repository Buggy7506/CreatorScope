import { Router } from 'express';
import { z } from 'zod';

const router = Router();

type PlatformKey = 'TikTok' | 'YouTube' | 'Instagram';

type PlatformAnalytics = {
  score: number;
  kpis: Array<{ label: string; value: string; change: string; accent: 'positive' | 'neutral' | 'negative' }>;
  trend: Array<{ label: string; value: number }>;
  mix: Array<{ label: string; value: number; color: string }>;
  growth: Array<{ label: string; value: number }>;
  insights: string[];
};

const analyticsData: Record<PlatformKey, PlatformAnalytics> = {
  TikTok: {
    score: 88,
    kpis: [
      { label: 'Engagement', value: '18.2%', change: '+4.3%', accent: 'positive' },
      { label: 'View Rate', value: '72.1%', change: '+2.1%', accent: 'positive' },
      { label: 'Follower Growth', value: '+1.9K', change: '+12%', accent: 'positive' },
    ],
    trend: [
      { label: 'Mon', value: 95 },
      { label: 'Tue', value: 115 },
      { label: 'Wed', value: 128 },
      { label: 'Thu', value: 140 },
      { label: 'Fri', value: 160 },
      { label: 'Sat', value: 148 },
      { label: 'Sun', value: 170 },
    ],
    mix: [
      { label: 'Views', value: 48, color: '#22d3ee' },
      { label: 'Likes', value: 26, color: '#a855f7' },
      { label: 'Comments', value: 16, color: '#38bdf8' },
      { label: 'Shares', value: 10, color: '#4f46e5' },
    ],
    growth: [
      { label: 'Content reach', value: 88 },
      { label: 'Retention', value: 76 },
      { label: 'Audience resonance', value: 91 },
    ],
    insights: [
      'Video hooks with direct CTA are outperforming portfolio clips by 24%.',
      'Duet prompts see the strongest share velocity after 4 PM.',
      'Smaller offsets and clearer storytelling increase completion rate on Reels.',
    ],
  },
  YouTube: {
    score: 82,
    kpis: [
      { label: 'Watch Time', value: '46h', change: '+8%', accent: 'positive' },
      { label: 'Views', value: '38K', change: '+6%', accent: 'positive' },
      { label: 'Subscribers', value: '+720', change: '+9%', accent: 'positive' },
    ],
    trend: [
      { label: 'Mon', value: 74 },
      { label: 'Tue', value: 82 },
      { label: 'Wed', value: 98 },
      { label: 'Thu', value: 105 },
      { label: 'Fri', value: 118 },
      { label: 'Sat', value: 126 },
      { label: 'Sun', value: 142 },
    ],
    mix: [
      { label: 'Watch time', value: 44, color: '#22d3ee' },
      { label: 'Comments', value: 28, color: '#a855f7' },
      { label: 'Likes', value: 18, color: '#38bdf8' },
      { label: 'Shares', value: 10, color: '#4f46e5' },
    ],
    growth: [
      { label: 'Session time', value: 79 },
      { label: 'Suggestions reach', value: 65 },
      { label: 'Subscriber lift', value: 84 },
    ],
    insights: [
      'Shorts with chapter cards are boosting retention by 14%.',
      'Long-form uploads are getting a stronger homepage push when published at 6 PM.',
      'Audience comments point to demand for more behind-the-scenes content.',
    ],
  },
  Instagram: {
    score: 85,
    kpis: [
      { label: 'Reach', value: '24.6K', change: '+11%', accent: 'positive' },
      { label: 'Saves', value: '2.8K', change: '+9%', accent: 'positive' },
      { label: 'Profile visits', value: '3.1K', change: '+7%', accent: 'positive' },
    ],
    trend: [
      { label: 'Mon', value: 85 },
      { label: 'Tue', value: 92 },
      { label: 'Wed', value: 108 },
      { label: 'Thu', value: 120 },
      { label: 'Fri', value: 132 },
      { label: 'Sat', value: 128 },
      { label: 'Sun', value: 148 },
    ],
    mix: [
      { label: 'Reels', value: 55, color: '#22d3ee' },
      { label: 'Stories', value: 19, color: '#a855f7' },
      { label: 'Feed', value: 16, color: '#38bdf8' },
      { label: 'Shares', value: 10, color: '#4f46e5' },
    ],
    growth: [
      { label: 'Reels growth', value: 87 },
      { label: 'Profile taps', value: 64 },
      { label: 'Audience resonance', value: 81 },
    ],
    insights: [
      'Hashtag clusters are driving stronger explore reach than location tags.',
      'Carousel posts with a strong narrative hook are getting 2x more saves.',
      'Drops around 8 PM have higher Clips completion rates.',
    ],
  },
};

const unifiedDashboard = {
  totals: {
    totalViews: 1884000,
    totalFollowers: 432800,
    totalEarningsCents: 1432000,
    growthModel: { p0: 432800, r: 0.031, formula: 'g(t) = P0e^(rt)' },
  },
  performance: [
    { date: 'Mon', YouTube: 74000, TikTok: 95000, Instagram: 85000, earnings: 1800 },
    { date: 'Tue', YouTube: 82000, TikTok: 115000, Instagram: 92000, earnings: 2100 },
    { date: 'Wed', YouTube: 98000, TikTok: 128000, Instagram: 108000, earnings: 2400 },
    { date: 'Thu', YouTube: 105000, TikTok: 140000, Instagram: 120000, earnings: 2600 },
    { date: 'Fri', YouTube: 118000, TikTok: 160000, Instagram: 132000, earnings: 3100 },
    { date: 'Sat', YouTube: 126000, TikTok: 148000, Instagram: 128000, earnings: 2900 },
    { date: 'Sun', YouTube: 142000, TikTok: 170000, Instagram: 148000, earnings: 3400 },
  ],
  audienceOverlap: [
    { segment: 'YT + IG', overlap: 28 },
    { segment: 'TT + IG', overlap: 34 },
    { segment: 'YT + TT', overlap: 19 },
  ],
  predictiveEarnings: { next30DaysCents: 1840000, brandDealRoi: 3.7, cpmBlend: 18.4 },
  aiSuggestions: [
    'Publish YouTube Shorts at 6 PM UTC and repost TikTok cuts within 45 minutes.',
    'Use high-contrast emerald or yellow thumbnail accents for +8% projected CTR.',
    'Open sponsored videos with payoff-first hooks to protect first-3-second retention.',
  ],
};

const platformSchema = z.object({
  platform: z.enum(['TikTok', 'YouTube', 'Instagram']).optional(),
});

const platformParamSchema = z.object({
  platform: z.string().transform((value) => {
    const normalized = value.toLowerCase();
    if (normalized === 'tiktok') return 'TikTok';
    if (normalized === 'youtube') return 'YouTube';
    if (normalized === 'instagram') return 'Instagram';
    return value;
  }).pipe(z.enum(['TikTok', 'YouTube', 'Instagram'])),
});

router.get('/unified', (_req, res) => {
  res.json(unifiedDashboard);
});

router.get('/', (req, res) => {
  const { platform } = platformSchema.parse(req.query);
  const selectedPlatform = platform ?? 'TikTok';
  res.json({ platform: selectedPlatform, data: analyticsData[selectedPlatform] });
});

router.get('/:platform', (req, res) => {
  const { platform } = platformParamSchema.parse(req.params);
  res.json(analyticsData[platform]);
});

export default router;
