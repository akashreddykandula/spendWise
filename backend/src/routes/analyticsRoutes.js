import express from 'express';
import {getOverview} from '../controllers/analyticsController.js';
import {protect} from '../middleware/auth.js';

const router = express.Router ();

router.get ('/overview', protect, getOverview);

export default router;

import {getAdvancedAnalytics,
} from '../controllers/analyticsController.js';

router.get ('/advanced', protect, getAdvancedAnalytics);
