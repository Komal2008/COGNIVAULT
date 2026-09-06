// /server/routes/healthRoutes.js
import { Router } from 'express';
import { healthCheckHandler } from '../controllers/healthController.js';

const router = Router();

router.get('/health', healthCheckHandler);

export default router;
