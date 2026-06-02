-- CreatorScope foundational schema for profiles, OAuth connections, subscriptions, and analytics cache.
DO $$ BEGIN
  CREATE TYPE "Platform" AS ENUM ('YOUTUBE', 'TIKTOK', 'INSTAGRAM', 'GOOGLE', 'MICROSOFT', 'APPLE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "profileUrl" TEXT;
ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "disconnectedAt" TIMESTAMP(3);
ALTER TABLE "ConnectedAccount" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

DROP INDEX IF EXISTS "ConnectedAccount_userId_platform_key";
ALTER TABLE "ConnectedAccount"
  ALTER COLUMN "platform" TYPE "Platform"
  USING (
    CASE lower("platform")
      WHEN 'youtube' THEN 'YOUTUBE'
      WHEN 'tiktok' THEN 'TIKTOK'
      WHEN 'instagram' THEN 'INSTAGRAM'
      WHEN 'google' THEN 'GOOGLE'
      WHEN 'microsoft' THEN 'MICROSOFT'
      WHEN 'apple' THEN 'APPLE'
      ELSE 'YOUTUBE'
    END
  )::"Platform";
CREATE INDEX IF NOT EXISTS "ConnectedAccount_userId_platform_idx" ON "ConnectedAccount"("userId", "platform");
CREATE UNIQUE INDEX IF NOT EXISTS "ConnectedAccount_userId_platform_platformUserId_key" ON "ConnectedAccount"("userId", "platform", "platformUserId");

ALTER TABLE "AnalyticsSnapshot"
  ALTER COLUMN "platform" TYPE "Platform"
  USING (
    CASE lower("platform")
      WHEN 'youtube' THEN 'YOUTUBE'
      WHEN 'tiktok' THEN 'TIKTOK'
      WHEN 'instagram' THEN 'INSTAGRAM'
      ELSE 'YOUTUBE'
    END
  )::"Platform";

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "stripeProductId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "trialEndsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "AnalyticsCache" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
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
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalyticsCache_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AnalyticsCache_userId_platform_cacheKey_key" ON "AnalyticsCache"("userId", "platform", "cacheKey");
CREATE INDEX IF NOT EXISTS "AnalyticsCache_userId_expiresAt_idx" ON "AnalyticsCache"("userId", "expiresAt");
ALTER TABLE "AnalyticsCache" ADD CONSTRAINT "AnalyticsCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
