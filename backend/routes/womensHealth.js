const express = require('express');
const router = express.Router();
const { getCycles, addCycle, getPredictions } = require('../controllers/womensHealthController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCycles);
router.get('/predictions', getPredictions);
router.post('/', addCycle);

module.exports = router;
