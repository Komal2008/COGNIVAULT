import { discoverPatterns } from "../services/geminiService.js";
import {
  getGamification,
  listJournals,
  recordGamificationAction,
} from "../services/firestoreService.js";

export async function getInsightsHandler(req, res) {
  const journals = await listJournals(req.user.uid, 25);
  if (journals.length === 0) return res.json({ insights: null, journalsAnalyzed: 0 });
  const insights = await discoverPatterns({ journals });
  return res.json({ insights, journalsAnalyzed: journals.length });
}

export async function getGamificationHandler(req, res) {
  return res.json(await getGamification(req.user.uid));
}

export async function recordGamificationHandler(req, res) {
  return res.status(200).json(
    await recordGamificationAction(req.user.uid, req.body.action),
  );
}
