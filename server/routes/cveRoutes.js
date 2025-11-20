const express = require('express');
const router = express.Router();
const { listCVEs, getCVE } = require('../controllers/cveController');

router.get('/list', listCVEs);
router.get('/:id', getCVE);

module.exports = router;
