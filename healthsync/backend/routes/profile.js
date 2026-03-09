const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/healthControllers');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', getProfile);
router.put('/', updateProfile);
module.exports = router;
