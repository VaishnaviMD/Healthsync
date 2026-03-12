const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, updateMedicine, deleteMedicine, getAdherence } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMedicines);
router.get('/adherence', getAdherence);
router.post('/', addMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
