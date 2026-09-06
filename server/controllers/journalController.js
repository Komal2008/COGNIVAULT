import { randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { synthesizeSummary } from "../services/geminiService.js";
import {
  createJournal,
  deleteJournal,
  getJournal,
  listJournals,
} from "../services/firestoreService.js";

export async function createJournalHandler(req, res) {
  const summary = await synthesizeSummary({
    conversationText: `${req.body.userPrompt}\n\n${req.body.geminiResponse}`,
  });
  const now = Timestamp.now();
  const journal = {
    id: randomUUID(),
    title: req.body.title || summary.title || "Reflection",
    mood: req.body.mood,
    userPrompt: req.body.userPrompt,
    geminiResponse: req.body.geminiResponse,
    summary: summary.summary || "",
    topics: Array.isArray(summary.topics) ? summary.topics.slice(0, 10) : [],
    keyInsights: Array.isArray(summary.keyInsights) ? summary.keyInsights.slice(0, 10) : [],
    actionItems: Array.isArray(summary.actionItems) ? summary.actionItems.slice(0, 10) : [],
    createdAt: now,
    updatedAt: now,
  };
  await createJournal(req.user.uid, journal);
  return res.status(201).json(journal);
}

export async function listJournalsHandler(req, res) {
  const journals = await listJournals(req.user.uid);
  return res.json({ journals });
}

export async function getJournalHandler(req, res) {
  const journal = await getJournal(req.user.uid, req.params.id);
  if (!journal) return res.status(404).json({ error: "Journal not found." });
  return res.json(journal);
}

export async function deleteJournalHandler(req, res) {
  const journal = await getJournal(req.user.uid, req.params.id);
  if (!journal) return res.status(404).json({ error: "Journal not found." });
  await deleteJournal(req.user.uid, req.params.id);
  return res.status(204).send();
}
