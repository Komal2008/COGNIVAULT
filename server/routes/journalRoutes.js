import { Router } from "express";
import {
  createJournalHandler,
  deleteJournalHandler,
  getJournalHandler,
  listJournalsHandler,
} from "../controllers/journalController.js";
import { requireAuthMiddleware } from "../middleware/authMiddleware.js";
import {
  validateIdParam,
  validateJournalInput,
} from "../middleware/validate.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.use(requireAuthMiddleware);
router.post("/", validateJournalInput, asyncHandler(createJournalHandler));
router.get("/", asyncHandler(listJournalsHandler));
router.get("/:id", validateIdParam, asyncHandler(getJournalHandler));
router.delete("/:id", validateIdParam, asyncHandler(deleteJournalHandler));
export default router;
