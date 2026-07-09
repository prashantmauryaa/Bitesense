const express = require('express');
const { analyze, history, historyDetail } = require('../controllers/menu.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../lib/async-handler');

const router = express.Router();

router.post('/analyze', requireAuth, asyncHandler(analyze));
router.get('/history', requireAuth, asyncHandler(history));
router.get('/history/:id', requireAuth, asyncHandler(historyDetail));

module.exports = router;
