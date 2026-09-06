// /server/routes/geminiRoutes.js
import { Router } from 'express';
import {
  reflectHandler,
  summarizeHandler,
  insightsHandler,
  dailyPromptHandler,
  morningRitualHandler,
  oneQuestionDeeperHandler,
  thoughtToActionHandler,
  noteForTomorrowHandler,
  eveningReflectionHandler,
  reflectionMirrorHandler,
  tinyWinHandler,
  dailyQuestHandler,
} from '../controllers/geminiController.js';
import {
  validateReflectInput,
  validateSummarizeInput,
  validateInsightsInput,
  validateGeminiUtilityInput,
} from '../middleware/validate.js';
import { requireAuthMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoints use optionalAuthMiddleware to capture authenticated user UID while allowing seamless guest exploration
router.post('/reflect', requireAuthMiddleware, validateReflectInput, reflectHandler);
router.post('/summarize', requireAuthMiddleware, validateSummarizeInput, summarizeHandler);
router.post('/insights', requireAuthMiddleware, validateInsightsInput, insightsHandler);
router.post('/daily-prompt', requireAuthMiddleware, dailyPromptHandler);

// Signature Reflection Ritual Endpoints
router.post('/morning-ritual', requireAuthMiddleware, validateGeminiUtilityInput, morningRitualHandler);
router.post('/one-question-deeper', requireAuthMiddleware, validateGeminiUtilityInput, oneQuestionDeeperHandler);
router.post('/thought-to-action', requireAuthMiddleware, validateGeminiUtilityInput, thoughtToActionHandler);
router.post('/note-for-tomorrow', requireAuthMiddleware, validateGeminiUtilityInput, noteForTomorrowHandler);
router.post('/evening-reflection', requireAuthMiddleware, validateGeminiUtilityInput, eveningReflectionHandler);
router.post('/reflection-mirror', requireAuthMiddleware, validateGeminiUtilityInput, reflectionMirrorHandler);
router.post('/tiny-win', requireAuthMiddleware, validateGeminiUtilityInput, tinyWinHandler);

// Gamification & Quests
router.post('/daily-quest', requireAuthMiddleware, validateGeminiUtilityInput, dailyQuestHandler);

export default router;
