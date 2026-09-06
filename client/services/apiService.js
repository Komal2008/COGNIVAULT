// /client/services/apiService.js
// Client API service: Communicates exclusively with the Node.js backend.
// The browser NEVER touches or possesses the Gemini API key.

import { auth } from '../../src/lib/firebase';

/**
 * Retrieves the current user's Firebase ID token to authenticate API calls.
 */
async function getAuthToken() {
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (err) {
    console.warn('Could not fetch Firebase ID token:', err);
    return null;
  }
}

/**
 * Calls Node.js backend to get Socratic reflection from Gemini.
 */
export async function fetchReflection({ message, mood, history }) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/gemini/reflect', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, mood, history }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to synthesize a reflection summary from a journal conversation.
 */
export async function fetchSummary({ conversationText, currentMood }) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationText, currentMood }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to discover patterns and compile holistic insights across entries.
 */
export async function fetchInsights({ journals }) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/gemini/insights', {
    method: 'POST',
    headers,
    body: JSON.stringify({ journals }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to fetch a thoughtful daily reflection prompt from Gemini.
 */
export async function fetchDailyPrompt({ mood, userHistorySummary } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/gemini/daily-prompt', {
    method: 'POST',
    headers,
    body: JSON.stringify({ mood, userHistorySummary }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend for Morning Ritual grounding thought and reflection question.
 */
export async function fetchMorningRitual({ mood, userHistorySummary } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/morning-ritual', {
    method: 'POST',
    headers,
    body: JSON.stringify({ mood, userHistorySummary }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to ask ONE meaningful question deeper.
 */
export async function fetchOneQuestionDeeper({ history, lastMessage } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/one-question-deeper', {
    method: 'POST',
    headers,
    body: JSON.stringify({ history, lastMessage }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to identify a Thought → Action recommendation.
 */
export async function fetchThoughtToAction({ conversationText } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/thought-to-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to craft A Note for Tomorrow.
 */
export async function fetchNoteForTomorrow({ conversationText } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/note-for-tomorrow', {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to synthesize Evening Reflection.
 */
export async function fetchEveningReflection({ prideItem, mood } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/evening-reflection', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prideItem, mood }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend for Reflection Mirror insights.
 */
export async function fetchReflectionMirror({ journals, exploreTheme } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/reflection-mirror', {
    method: 'POST',
    headers,
    body: JSON.stringify({ journals, exploreTheme }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to detect Tiny Wins.
 */
export async function fetchTinyWin({ conversationText } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/tiny-win', {
    method: 'POST',
    headers,
    body: JSON.stringify({ conversationText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Calls Node.js backend to generate Daily Reflection Quest.
 */
export async function fetchDailyQuest({ mood, userHistorySummary } = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/gemini/daily-quest', {
    method: 'POST',
    headers,
    body: JSON.stringify({ mood, userHistorySummary }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}
