// /server/controllers/geminiController.js
// Handles incoming reflection requests and proxies to Gemini service

import {
  generateReflection,
  synthesizeSummary,
  discoverPatterns,
  generateDailyReflectionPrompt,
  generateMorningRitual,
  generateOneQuestionDeeper,
  generateThoughtToAction,
  generateNoteForTomorrow,
  generateEveningReflection,
  generateReflectionMirror,
  detectTinyWin,
  generateDailyQuest,
  getGeminiErrorMessage,
} from '../services/geminiService.js';

export async function reflectHandler(req, res) {
  try {
    const { message, mood, history } = req.body;
    const reply = await generateReflection({ message, mood, history });
    return res.json({ reply });
  } catch (error) {
    const diagnostic = getGeminiErrorMessage(error);
    console.error('Gemini request failed:', diagnostic);
    if (error?.isGeminiUnavailable) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
      });
    }
    return res.status(500).json({ error: 'Gemini reflection failed. Please try again.' });
  }
}

export async function summarizeHandler(req, res) {
  try {
    const { conversationText } = req.body;
    const summary = await synthesizeSummary({ conversationText });
    return res.json(summary);
  } catch (error) {
    const diagnostic = getGeminiErrorMessage(error);
    console.error('Gemini summary request failed:', diagnostic);
    if (error?.isGeminiUnavailable) {
      return res.status(503).json({
        error: 'Gemini is temporarily busy. Please try again in a moment.',
      });
    }
    return res.status(500).json({ error: 'Gemini summary failed. Please try again.' });
  }
}

export async function insightsHandler(req, res) {
  try {
    const { journals } = req.body;
    const insights = await discoverPatterns({ journals });
    return res.json(insights);
  } catch (error) {
    console.error('Insights controller error:', error.message);
    return res.status(500).json({
      error: 'Unable to compile reflection insights across entries.',
    });
  }
}

export async function dailyPromptHandler(req, res) {
  try {
    const { mood, userHistorySummary } = req.body || {};
    const promptData = await generateDailyReflectionPrompt({ mood, userHistorySummary });
    return res.json(promptData);
  } catch (error) {
    console.error('Daily prompt controller error:', error.message);
    return res.status(500).json({
      error: 'Unable to generate daily reflection prompt.',
    });
  }
}

export async function morningRitualHandler(req, res) {
  try {
    const { mood, userHistorySummary } = req.body || {};
    const ritual = await generateMorningRitual({ mood, userHistorySummary });
    return res.json(ritual);
  } catch (error) {
    console.error('Morning ritual controller error:', error.message);
    return res.status(500).json({
      error: 'Unable to generate morning ritual.',
    });
  }
}

export async function oneQuestionDeeperHandler(req, res) {
  try {
    const { history, lastMessage } = req.body || {};
    const result = await generateOneQuestionDeeper({ history, lastMessage });
    return res.json(result);
  } catch (error) {
    console.error('One Question Deeper error:', error.message);
    return res.status(500).json({
      error: 'Unable to formulate deeper question right now.',
    });
  }
}

export async function thoughtToActionHandler(req, res) {
  try {
    const { conversationText } = req.body || {};
    const result = await generateThoughtToAction({ conversationText });
    return res.json(result);
  } catch (error) {
    console.error('Thought to Action error:', error.message);
    return res.status(500).json({
      error: 'Unable to extract action step.',
    });
  }
}

export async function noteForTomorrowHandler(req, res) {
  try {
    const { conversationText } = req.body || {};
    const result = await generateNoteForTomorrow({ conversationText });
    return res.json(result);
  } catch (error) {
    console.error('Note for tomorrow error:', error.message);
    return res.status(500).json({
      error: 'Unable to generate note for tomorrow.',
    });
  }
}

export async function eveningReflectionHandler(req, res) {
  try {
    const { prideItem, mood } = req.body || {};
    const result = await generateEveningReflection({ prideItem, mood });
    return res.json(result);
  } catch (error) {
    console.error('Evening reflection error:', error.message);
    return res.status(500).json({
      error: 'Unable to synthesize evening reflection.',
    });
  }
}

export async function reflectionMirrorHandler(req, res) {
  try {
    const { journals, exploreTheme } = req.body || {};
    const result = await generateReflectionMirror({ journals, exploreTheme });
    return res.json(result);
  } catch (error) {
    console.error('Reflection mirror error:', error.message);
    return res.status(500).json({
      error: 'Unable to generate reflection mirror.',
    });
  }
}

export async function tinyWinHandler(req, res) {
  try {
    const { conversationText } = req.body || {};
    const result = await detectTinyWin({ conversationText });
    return res.json(result);
  } catch (error) {
    console.error('Tiny win detector error:', error.message);
    return res.status(500).json({
      error: 'Unable to analyze tiny wins.',
    });
  }
}

export async function dailyQuestHandler(req, res) {
  try {
    const { mood, userHistorySummary } = req.body || {};
    const result = await generateDailyQuest({ mood, userHistorySummary });
    return res.json(result);
  } catch (error) {
    console.error('Daily quest controller error:', error.message);
    return res.status(500).json({
      error: 'Unable to generate daily quest.',
    });
  }
}
