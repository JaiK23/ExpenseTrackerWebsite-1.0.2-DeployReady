const express = require('express');
const auth = require('../middleware/auth');
const { generatePdf } = require('../controllers/reportController');

const router = express.Router();

router.use(auth);
router.get('/pdf', generatePdf);

module.exports = router;
