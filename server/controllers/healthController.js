// /server/controllers/healthController.js
import { config } from '../config/secrets.js';

export function healthCheckHandler(_req, res) {
  res.json({
    status: 'ok',
    app: 'Cognivault',
    version: '2.0.0',
    theme: 'Cocoa Sunrise',
    geminiConfigured: Boolean(config.geminiApiKey),
    timestamp: new Date().toISOString(),
  });
}
