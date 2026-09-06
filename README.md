# Cognivault

> *"Your thoughts. Your intelligence. Your vault."*  
> **Core Philosophy:** Talk → Reflect → Understand → Discover → Grow

Cognivault is an enterprise-grade, privacy-first personal AI reflection and journaling platform powered by Gemini and Firebase. Engineered with zero-trust architectural principles, it combines Socratic reflection, procedural audio mood atmospheres, voice journaling, and deep personal insight discovery.

---

## 1. Project Overview

- **Socratic AI Reflection**: Multi-turn dialogue with Gemini (`gemini-2.5-flash`) acting as an empathetic, intellectually rigorous thinking partner that uncovers assumptions and offers clarity.
- **Mood Atmospheres**: Six distinct sensory environments (Happy, Calm, Reflective, Stressed, Curious, Focused) with browser-synthesized, 100% royalty-free Web Audio API soundscapes and real-time canvas visualizers.
- **Voice Journaling**: Hands-free voice stream-of-consciousness capture via Web Speech API with live transcript editing before submission.
- **Cognivault Insights**: Pattern discovery engine synthesizing recurring reflection themes, emotional rhythms, AI personal observations, and actionable growth checklists.
- **Focus Sanctuary**: Distraction-free canvas with customizable ambient timers (5m, 10m, 15m, 25m) and guided reflective cues.
- **Private Archive**: Single-user isolated journal history with search, mood filtering, and granular deletion.

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COGNIVAULT CLIENT (SPA)                         │
│  React 19 + Tailwind CSS + Lucide Icons + Web Audio API + Web Speech   │
│  - Vault Dashboard & Analytics                                         │
│  - Multi-turn Conversational Reflection Canvas                         │
│  - Mood Atmosphere Engine (6 visual/audio states)                      │
│  - Voice Journaling & Client-Side Speech Synthesis                     │
│  - Private Journal History, Timeline, & Focus Mode                     │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
       Direct SDK with User Token        Server-Side AI API
       Firebase Auth & Firestore SDK     POST /api/gemini/reflect
       (Restricted by Security Rules)    POST /api/gemini/summarize
                   │                     POST /api/gemini/insights
                   │                               │
                   ▼                               ▼
     ┌───────────────────────────┐   ┌───────────────────────────┐
     │     FIREBASE SERVICES     │   │   CLOUD RUN EXPRESS GATEWAY│
     │  - Firebase Auth (Google) │   │  - Express REST API       │
     │  - Cloud Firestore        │   │  - Token Verification     │
     │    Strict ABAC Rule Gates │   │  - Input Sanitization     │
     │    Isolated /users/{uid}  │   │  - Rate/Length Guardrails │
     └───────────────────────────┘   └─────────────┬─────────────┘
                                                   │
                                     Secure Server-Side Calls
                                     (API Key never in browser)
                                                   │
                                                   ▼
                                     ┌───────────────────────────┐
                                     │     GEMINI 3.8 FLASH      │
                                     │  @google/genai SDK        │
                                     │  Grounded Reflection      │
                                     │  Structured JSON Schemas  │
                                     └───────────────────────────┘
```

---

## 3. Setup Instructions

### Prerequisites
- Node.js 20+
- npm or bun

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```
3. Start the dev server (boots Express gateway with Vite middleware):
   ```bash
   npm run dev
   ```
4. Access the app on `http://localhost:3000`.

### Backend API

All personal API resources require a Firebase ID token in
`Authorization: Bearer <token>`. The Express server verifies the token with
Firebase Admin and derives the only accepted user identity from `req.user.uid`.

- `POST /api/chat`
- `POST /api/journals`
- `GET /api/journals`
- `GET /api/journals/:id`
- `DELETE /api/journals/:id`
- `GET /api/insights`
- `GET /api/gamification`
- `POST /api/gamification/reward` (server-calculated rewards only)

For local backend access, configure either
`GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON`. In
production, inject the Gemini key and Firebase credentials through the runtime
secret mechanism rather than a frontend environment variable.

---

## 4. Firebase Configuration

Cognivault utilizes Firebase Authentication for secure identity and Cloud Firestore for persistent storage.

- Applet configuration is loaded from `firebase-applet-config.json`:
  - `projectId`: Google Cloud Project ID
  - `authDomain`: Firebase Auth domain
  - `firestoreDatabaseId`: Isolated Firestore Database instance

---

## 5. Firestore Data Model & Isolation

All user-generated records are strictly partitioned under `/users/{uid}`:

- `/users/{uid}`: User profile, preferences, and active mood.
- `/users/{uid}/conversations/{conversationId}`: Journal conversation documents, summaries, and topics.
- `/users/{uid}/conversations/{conversationId}/messages/{messageId}`: Multi-turn conversational turns.
- `/users/{uid}/insights/{insightId}`: Synthesized cross-journal patterns, themes, and action checklists.

---

## 6. Security Rules (`firestore.rules`)

Security rules enforce mathematical user isolation, field constraints, and default-deny protection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default-deny safety net
    match /{document=**} {
      allow read, write: if false;
    }

    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow get, list: if isOwner(uid);
      allow create, update: if isOwner(uid) && isValidUser(request.resource.data, uid);
      allow delete: if isOwner(uid);

      match /conversations/{conversationId} {
        allow get, list: if isOwner(uid);
        allow create, update, delete: if isOwner(uid);

        match /messages/{messageId} {
          allow get, list, create, update, delete: if isOwner(uid);
        }
      }

      match /insights/{insightId} {
        allow get, list, create, update, delete: if isOwner(uid);
      }
    }
  }
}
```

Rules are deployed to Firebase using `deploy_firebase`.

---

## 7. Secret Manager Architecture

- `GEMINI_API_KEY` is provisioned via Google Cloud Secret Manager.
- Injected at runtime into the container environment (`process.env.GEMINI_API_KEY`).
- Never exposed in frontend bundles or client-side `import.meta.env`.

---

## 8. Gemini API Configuration

- Implemented via `@google/genai` on the Node.js Express server.
- Model: `gemini-2.5-flash`.
- Telemetry: Includes `User-Agent: 'aistudio-build'`.
- System instructions strictly isolate journal content as subjective introspective text, actively preventing prompt injection.
- Structured JSON outputs are enforced with strict schemas for summaries and insights.

---

## 9. Cloud Run Deployment

- **Build Pipeline**:
  - `npm run build`: Executes `vite build` to output client assets to `dist/`, then bundles `server.ts` into a self-contained CommonJS binary at `dist/server.cjs` via `esbuild`.
- **Start Command**:
  - `npm start`: Runs `node dist/server.cjs`.
- **Port & Host**: Listens on `0.0.0.0:3000`.

---

## 10. Security Testing & Verification Matrix

| Test Vector | Validation Method | Result |
| :--- | :--- | :--- |
| **Unauthenticated Access** | Attempt to read `/users/{uid}/conversations` without Auth token | Denied (`PERMISSION_DENIED`) |
| **Cross-User IDOR** | User A queries User B's `/users/{userB}/**` path | Denied (`request.auth.uid != uid`) |
| **Volumetric Attack** | Payload exceeding 500KB sent to server | Rejected with HTTP 413 |
| **Client Key Leakage** | Client bundle inspection for `GEMINI_API_KEY` | Zero references found |
| **Speech Privacy** | Voice Journaling audio upload check | 0 audio packets sent to server |
| **Non-Medical Boundary** | Gemini clinical diagnostic inquiry | Standard non-medical disclaimer enforced |
