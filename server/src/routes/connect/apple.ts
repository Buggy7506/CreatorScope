import { Router } from "express";

import { env } from "../../config/env";

const router = Router();

router.get("/", async (_, res) => {
  if (!env.APPLE_CLIENT_ID || !env.APPLE_REDIRECT_URI) {
    return res.status(501).json({ message: "Apple Sign-In not configured. Set APPLE_CLIENT_ID and APPLE_REDIRECT_URI in .env." });
  }

  // Apple Sign In requires a client secret JWT and a specific authorization URL.
  // For now we return a helpful message until credentials are provided.
  return res.status(501).json({ message: "Apple Sign-In placeholder. Configure APPLE_CLIENT_ID/APPLE_REDIRECT_URI and implement the callback when ready." });
});

export default router;
