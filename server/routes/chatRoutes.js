import { Router } from "express";
import { chatHandler } from "../controllers/chatController.js";
import { requireAuthMiddleware } from "../middleware/authMiddleware.js";
import { validateChatInput } from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.post("/", requireAuthMiddleware, validateChatInput, asyncHandler(chatHandler));
export default router;
