import { Router } from "express";
import { google } from "googleapis";

import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";

const router = Router();

router.get("/analytics", async (_, res) => {
  try {

    const account = await prisma.connectedAccount.findFirst({
      where: {
        platform: "youtube",
      },
    });

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken || "",
      refresh_token: account.refreshToken || "",
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

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
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch YouTube analytics",
    });
  }
});

router.post("/snapshot", async (_, res) => {
  try {

    const account = await prisma.connectedAccount.findFirst({
      where: {
        platform: "youtube",
      },
    });

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken || "",
      refresh_token: account.refreshToken || "",
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

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

          platform: "youtube",

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

router.get("/history", async (_, res) => {
  try {

    const snapshots =
      await prisma.analyticsSnapshot.findMany({
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

router.get("/videos", async (_, res) => {
  try {

    const account = await prisma.connectedAccount.findFirst({
      where: {
        platform: "youtube",
      },
    });

    if (!account) {
      return res.status(404).json({
        message: "YouTube account not connected",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: account.accessToken || "",
      refresh_token: account.refreshToken || "",
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

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