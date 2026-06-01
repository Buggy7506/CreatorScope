import { Router } from "express";
import axios from "axios";
import querystring from "querystring";

import { env } from "../../config/env";

const router = Router();

router.get("/", async (_, res) => {
  if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_REDIRECT_URI) {
    return res.status(501).json({ message: "Microsoft OAuth not configured. Set MICROSOFT_CLIENT_ID and MICROSOFT_REDIRECT_URI in .env." });
  }

  const params = querystring.stringify({
    client_id: env.MICROSOFT_CLIENT_ID,
    response_type: "code",
    redirect_uri: env.MICROSOFT_REDIRECT_URI,
    response_mode: "query",
    scope: "openid profile email",
    state: "",
  });

  return res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`);
});

router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code as string;

    if (!code) return res.status(400).json({ message: "Missing code" });

    if (!env.MICROSOFT_CLIENT_SECRET) {
      return res.status(501).json({ message: "Microsoft client secret not configured. Set MICROSOFT_CLIENT_SECRET in .env to exchange token." });
    }

    const tokenRes = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      querystring.stringify({
        client_id: env.MICROSOFT_CLIENT_ID,
        scope: "openid profile email",
        code,
        redirect_uri: env.MICROSOFT_REDIRECT_URI,
        grant_type: "authorization_code",
        client_secret: env.MICROSOFT_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return res.json({ success: true, tokens: tokenRes.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Microsoft sign-in failed" });
  }
});

export default router;
