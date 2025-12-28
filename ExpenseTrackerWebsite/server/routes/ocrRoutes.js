const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const { scanReceipt } = require('../controllers/ocrController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'receipts');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `receipt-${timestamp}${ext}`);
  },
});

const upload = multer({ storage });
const router = express.Router();

router.use(auth);
router.post('/receipt', upload.single('file'), scanReceipt);

module.exports = router;
