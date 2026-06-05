-- CreatorScope PostgreSQL schema managed directly with SQL and the official pg driver.
-- Apply with: psql "$DATABASE_URL" -f server/sql/schema.sql

CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'GOOGLE', 'GA4', 'MICROSOFT', 'APPLE');
CREATE TYPE "AnalyticsEventType" AS ENUM ('VIEW', 'WATCH_TIME', 'IMPRESSION', 'CLICK_THROUGH', 'LIKE', 'COMMENT', 'SHARE', 'SAVE', 'SUBSCRIBER_GAIN', 'FOLLOWER_GAIN', 'REVENUE', 'TRAFFIC_SOURCE', 'RETENTION_SAMPLE', 'ANOMALY');
CREATE TYPE "AudienceSegmentType" AS ENUM ('NEW_VIEWER', 'RETURNING_VIEWER', 'LOYAL_SUBSCRIBER', 'CASUAL_SUBSCRIBER', 'PSYCHOGRAPHIC_COHORT');
CREATE TYPE "RevenueSourceType" AS ENUM ('ADSENSE', 'SPONSORSHIP', 'MEMBERSHIP', 'SUPER_CHAT', 'SUPER_STICKER', 'AFFILIATE', 'COMMERCE');
CREATE TYPE "PredictionType" AS ENUM ('VIEW_FORECAST', 'REVENUE_FORECAST', 'RETENTION_PREDICTION', 'VIRALITY_PREDICTION', 'TREND_FORECAST', 'AUDIENCE_SEGMENTATION');
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ConnectedAccount" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "platform" "Platform" NOT NULL,
  "platformUserId" TEXT,
  "username" TEXT,
  "displayName" TEXT,
  "channelId" TEXT,
  "profileUrl" TEXT,
  "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "tokenExpiry" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "disconnectedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConnectedAccount_userId_platform_platformUserId_key" UNIQUE ("userId", "platform", "platformUserId")
);
CREATE INDEX "ConnectedAccount_userId_platform_idx" ON "ConnectedAccount"("userId", "platform");
CREATE INDEX "ConnectedAccount_platform_channelId_idx" ON "ConnectedAccount"("platform", "channelId");
CREATE INDEX "ConnectedAccount_tokenExpiry_idx" ON "ConnectedAccount"("tokenExpiry");

CREATE TABLE "AnalyticsSnapshot" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "platform" "Platform" NOT NULL,
  "subscribers" INTEGER NOT NULL,
  "totalViews" INTEGER NOT NULL,
  "totalVideos" INTEGER NOT NULL,
  "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "YoutubeSnapshot" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "connectedAccountId" TEXT NOT NULL REFERENCES "ConnectedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "channelId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "views" BIGINT NOT NULL DEFAULT 0,
  "likes" BIGINT NOT NULL DEFAULT 0,
  "dislikes" BIGINT NOT NULL DEFAULT 0,
  "comments" BIGINT NOT NULL DEFAULT 0,
  "shares" BIGINT NOT NULL DEFAULT 0,
  "subscribers" BIGINT NOT NULL DEFAULT 0,
  "subscribersGained" BIGINT NOT NULL DEFAULT 0,
  "subscribersLost" BIGINT NOT NULL DEFAULT 0,
  "averageViewDuration" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "estimatedMinutesWatched" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "revenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "estimatedRevenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "estimatedAdRevenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "rawDemographics" JSONB,
  "rawTrafficSources" JSONB,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "YoutubeSnapshot_connectedAccountId_channelId_date_key" UNIQUE ("connectedAccountId", "channelId", "date")
);
CREATE INDEX "YoutubeSnapshot_userId_date_idx" ON "YoutubeSnapshot"("userId", "date");
CREATE INDEX "YoutubeSnapshot_channelId_date_idx" ON "YoutubeSnapshot"("channelId", "date");
CREATE INDEX "YoutubeSnapshot_views_idx" ON "YoutubeSnapshot"("views");
CREATE INDEX "YoutubeSnapshot_subscribers_idx" ON "YoutubeSnapshot"("subscribers");
CREATE INDEX "YoutubeSnapshot_revenue_idx" ON "YoutubeSnapshot"("revenue");

CREATE TABLE "Ga4Snapshot" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "connectedAccountId" TEXT NOT NULL REFERENCES "ConnectedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "propertyId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "activeUsers" BIGINT NOT NULL DEFAULT 0,
  "newUsers" BIGINT NOT NULL DEFAULT 0,
  "sessions" BIGINT NOT NULL DEFAULT 0,
  "pageViews" BIGINT NOT NULL DEFAULT 0,
  "screenPageViews" BIGINT NOT NULL DEFAULT 0,
  "averageSessionDuration" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "engagementRate" DECIMAL(8,6) NOT NULL DEFAULT 0,
  "conversions" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "purchaseRevenue" DECIMAL(18,6) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "campaignConversions" JSONB,
  "attribution" JSONB,
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Ga4Snapshot_connectedAccountId_propertyId_date_key" UNIQUE ("connectedAccountId", "propertyId", "date")
);
CREATE INDEX "Ga4Snapshot_userId_date_idx" ON "Ga4Snapshot"("userId", "date");
CREATE INDEX "Ga4Snapshot_propertyId_date_idx" ON "Ga4Snapshot"("propertyId", "date");
CREATE INDEX "Ga4Snapshot_activeUsers_idx" ON "Ga4Snapshot"("activeUsers");
CREATE INDEX "Ga4Snapshot_sessions_idx" ON "Ga4Snapshot"("sessions");
CREATE INDEX "Ga4Snapshot_pageViews_idx" ON "Ga4Snapshot"("pageViews");

CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  "stripeProductId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "trialEndsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

CREATE TABLE "AnalyticsCache" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "platform" "Platform",
  "cacheKey" TEXT NOT NULL,
  "rangeStart" TIMESTAMP(3),
  "rangeEnd" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "totalViews" BIGINT NOT NULL DEFAULT 0,
  "totalFollowers" BIGINT NOT NULL DEFAULT 0,
  "totalEarningsCents" BIGINT NOT NULL DEFAULT 0,
  "engagementRate" DECIMAL(8,4),
  "growthRate" DECIMAL(8,4),
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsCache_userId_platform_cacheKey_key" UNIQUE ("userId", "platform", "cacheKey")
);
CREATE INDEX "AnalyticsCache_userId_expiresAt_idx" ON "AnalyticsCache"("userId", "expiresAt");

CREATE TABLE "Workspace" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "ownerUserId" TEXT NOT NULL,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "WorkspaceMember" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'creator',
  "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "joinedAt" TIMESTAMP(3),
  CONSTRAINT "WorkspaceMember_workspaceId_userId_key" UNIQUE ("workspaceId", "userId")
);
CREATE INDEX "WorkspaceMember_userId_role_idx" ON "WorkspaceMember"("userId", "role");

CREATE TABLE "ContentAsset" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "platform" "Platform" NOT NULL,
  "platformContentId" TEXT NOT NULL,
  "canonicalGroupId" TEXT,
  "title" TEXT,
  "description" TEXT,
  "contentType" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "durationSeconds" INTEGER,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentAsset_platform_platformContentId_key" UNIQUE ("platform", "platformContentId")
);
CREATE INDEX "ContentAsset_workspaceId_platform_publishedAt_idx" ON "ContentAsset"("workspaceId", "platform", "publishedAt");
CREATE INDEX "ContentAsset_canonicalGroupId_idx" ON "ContentAsset"("canonicalGroupId");

CREATE TABLE "AnalyticsEvent" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "contentAssetId" TEXT REFERENCES "ContentAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "platform" "Platform" NOT NULL,
  "eventType" "AnalyticsEventType" NOT NULL,
  "metricName" TEXT NOT NULL,
  "metricValue" DECIMAL(18,6) NOT NULL,
  "observedAt" TIMESTAMP(3) NOT NULL,
  "source" TEXT,
  "countryCode" TEXT,
  "deviceType" TEXT,
  "trafficSource" TEXT,
  "cohortKey" TEXT,
  "correlationKey" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AnalyticsEvent_workspaceId_platform_observedAt_idx" ON "AnalyticsEvent"("workspaceId", "platform", "observedAt");
CREATE INDEX "AnalyticsEvent_userId_eventType_observedAt_idx" ON "AnalyticsEvent"("userId", "eventType", "observedAt");
CREATE INDEX "AnalyticsEvent_contentAssetId_metricName_observedAt_idx" ON "AnalyticsEvent"("contentAssetId", "metricName", "observedAt");
CREATE INDEX "AnalyticsEvent_correlationKey_idx" ON "AnalyticsEvent"("correlationKey");

CREATE TABLE "RevenueEvent" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "contentAssetId" TEXT REFERENCES "ContentAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "platform" "Platform",
  "sourceType" "RevenueSourceType" NOT NULL,
  "amountCents" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "rpm" DECIMAL(12,4),
  "cpm" DECIMAL(12,4),
  "countryCode" TEXT,
  "deviceType" TEXT,
  "category" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "attribution" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "RevenueEvent_workspaceId_sourceType_occurredAt_idx" ON "RevenueEvent"("workspaceId", "sourceType", "occurredAt");
CREATE INDEX "RevenueEvent_userId_platform_occurredAt_idx" ON "RevenueEvent"("userId", "platform", "occurredAt");
CREATE INDEX "RevenueEvent_contentAssetId_occurredAt_idx" ON "RevenueEvent"("contentAssetId", "occurredAt");

CREATE TABLE "AudienceCohort" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "segmentType" "AudienceSegmentType" NOT NULL,
  "name" TEXT NOT NULL,
  "platform" "Platform",
  "size" INTEGER,
  "affinity" JSONB,
  "heatmap" JSONB,
  "metadata" JSONB,
  "measuredAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AudienceCohort_workspaceId_segmentType_measuredAt_idx" ON "AudienceCohort"("workspaceId", "segmentType", "measuredAt");
CREATE INDEX "AudienceCohort_userId_platform_measuredAt_idx" ON "AudienceCohort"("userId", "platform", "measuredAt");

CREATE TABLE "AiPrediction" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "contentAssetId" TEXT REFERENCES "ContentAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "predictionType" "PredictionType" NOT NULL,
  "modelName" TEXT NOT NULL,
  "modelVersion" TEXT NOT NULL,
  "score" DECIMAL(12,6),
  "forecast" JSONB NOT NULL,
  "features" JSONB,
  "explanations" JSONB,
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AiPrediction_workspaceId_predictionType_validFrom_idx" ON "AiPrediction"("workspaceId", "predictionType", "validFrom");
CREATE INDEX "AiPrediction_userId_predictionType_validFrom_idx" ON "AiPrediction"("userId", "predictionType", "validFrom");
CREATE INDEX "AiPrediction_contentAssetId_predictionType_idx" ON "AiPrediction"("contentAssetId", "predictionType");
