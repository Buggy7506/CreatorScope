import { Router } from "express";

import youtubeRoutes from "./youtube";
import googleRoutes from "./google";
import microsoftRoutes from "./microsoft";
import appleRoutes from "./apple";

const router = Router();

router.use("/youtube", youtubeRoutes);
router.use("/google", googleRoutes);
router.use("/microsoft", microsoftRoutes);
router.use("/apple", appleRoutes);

export default router;