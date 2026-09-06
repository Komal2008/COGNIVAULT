import { Router } from "express";
import {
  getGamificationHandler,
  getInsightsHandler,
  recordGamificationHandler,
} from "../controllers/userDataController.js";
import { requireAuthMiddleware } from "../middleware/authMiddleware.js";
import { validateGamificationAction } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.use(requireAuthMiddleware);
router.get("/insights", asyncHandler(getInsightsHandler));
router.get("/gamification", asyncHandler(getGamificationHandler));
router.post("/gamification/reward", validateGamificationAction, asyncHandler(recordGamificationHandler));
export default router;
