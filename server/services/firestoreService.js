import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin.js";

const userCollection = (uid, collectionName) =>
  adminDb.collection("users").doc(uid).collection(collectionName);

export async function loadConversation(uid, conversationId) {
  const conversationRef = userCollection(uid, "conversations").doc(conversationId);
  const [conversationSnapshot, messagesSnapshot] = await Promise.all([
    conversationRef.get(),
    conversationRef.collection("messages").orderBy("timestamp", "asc").limit(40).get(),
  ]);

  return {
    exists: conversationSnapshot.exists,
    data: conversationSnapshot.exists ? conversationSnapshot.data() : null,
    messages: messagesSnapshot.docs.map((doc) => doc.data()),
  };
}

export async function appendConversationMessages(uid, conversationId, userMessage, modelMessage) {
  const conversationRef = userCollection(uid, "conversations").doc(conversationId);
  const batch = adminDb.batch();
  const now = FieldValue.serverTimestamp();
  const existingConversation = await conversationRef.get();
  const conversationData = {
    id: conversationId,
    title: existingConversation.exists
      ? existingConversation.data()?.title || "Reflection Session"
      : "Reflection Session",
    updatedAt: now,
  };
  if (!existingConversation.exists) conversationData.createdAt = now;

  batch.set(
    conversationRef,
    conversationData,
    { merge: true },
  );
  batch.set(conversationRef.collection("messages").doc(userMessage.id), userMessage);
  batch.set(conversationRef.collection("messages").doc(modelMessage.id), modelMessage);
  await batch.commit();
}

export async function createJournal(uid, journal) {
  const ref = userCollection(uid, "journals").doc(journal.id);
  await ref.set({
    ...journal,
    createdAt: journal.createdAt || Timestamp.now(),
    updatedAt: journal.updatedAt || Timestamp.now(),
  });
  return ref;
}

export async function listJournals(uid, limit = 50) {
  const snapshot = await userCollection(uid, "journals")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getJournal(uid, journalId) {
  const snapshot = await userCollection(uid, "journals").doc(journalId).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function deleteJournal(uid, journalId) {
  await userCollection(uid, "journals").doc(journalId).delete();
}

export async function getGamification(uid) {
  const snapshot = await userCollection(uid, "gamification").doc("stats").get();
  return snapshot.exists
    ? snapshot.data()
    : {
        xp: 0,
        level: 1,
        streak: 0,
        reflectionsCount: 0,
        badges: [],
        journeyProgress: 0,
      };
}

export async function recordGamificationAction(uid, action) {
  const ref = userCollection(uid, "gamification").doc("stats");
  const rewardByAction = { reflection: 15, voiceJournal: 20, insight: 10 };
  const reward = rewardByAction[action];
  if (!reward) throw new Error("Unsupported gamification action.");

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? snapshot.data() : {};
    const xp = Number(current.xp) || 0;
    const reflectionsCount = Number(current.reflectionsCount) || 0;
    const nextXp = xp + reward;
    const level = Math.floor(nextXp / 50) + 1;
    const next = {
      xp: nextXp,
      level,
      streak: Number(current.streak) || 0,
      reflectionsCount: action === "reflection" ? reflectionsCount + 1 : reflectionsCount,
      badges: Array.isArray(current.badges) ? current.badges : [],
      journeyProgress: nextXp % 50,
      updatedAt: FieldValue.serverTimestamp(),
    };
    transaction.set(ref, next, { merge: true });
    return next;
  });
}
