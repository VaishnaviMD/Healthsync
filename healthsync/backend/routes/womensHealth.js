const express = require('express');
const router = express.Router();
const { getCycles, addCycle } = require('../controllers/womensHealthController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCycles);
router.post('/', addCycle);

module.exports = router;
