import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { Prisma, PrismaClient, Platform } from "@prisma/client";

import { env } from "../../config/env";
import { prisma as defaultPrisma } from "../../lib/prisma";

export const GOOGLE_YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
  "https://www.googleapis.com/auth/yt-analytics-monetary.readonly",
];

export const GOOGLE_GA4_SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
];

export const GOOGLE_CREATOR_ANALYTICS_SCOPES = [
  ...GOOGLE_YOUTUBE_SCOPES,
  ...GOOGLE_GA4_SCOPES,
];

type GooglePlatform = "youtube" | "ga4";

type DateRange = {
  startDate: string;
  endDate: string;
};

type YoutubeReportOptions = DateRange & {
  userId: string;
  connectedAccountId?: string;
  currency?: string;
  persistSnapshots?: boolean;
};

type Ga4ReportOptions = DateRange & {
  userId: string;
  propertyId: string;
  connectedAccountId?: string;
  persistSnapshots?: boolean;
};

type UnifiedTimeSeriesPoint = {
  date: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
  shares?: number;
  subscribersGained?: number;
  subscribersLost?: number;
  averageViewDuration?: number;
  estimatedMinutesWatched?: number;
  estimatedRevenue?: number;
  estimatedAdRevenue?: number;
  activeUsers?: number;
  newUsers?: number;
  sessions?: number;
  pageViews?: number;
  averageSessionDuration?: number;
  engagementRate?: number;
  conversions?: number;
  purchaseRevenue?: number;
};

export type UnifiedCreatorAnalytics = {
  platform: GooglePlatform;
  accountId: string;
  propertyId?: string;
  channelId?: string;
  currency: string;
  timeSeries: UnifiedTimeSeriesPoint[];
  demographics: Record<string, unknown>;
  attribution: Record<string, unknown>;
  metadata: Record<string, unknown>;
  lastSyncedAt: string;
};

type ConnectedGoogleAccount = Prisma.ConnectedAccountGetPayload<Record<string, never>>;

type GoogleApiErrorPayload = {
  code?: number;
  status?: number;
  message?: string;
  errors?: Array<{ reason?: string; message?: string }>;
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: number;
        status?: string;
        message?: string;
        errors?: Array<{ reason?: string; message?: string }>;
      };
    };
  };
};

export class GoogleAnalyticsServiceError extends Error {
  readonly statusCode: number;
  readonly reason: string;
  readonly retryable: boolean;

  constructor(message: string, statusCode = 500, reason = "google_api_error", retryable = false) {
    super(message);
    this.name = "GoogleAnalyticsServiceError";
    this.statusCode = statusCode;
    this.reason = reason;
    this.retryable = retryable;
  }
}

export class YoutubeGa4Service {
  private readonly tokenRefreshSkewMs = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  buildOAuth2Client(): OAuth2Client {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI || env.YOUTUBE_REDIRECT_URI,
    );
  }

  buildAuthorizationUrl(userId: string, platforms: GooglePlatform[] = ["youtube", "ga4"]): string {
    const scopes = this.resolveScopes(platforms);
    const oauth2Client = this.buildOAuth2Client();

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",
      scope: scopes,
      state: JSON.stringify({ userId, platforms }),
    });
  }

  async exchangeCodeForAccount(code: string, userId: string, platform: Platform = Platform.GOOGLE) {
    try {
      const oauth2Client = this.buildOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data: profile } = await oauth2.userinfo.get();
      const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      return this.prisma.connectedAccount.upsert({
        where: {
          userId_platform_platformUserId: {
            userId,
            platform,
            platformUserId: profile.id ?? profile.email ?? "google-account",
          },
        },
        create: {
          userId,
          platform,
          platformUserId: profile.id ?? profile.email ?? "google-account",
          username: profile.email,
          displayName: profile.name,
          profileUrl: profile.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry,
          expiresAt: tokenExpiry,
          scopes: GOOGLE_CREATOR_ANALYTICS_SCOPES,
          metadata: profile as Prisma.InputJsonObject,
        },
        update: {
          username: profile.email,
          displayName: profile.name,
          profileUrl: profile.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? undefined,
          tokenExpiry,
          expiresAt: tokenExpiry,
          scopes: GOOGLE_CREATOR_ANALYTICS_SCOPES,
          disconnectedAt: null,
          metadata: profile as Prisma.InputJsonObject,
        },
      });
    } catch (error) {
      throw this.normalizeGoogleError(error, "Unable to complete Google OAuth exchange.");
    }
  }

  async getAuthorizedClient(connectedAccountId: string): Promise<{ auth: OAuth2Client; account: ConnectedGoogleAccount }> {
    const account = await this.prisma.connectedAccount.findUnique({ where: { id: connectedAccountId } });

    if (!account || account.disconnectedAt) {
      throw new GoogleAnalyticsServiceError("Connected Google account was not found.", 404, "account_not_found");
    }

    if (!account.refreshToken && !account.accessToken) {
      throw new GoogleAnalyticsServiceError("Connected Google account is missing OAuth credentials.", 401, "missing_oauth_tokens");
    }

    const auth = this.buildOAuth2Client();
    auth.setCredentials({
      access_token: account.accessToken ?? undefined,
      refresh_token: account.refreshToken ?? undefined,
      expiry_date: (account.tokenExpiry ?? account.expiresAt)?.getTime(),
    });

    if (this.isTokenExpiring(account)) {
      try {
        const { credentials } = await auth.refreshAccessToken();
        const tokenExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : null;

        const refreshedAccount = await this.prisma.connectedAccount.update({
          where: { id: account.id },
          data: {
            accessToken: credentials.access_token ?? account.accessToken,
            refreshToken: credentials.refresh_token ?? account.refreshToken,
            tokenExpiry,
            expiresAt: tokenExpiry,
          },
        });

        auth.setCredentials({
          access_token: refreshedAccount.accessToken ?? undefined,
          refresh_token: refreshedAccount.refreshToken ?? undefined,
          expiry_date: (refreshedAccount.tokenExpiry ?? refreshedAccount.expiresAt)?.getTime(),
        });

        return { auth, account: refreshedAccount };
      } catch (error) {
        throw this.normalizeGoogleError(error, "Unable to refresh Google OAuth token.");
      }
    }

    return { auth, account };
  }

  async fetchYoutubeAnalytics(options: YoutubeReportOptions): Promise<UnifiedCreatorAnalytics> {
    const account = await this.resolveConnectedAccount(options.userId, Platform.YOUTUBE, options.connectedAccountId);
    const { auth } = await this.getAuthorizedClient(account.id);
    const currency = options.currency ?? "USD";

    try {
      const youtube = google.youtube({ version: "v3", auth });
      const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

      const [{ data: channelData }, performanceReport, trafficReport, countryReport, demographicReport] = await Promise.all([
        youtube.channels.list({
          mine: true,
          part: ["id", "snippet", "statistics"],
        }),
        youtubeAnalytics.reports.query({
          ids: "channel==MINE",
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: "day",
          metrics: "views,likes,dislikes,comments,shares,averageViewDuration,estimatedMinutesWatched,subscribersGained,subscribersLost,estimatedRevenue,estimatedAdRevenue",
          sort: "day",
          currency,
        }),
        youtubeAnalytics.reports.query({
          ids: "channel==MINE",
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: "insightTrafficSourceType",
          metrics: "views,estimatedMinutesWatched",
          sort: "-views",
        }),
        youtubeAnalytics.reports.query({
          ids: "channel==MINE",
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: "country",
          metrics: "views,estimatedMinutesWatched,estimatedRevenue",
          sort: "-views",
          currency,
        }),
        youtubeAnalytics.reports.query({
          ids: "channel==MINE",
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: "ageGroup,gender",
          metrics: "viewerPercentage",
          sort: "ageGroup,gender",
        }),
      ]);

      const channel = channelData.items?.[0];
      const channelId = channel?.id ?? account.channelId ?? "MINE";
      const subscribers = this.toNumber(channel?.statistics?.subscriberCount);
      const timeSeries = this.mapYoutubeTimeSeries(performanceReport.data.rows ?? []);
      const demographics = {
        ageGender: this.mapRows(demographicReport.data.columnHeaders, demographicReport.data.rows),
        country: this.mapRows(countryReport.data.columnHeaders, countryReport.data.rows),
      };
      const attribution = {
        trafficSources: this.mapRows(trafficReport.data.columnHeaders, trafficReport.data.rows),
      };

      if (options.persistSnapshots ?? true) {
        await this.persistYoutubeSnapshots({
          userId: options.userId,
          connectedAccountId: account.id,
          channelId,
          subscribers,
          currency,
          timeSeries,
          demographics,
          attribution,
          rawPayload: performanceReport.data,
        });
      }

      return {
        platform: "youtube",
        accountId: account.id,
        channelId,
        currency,
        timeSeries,
        demographics,
        attribution,
        metadata: {
          title: channel?.snippet?.title,
          description: channel?.snippet?.description,
          publishedAt: channel?.snippet?.publishedAt,
          statistics: channel?.statistics,
        },
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.normalizeGoogleError(error, "Unable to load YouTube analytics.");
    }
  }

  async fetchGa4Analytics(options: Ga4ReportOptions): Promise<UnifiedCreatorAnalytics> {
    const account = await this.resolveConnectedAccount(options.userId, Platform.GA4, options.connectedAccountId);
    const { auth } = await this.getAuthorizedClient(account.id);

    try {
      const analyticsData = google.analyticsdata({ version: "v1beta", auth });
      const property = `properties/${options.propertyId}`;
      const [coreReport, attributionReport] = await Promise.all([
        analyticsData.properties.runReport({
          property,
          requestBody: {
            dateRanges: [{ startDate: options.startDate, endDate: options.endDate }],
            dimensions: [{ name: "date" }],
            metrics: [
              { name: "activeUsers" },
              { name: "newUsers" },
              { name: "screenPageViews" },
              { name: "sessions" },
              { name: "averageSessionDuration" },
              { name: "engagementRate" },
              { name: "conversions" },
              { name: "purchaseRevenue" },
            ],
            orderBys: [{ dimension: { dimensionName: "date" } }],
          },
        }),
        analyticsData.properties.runReport({
          property,
          requestBody: {
            dateRanges: [{ startDate: options.startDate, endDate: options.endDate }],
            dimensions: [
              { name: "sessionSource" },
              { name: "sessionMedium" },
              { name: "sessionCampaign" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "conversions" },
              { name: "purchaseRevenue" },
            ],
            orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
            limit: "100",
          },
        }),
      ]);

      const timeSeries = this.mapGa4TimeSeries(coreReport.data.rows ?? []);
      const attribution = {
        campaigns: this.mapRows(attributionReport.data.dimensionHeaders, attributionReport.data.rows),
      };

      if (options.persistSnapshots ?? true) {
        await this.persistGa4Snapshots({
          userId: options.userId,
          connectedAccountId: account.id,
          propertyId: options.propertyId,
          timeSeries,
          attribution,
          rawPayload: coreReport.data,
        });
      }

      return {
        platform: "ga4",
        accountId: account.id,
        propertyId: options.propertyId,
        currency: "USD",
        timeSeries,
        demographics: {},
        attribution,
        metadata: {
          rowCount: coreReport.data.rowCount,
          propertyQuota: coreReport.data.propertyQuota,
        },
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw this.normalizeGoogleError(error, "Unable to load GA4 analytics.");
    }
  }

  private resolveScopes(platforms: GooglePlatform[]): string[] {
    const scopes = new Set<string>();

    for (const platform of platforms) {
      const platformScopes = platform === "youtube" ? GOOGLE_YOUTUBE_SCOPES : GOOGLE_GA4_SCOPES;
      platformScopes.forEach((scope) => scopes.add(scope));
    }

    return [...scopes];
  }

  private async resolveConnectedAccount(userId: string, platform: Platform, connectedAccountId?: string) {
    const account = connectedAccountId
      ? await this.prisma.connectedAccount.findFirst({ where: { id: connectedAccountId, userId } })
      : await this.prisma.connectedAccount.findFirst({
          where: {
            userId,
            platform: { in: platform === Platform.GA4 ? [Platform.GA4, Platform.GOOGLE] : [Platform.YOUTUBE, Platform.GOOGLE] },
            disconnectedAt: null,
          },
          orderBy: { connectedAt: "desc" },
        });

    if (!account) {
      throw new GoogleAnalyticsServiceError(`No connected ${platform} account found for this user.`, 404, "account_not_found");
    }

    return account;
  }

  private isTokenExpiring(account: Pick<ConnectedGoogleAccount, "tokenExpiry" | "expiresAt" | "accessToken">): boolean {
    if (!account.accessToken) return true;

    const expiry = account.tokenExpiry ?? account.expiresAt;
    if (!expiry) return false;

    return expiry.getTime() - Date.now() <= this.tokenRefreshSkewMs;
  }

  private mapYoutubeTimeSeries(rows: unknown[][]): UnifiedTimeSeriesPoint[] {
    return rows.map((row) => ({
      date: String(row[0]),
      views: this.toNumber(row[1]),
      likes: this.toNumber(row[2]),
      dislikes: this.toNumber(row[3]),
      comments: this.toNumber(row[4]),
      shares: this.toNumber(row[5]),
      averageViewDuration: this.toNumber(row[6]),
      estimatedMinutesWatched: this.toNumber(row[7]),
      subscribersGained: this.toNumber(row[8]),
      subscribersLost: this.toNumber(row[9]),
      estimatedRevenue: this.toNumber(row[10]),
      estimatedAdRevenue: this.toNumber(row[11]),
    }));
  }

  private mapGa4TimeSeries(rows: Array<{ dimensionValues?: Array<{ value?: string | null }>; metricValues?: Array<{ value?: string | null }> }>): UnifiedTimeSeriesPoint[] {
    return rows.map((row) => {
      const date = this.formatGa4Date(row.dimensionValues?.[0]?.value ?? "");
      const metrics = row.metricValues ?? [];

      return {
        date,
        activeUsers: this.toNumber(metrics[0]?.value),
        newUsers: this.toNumber(metrics[1]?.value),
        pageViews: this.toNumber(metrics[2]?.value),
        sessions: this.toNumber(metrics[3]?.value),
        averageSessionDuration: this.toNumber(metrics[4]?.value),
        engagementRate: this.toNumber(metrics[5]?.value),
        conversions: this.toNumber(metrics[6]?.value),
        purchaseRevenue: this.toNumber(metrics[7]?.value),
      };
    });
  }

  private mapRows(headers: unknown, rows: unknown): Array<Record<string, string | number>> {
    const normalizedHeaders = Array.isArray(headers)
      ? headers.map((header) => {
          if (header && typeof header === "object" && "name" in header) return String(header.name);
          return String(header);
        })
      : [];

    if (!Array.isArray(rows)) return [];

    return rows.map((row) => {
      const values = Array.isArray(row)
        ? row
        : row && typeof row === "object" && "dimensionValues" in row && "metricValues" in row
          ? [...((row.dimensionValues as Array<{ value?: string }>) ?? []), ...((row.metricValues as Array<{ value?: string }>) ?? [])].map((value) => value.value ?? "")
          : [];

      return normalizedHeaders.reduce<Record<string, string | number>>((record, header, index) => {
        const value = values[index] && typeof values[index] === "object" && "value" in (values[index] as object)
          ? (values[index] as { value?: string }).value
          : values[index];
        record[header] = this.toNumberOrString(value);
        return record;
      }, {});
    });
  }

  private async persistYoutubeSnapshots(input: {
    userId: string;
    connectedAccountId: string;
    channelId: string;
    subscribers: number;
    currency: string;
    timeSeries: UnifiedTimeSeriesPoint[];
    demographics: Record<string, unknown>;
    attribution: Record<string, unknown>;
    rawPayload: unknown;
  }) {
    await this.prisma.$transaction(
      input.timeSeries.map((point) =>
        this.prisma.youtubeSnapshot.upsert({
          where: {
            connectedAccountId_channelId_date: {
              connectedAccountId: input.connectedAccountId,
              channelId: input.channelId,
              date: this.toDateOnly(point.date),
            },
          },
          create: {
            userId: input.userId,
            connectedAccountId: input.connectedAccountId,
            channelId: input.channelId,
            date: this.toDateOnly(point.date),
            views: BigInt(point.views ?? 0),
            likes: BigInt(point.likes ?? 0),
            dislikes: BigInt(point.dislikes ?? 0),
            comments: BigInt(point.comments ?? 0),
            shares: BigInt(point.shares ?? 0),
            subscribers: BigInt(input.subscribers),
            subscribersGained: BigInt(point.subscribersGained ?? 0),
            subscribersLost: BigInt(point.subscribersLost ?? 0),
            averageViewDuration: new Prisma.Decimal(point.averageViewDuration ?? 0),
            estimatedMinutesWatched: new Prisma.Decimal(point.estimatedMinutesWatched ?? 0),
            revenue: new Prisma.Decimal(point.estimatedRevenue ?? 0),
            estimatedRevenue: new Prisma.Decimal(point.estimatedRevenue ?? 0),
            estimatedAdRevenue: new Prisma.Decimal(point.estimatedAdRevenue ?? 0),
            currency: input.currency,
            rawDemographics: input.demographics as Prisma.InputJsonObject,
            rawTrafficSources: input.attribution as Prisma.InputJsonObject,
            rawPayload: input.rawPayload as Prisma.InputJsonObject,
          },
          update: {
            views: BigInt(point.views ?? 0),
            likes: BigInt(point.likes ?? 0),
            dislikes: BigInt(point.dislikes ?? 0),
            comments: BigInt(point.comments ?? 0),
            shares: BigInt(point.shares ?? 0),
            subscribers: BigInt(input.subscribers),
            subscribersGained: BigInt(point.subscribersGained ?? 0),
            subscribersLost: BigInt(point.subscribersLost ?? 0),
            averageViewDuration: new Prisma.Decimal(point.averageViewDuration ?? 0),
            estimatedMinutesWatched: new Prisma.Decimal(point.estimatedMinutesWatched ?? 0),
            revenue: new Prisma.Decimal(point.estimatedRevenue ?? 0),
            estimatedRevenue: new Prisma.Decimal(point.estimatedRevenue ?? 0),
            estimatedAdRevenue: new Prisma.Decimal(point.estimatedAdRevenue ?? 0),
            currency: input.currency,
            rawDemographics: input.demographics as Prisma.InputJsonObject,
            rawTrafficSources: input.attribution as Prisma.InputJsonObject,
            rawPayload: input.rawPayload as Prisma.InputJsonObject,
          },
        }),
      ),
    );
  }

  private async persistGa4Snapshots(input: {
    userId: string;
    connectedAccountId: string;
    propertyId: string;
    timeSeries: UnifiedTimeSeriesPoint[];
    attribution: Record<string, unknown>;
    rawPayload: unknown;
  }) {
    await this.prisma.$transaction(
      input.timeSeries.map((point) =>
        this.prisma.ga4Snapshot.upsert({
          where: {
            connectedAccountId_propertyId_date: {
              connectedAccountId: input.connectedAccountId,
              propertyId: input.propertyId,
              date: this.toDateOnly(point.date),
            },
          },
          create: {
            userId: input.userId,
            connectedAccountId: input.connectedAccountId,
            propertyId: input.propertyId,
            date: this.toDateOnly(point.date),
            activeUsers: BigInt(point.activeUsers ?? 0),
            newUsers: BigInt(point.newUsers ?? 0),
            sessions: BigInt(point.sessions ?? 0),
            pageViews: BigInt(point.pageViews ?? point.views ?? 0),
            screenPageViews: BigInt(point.pageViews ?? point.views ?? 0),
            averageSessionDuration: new Prisma.Decimal(point.averageSessionDuration ?? 0),
            engagementRate: new Prisma.Decimal(point.engagementRate ?? 0),
            conversions: new Prisma.Decimal(point.conversions ?? 0),
            purchaseRevenue: new Prisma.Decimal(point.purchaseRevenue ?? 0),
            campaignConversions: input.attribution as Prisma.InputJsonObject,
            attribution: input.attribution as Prisma.InputJsonObject,
            rawPayload: input.rawPayload as Prisma.InputJsonObject,
          },
          update: {
            activeUsers: BigInt(point.activeUsers ?? 0),
            newUsers: BigInt(point.newUsers ?? 0),
            sessions: BigInt(point.sessions ?? 0),
            pageViews: BigInt(point.pageViews ?? point.views ?? 0),
            screenPageViews: BigInt(point.pageViews ?? point.views ?? 0),
            averageSessionDuration: new Prisma.Decimal(point.averageSessionDuration ?? 0),
            engagementRate: new Prisma.Decimal(point.engagementRate ?? 0),
            conversions: new Prisma.Decimal(point.conversions ?? 0),
            purchaseRevenue: new Prisma.Decimal(point.purchaseRevenue ?? 0),
            campaignConversions: input.attribution as Prisma.InputJsonObject,
            attribution: input.attribution as Prisma.InputJsonObject,
            rawPayload: input.rawPayload as Prisma.InputJsonObject,
          },
        }),
      ),
    );
  }

  private normalizeGoogleError(error: unknown, fallbackMessage: string): GoogleAnalyticsServiceError {
    if (error instanceof GoogleAnalyticsServiceError) return error;

    const payload = error as GoogleApiErrorPayload;
    const apiError = payload.response?.data?.error;
    const statusCode = apiError?.code ?? payload.response?.status ?? payload.code ?? payload.status ?? 500;
    const reason = apiError?.errors?.[0]?.reason ?? payload.errors?.[0]?.reason ?? apiError?.status ?? "google_api_error";
    const message = apiError?.message ?? payload.message ?? fallbackMessage;
    const retryable = statusCode === 429 || statusCode >= 500 || ["quotaExceeded", "rateLimitExceeded", "userRateLimitExceeded"].includes(reason);

    if (statusCode === 401 || statusCode === 403) {
      return new GoogleAnalyticsServiceError(message, statusCode, reason || "invalid_or_insufficient_google_token", false);
    }

    return new GoogleAnalyticsServiceError(message, statusCode, reason, retryable);
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toNumberOrString(value: unknown): string | number {
    if (value === null || value === undefined) return "";
    const parsed = Number(value);
    return Number.isFinite(parsed) && String(value).trim() !== "" ? parsed : String(value);
  }

  private formatGa4Date(value: string): string {
    if (/^\d{8}$/.test(value)) {
      return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    }

    return value;
  }

  private toDateOnly(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
  }
}

export const youtubeGa4Service = new YoutubeGa4Service();
