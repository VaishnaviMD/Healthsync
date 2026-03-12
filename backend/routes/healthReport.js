const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/healthReportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getReport);

module.exports = router;
