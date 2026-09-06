import { adminAuth } from "../services/firebaseAdmin.js";

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export async function requireAuthMiddleware(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: Boolean(decodedToken.email_verified),
    };
    return next();
  } catch (error) {
    console.warn("Firebase ID token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}

export async function optionalAuthMiddleware(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      emailVerified: Boolean(decodedToken.email_verified),
    };
  } catch {
    // Optional routes remain usable without authentication; no unverified identity is attached.
  }
  return next();
}
