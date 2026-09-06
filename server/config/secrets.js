// /server/config/secrets.js
// Enterprise-grade secret resolver with Google Cloud Secret Manager support and local env fallback

import dotenv from 'dotenv';
dotenv.config();

/**
 * Resolves secret from environment or Google Cloud Secret Manager.
 * In Cloud Run, Secret Manager secrets are mounted as environment variables or accessed via metadata.
 */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0395567775',
  firebaseDatabaseId:
    process.env.FIREBASE_DATABASE_ID ||
    'ai-studio-cognivault-bb281c1f-91d0-45e0-8d8d-55493adb2b1d',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  maxPayloadSize: '500kb',
};

/**
 * Validate that critical secrets are available before invoking external AI APIs.
 */
export function getGeminiKey() {
  const key = config.geminiApiKey;
  if (!key || key === 'replace-with-gemini-api-key') {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please supply it securely in Google Cloud Secret Manager or .env');
  }
  return key;
}
