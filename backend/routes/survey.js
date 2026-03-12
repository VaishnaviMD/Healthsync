const express = require('express');
const router = express.Router();
const { submitSurvey, getSurveyStatus } = require('../controllers/surveyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/status', getSurveyStatus);
router.post('/submit', submitSurvey);

module.exports = router;
