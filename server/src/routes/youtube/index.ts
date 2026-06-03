import { Router } from "express";
import { google } from "googleapis";

import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { requireAuth, type AuthRequest } from "../../middleware/auth";

const router = Router();

router.use(requireAuth);

const findYouTubeAccount = (userId: string) =>
  prisma.connectedAccount.findFirst({
    where: {
      userId,
      platform: "YOUTUBE",
    },
    orderBy: { updatedAt: "desc" },
  });

const createGoogleAuthClient = (account: NonNullable<Awaited<ReturnType<typeof findYouTubeAccount>>>) => {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.YOUTUBE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: account.accessToken || undefined,
    refresh_token: account.refreshToken || undefined,
    expiry_date: account.expiresAt?.getTime(),
  });

  return oauth2Client;
};

const createYouTubeClient = (account: NonNullable<Awaited<ReturnType<typeof findYouTubeAccount>>>) =>
  google.youtube({
    version: "v3",
    auth: createGoogleAuthClient(account),
  });

router.get("/analytics", async (req: AuthRequest, res) => {
  try {

    const account = await findYouTubeAccount(req.userId!);

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const youtube = createYouTubeClient(account);

    const channelResponse = await youtube.channels.list({
      id: [account.channelId || ""],
      part: ["snippet", "statistics"],
    });

    const channel = channelResponse.data.items?.[0];

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28);
    const toDate = (date: Date) => date.toISOString().slice(0, 10);
    let studioAnalytics: Array<Record<string, string | number | null>> = [];
    let studioAnalyticsError: string | null = null;

    try {
      const youtubeAnalytics = google.youtubeAnalytics({
        version: "v2",
        auth: createGoogleAuthClient(account),
      });
      const report = await youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate: toDate(startDate),
        endDate: toDate(endDate),
        dimensions: "day",
        metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes,comments,shares",
        sort: "day",
      });
      const headers = report.data.columnHeaders?.map((header) => header.name ?? "") ?? [];
      studioAnalytics = (report.data.rows ?? []).map((row) =>
        Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null])),
      );
    } catch (analyticsError) {
      console.error(analyticsError);
      studioAnalyticsError = "YouTube Studio Analytics metrics were unavailable; channel statistics still loaded.";
    }

    return res.json({
      success: true,

      data: {
        channelName:
          channel.snippet?.title,

        subscribers:
          channel.statistics?.subscriberCount,

        totalViews:
          channel.statistics?.viewCount,

        totalVideos:
          channel.statistics?.videoCount,

        description:
          channel.snippet?.description,

        thumbnail:
          channel.snippet?.thumbnails?.high?.url,

        studioAnalytics,
        studioAnalyticsError,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch YouTube analytics",
    });
  }
});

router.post("/snapshot", async (req: AuthRequest, res) => {
  try {

    const account = await findYouTubeAccount(req.userId!);

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const youtube = createYouTubeClient(account);

    const response = await youtube.channels.list({
      id: [account.channelId || ""],
      part: ["statistics"],
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    const snapshot =
      await prisma.analyticsSnapshot.create({
        data: {
          userId: account.userId,

          platform: "YOUTUBE",

          subscribers: Number(
            channel.statistics?.subscriberCount || 0
          ),

          totalViews: Number(
            channel.statistics?.viewCount || 0
          ),

          totalVideos: Number(
            channel.statistics?.videoCount || 0
          ),
        },
      });

    return res.json({
      success: true,
      snapshot,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create snapshot",
    });
  }
});

router.get("/history", async (req: AuthRequest, res) => {
  try {

    const snapshots =
      await prisma.analyticsSnapshot.findMany({
        where: { userId: req.userId!, platform: "YOUTUBE" },
        orderBy: {
          snapshotDate: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

    return res.json({
      success: true,
      count: snapshots.length,
      snapshots,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch history",
    });
  }
});

router.get("/videos", async (req: AuthRequest, res) => {
  try {

    const account = await findYouTubeAccount(req.userId!);

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const youtube = createYouTubeClient(account);

    // STEP 1: Get latest uploads

    const searchResponse = await youtube.search.list({
      channelId: account.channelId || "",
      part: ["snippet"],
      order: "date",
      maxResults: 10,
      type: ["video"],
    });

    const videoIds =
      searchResponse.data.items
        ?.map((item) => item.id?.videoId)
        .filter(Boolean) as string[];

    if (!videoIds.length) {
      return res.json({
        success: true,
        videos: [],
      });
    }

    // STEP 2: Fetch detailed statistics

    const videosResponse = await youtube.videos.list({
      id: videoIds,
      part: [
        "snippet",
        "statistics",
        "contentDetails",
      ],
    });

    const videos =
      videosResponse.data.items?.map((video) => ({
        id: video.id,

        title: video.snippet?.title,

        description:
          video.snippet?.description,

        publishedAt:
          video.snippet?.publishedAt,

        thumbnail:
          video.snippet?.thumbnails?.high?.url,

        views:
          video.statistics?.viewCount,

        likes:
          video.statistics?.likeCount,

        comments:
          video.statistics?.commentCount,

        duration:
          video.contentDetails?.duration,
      })) || [];

    return res.json({
      success: true,
      count: videos.length,
      videos,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch video analytics",
    });
  }
});

export default router;