import { Router } from "express";
import { google } from "googleapis";

import { env } from "../../config/env";

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

router.get("/", async (_, res) => {
  const scopes = ["openid", "email", "profile"];

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
      return res.status(400).json({ message: "Missing code" });
    }

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });

    const me = await oauth2.userinfo.get();

    return res.json({ success: true, user: me.data, tokens });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Google sign-in failed" });
  }
});

export default router;
