const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/aiChatController');
const { protect } = require('../middleware/auth');
router.post('/', protect, chat);
module.exports = router;
