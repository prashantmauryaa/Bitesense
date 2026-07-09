const express = require('express');
const { getProfile, putProfile } = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../lib/async-handler');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(getProfile));
router.put('/', requireAuth, asyncHandler(putProfile));

module.exports = router;
