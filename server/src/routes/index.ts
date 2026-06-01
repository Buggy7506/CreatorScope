import { Router } from "express";

import authRoutes from "./auth";

import connectRoutes from "./connect";

import youtubeRoutes from "./youtube";

import aiRoutes from "./ai";

const router = Router();

router.use("/auth", authRoutes);

router.use("/connect", connectRoutes);

router.use("/youtube", youtubeRoutes);

router.use("/ai", aiRoutes);

export default router;