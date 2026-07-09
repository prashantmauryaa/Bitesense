const express = require('express');
const { create, list, remove } = require('../controllers/meals.controller');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../lib/async-handler');

const router = express.Router();

router.post('/', requireAuth, asyncHandler(create));
router.get('/', requireAuth, asyncHandler(list));
router.delete('/:id', requireAuth, asyncHandler(remove));

module.exports = router;
