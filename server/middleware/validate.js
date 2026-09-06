// /server/middleware/validate.js
// Input validation and volumetric boundary enforcement for Cognivault API

export function validateReflectInput(req, res, next) {
  const { message, mood, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'A valid text message is required for reflection.' });
  }

  if (message.length > 8000) {
    return res.status(400).json({ error: 'Message exceeds the 8,000 character security limit.' });
  }

  if (history && (!Array.isArray(history) || history.length > 30)) {
    return res.status(400).json({ error: 'Conversation history exceeds maximum turn limit of 30.' });
  }
  if (
    history &&
    history.some(
      (item) =>
        !item ||
        !['user', 'model'].includes(item.role) ||
        typeof item.content !== 'string' ||
        item.content.length > 8000,
    )
  ) {
    return res.status(400).json({ error: 'Conversation history contains an invalid message.' });
  }

  const allowedMoods = ['happy', 'calm', 'reflective', 'stressed', 'curious', 'focused'];
  if (mood && !allowedMoods.includes(mood.toLowerCase())) {
    return res.status(400).json({ error: 'Mood is not supported.' });
  }

  next();
}

export function validateChatInput(req, res, next) {
  const { message, conversationId } = req.body || {};
  if (typeof message !== "string" || !message.trim() || message.length > 8000) {
    return res.status(400).json({ error: "Message must be between 1 and 8,000 characters." });
  }
  if (conversationId !== undefined && !isSafeId(conversationId)) {
    return res.status(400).json({ error: "Conversation ID is invalid." });
  }
  return next();
}

export function validateJournalInput(req, res, next) {
  const { title, mood, userPrompt, geminiResponse } = req.body || {};
  const allowedMoods = ['happy', 'calm', 'reflective', 'stressed', 'curious', 'focused'];
  if (title !== undefined && (typeof title !== "string" || title.length > 150)) {
    return res.status(400).json({ error: "Title must be 150 characters or fewer." });
  }
  if (!allowedMoods.includes(mood)) {
    return res.status(400).json({ error: "Mood is not supported." });
  }
  if (typeof userPrompt !== "string" || userPrompt.length > 8000) {
    return res.status(400).json({ error: "User prompt is required and must be 8,000 characters or fewer." });
  }
  if (typeof geminiResponse !== "string" || geminiResponse.length > 16000) {
    return res.status(400).json({ error: "Gemini response is required and must be 16,000 characters or fewer." });
  }
  return next();
}

export function validateIdParam(req, res, next) {
  if (!isSafeId(req.params.id)) return res.status(400).json({ error: "Resource ID is invalid." });
  return next();
}

export function validateGamificationAction(req, res, next) {
  if (!["reflection", "voiceJournal", "insight"].includes(req.body?.action)) {
    return res.status(400).json({ error: "Unsupported gamification action." });
  }
  return next();
}

function isSafeId(value) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

export function validateSummarizeInput(req, res, next) {
  const { conversationText } = req.body;

  if (!conversationText || typeof conversationText !== 'string' || conversationText.trim().length === 0) {
    return res.status(400).json({ error: 'Conversation text is required for summarization.' });
  }

  if (conversationText.length > 25000) {
    return res.status(400).json({ error: 'Conversation text exceeds the 25,000 character limit.' });
  }

  next();
}

export function validateInsightsInput(req, res, next) {
  const { journals } = req.body;

  if (!Array.isArray(journals) || journals.length === 0) {
    return res.status(400).json({ error: 'At least one journal entry is required to generate insights.' });
  }

  if (journals.length > 50) {
    return res.status(400).json({ error: 'Cannot process more than 50 journal entries in a single request.' });
  }
  if (
    journals.some(
      (journal) =>
        !journal ||
        (journal.title !== undefined && String(journal.title).length > 150) ||
        (journal.summary !== undefined && String(journal.summary).length > 2000),
    )
  ) {
    return res.status(400).json({ error: 'Journal entries contain oversized fields.' });
  }

  next();
}

export function validateGeminiUtilityInput(req, res, next) {
  const body = req.body || {};
  const stringFields = [
    "conversationText",
    "userHistorySummary",
    "lastMessage",
    "prideItem",
    "exploreTheme",
  ];
  for (const field of stringFields) {
    if (body[field] !== undefined && (typeof body[field] !== "string" || body[field].length > 25000)) {
      return res.status(400).json({ error: `${field} is invalid or too long.` });
    }
  }
  if (body.mood !== undefined && !["happy", "calm", "reflective", "stressed", "curious", "focused"].includes(body.mood)) {
    return res.status(400).json({ error: "Mood is not supported." });
  }
  if (body.history !== undefined && (!Array.isArray(body.history) || body.history.length > 30)) {
    return res.status(400).json({ error: "History exceeds the maximum turn limit." });
  }
  return next();
}
