import express from 'express';
import {downloadPDF, downloadCSV} from '../controllers/reportController.js';
import {protect} from '../middleware/auth.js';

const router = express.Router ();

router.use (protect);

router.get ('/pdf', downloadPDF);
router.get ('/csv', downloadCSV);

export default router;
