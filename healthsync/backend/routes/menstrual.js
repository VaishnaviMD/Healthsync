const router = require('express').Router();
const { getCycle, saveCycle } = require('../controllers/menstrualController');
const auth = require('../middleware/auth');

router.get('/', auth, getCycle);
router.post('/', auth, saveCycle);

module.exports = router;
