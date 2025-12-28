const express = require('express');
const auth = require('../middleware/auth');
const { listTasks, summary, complete } = require('../controllers/gamifyController');

const router = express.Router();

router.use(auth);
router.get('/tasks', listTasks);
router.get('/summary', summary);
router.post('/complete', complete);

module.exports = router;
