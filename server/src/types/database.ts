export type Platform = "YOUTUBE" | "TIKTOK" | "INSTAGRAM" | "GOOGLE" | "GA4" | "MICROSOFT" | "APPLE";
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "INCOMPLETE_EXPIRED" | "UNPAID";

export type UserRow = {
  id: string;
  email: string;
  password: string;
  name: string;
  timezone: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ConnectedAccountRow = {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId: string | null;
  username: string | null;
  displayName: string | null;
  channelId: string | null;
  profileUrl: string | null;
  scopes: string[];
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  expiresAt: Date | null;
  connectedAt: Date;
  disconnectedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};
