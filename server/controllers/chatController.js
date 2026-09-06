import { randomUUID } from "node:crypto";
import { generateReflection } from "../services/geminiService.js";
import {
  appendConversationMessages,
  loadConversation,
} from "../services/firestoreService.js";

export async function chatHandler(req, res) {
  const { uid } = req.user;
  const conversationId = req.body.conversationId || randomUUID();
  const existing = await loadConversation(uid, conversationId);
  const history = existing.messages
    .filter((message) => message.role === "user" || message.role === "model")
    .map((message) => ({ role: message.role, content: String(message.content || "") }));

  const reply = await generateReflection({
    message: req.body.message.trim(),
    mood: req.body.mood || "reflective",
    history,
  });
  const userMessage = {
    id: randomUUID(),
    role: "user",
    content: req.body.message.trim(),
    timestamp: Date.now(),
  };
  const modelMessage = {
    id: randomUUID(),
    role: "model",
    content: reply,
    timestamp: Date.now(),
  };

  await appendConversationMessages(uid, conversationId, userMessage, modelMessage);
  return res.status(200).json({ conversationId, reply, messages: [userMessage, modelMessage] });
}
