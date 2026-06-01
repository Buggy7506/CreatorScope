import { Router } from "express";
import { google } from "googleapis";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

router.get("/", async (_, res) => {

  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  return res.redirect(url);
});

router.get("/callback", async (req, res) => {
  try {

    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({
        message: "Missing code",
      });
    }

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const me = await oauth2.userinfo.get();

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const channelsResponse = await youtube.channels.list({
      mine: true,
      part: ["snippet"],
    });

    const channel = channelsResponse.data.items?.[0];

    const fakeUserId = "cmpg06gop0000uob8vnbgs947";

    await prisma.connectedAccount.create({
      data: {
        userId: fakeUserId,

        platform: "youtube",

        platformUserId: me.data.id || "",

        username:
          channel?.snippet?.title ||
          me.data.email ||
          "YouTube User",

        channelId: channel?.id || "",

        accessToken: tokens.access_token || "",

        refreshToken: tokens.refresh_token || "",

        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
      },
    });

    return res.json({
      success: true,
      channel: channel?.snippet?.title,
      email: me.data.email,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "YouTube connection failed",
    });
  }
});

export default router;