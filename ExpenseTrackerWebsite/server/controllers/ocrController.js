const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');

// --- Helpers ----------------------------------------------------
const normalizeNumber = (txt) => Number((txt || '').replace(/,/g, ''));

const extractNumbers = (text) => {
  const matches = text.match(/\d[\d,]*\.?\d*/g);
  return matches ? matches.map(normalizeNumber).filter((n) => !Number.isNaN(n)) : [];
};

const findAmount = (lines) => {
  const keywordRegex = /(total|amount|balance|grand)/i;
  let best = null;

  lines.forEach((line, idx) => {
    if (keywordRegex.test(line)) {
      const nums = extractNumbers(line);
      if (nums.length) {
        const candidate = Math.max(...nums);
        if (best === null || candidate > best.value) {
          best = { value: candidate, idx };
        }
      }
    }
  });

  // If nothing matched keywords, try the largest number near the end (totals often at bottom)
  if (!best) {
    const flattened = lines
      .map((line, idx) => ({ idx, nums: extractNumbers(line) }))
      .filter((entry) => entry.nums.length);
    if (flattened.length) {
      const tail = flattened.slice(-5); // bias toward bottom
      tail.forEach((entry) => {
        const candidate = Math.max(...entry.nums);
        if (!best || candidate > best.value) {
          best = { value: candidate, idx: entry.idx };
        }
      });
    }
  }

  return best ? best.value : null;
};

const parseDate = (text) => {
  const iso = text.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = text.match(/(\d{2})[./-](\d{2})[./-](\d{2,4})/);
  if (dmy) {
    const [, d, m, yRaw] = dmy;
    const y = yRaw.length === 2 ? `20${yRaw}` : yRaw;
    return `${y}-${m}-${d}`;
  }

  return null;
};

const inferCategory = (text) => {
  const tests = [
    { cat: 'Food', re: /(food|restaurant|cafe|pizza|burger|meal|dine|kitchen)/i },
    { cat: 'Transportation', re: /(uber|ola|taxi|metro|bus|fuel|petrol|diesel|cab|toll)/i },
    { cat: 'Entertainment', re: /(movie|ticket|cinema|netflix|prime|concert|game)/i },
    { cat: 'Shopping', re: /(store|mall|retail|shop|fashion|clothes|apparel|electronics)/i },
    { cat: 'Bills', re: /(bill|electric|water|gas|internet|recharge|broadband)/i },
    { cat: 'Healthcare', re: /(pharma|pharmacy|medical|clinic|hospital|doctor|medicines)/i },
  ];
  for (const t of tests) {
    if (t.re.test(text)) return t.cat;
  }
  return 'Other';
};

const parseReceipt = (text) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const description = lines[0] || 'Receipt';
  const amount = findAmount(lines);
  const date = parseDate(text) || new Date().toISOString().split('T')[0];
  const category = inferCategory(text);

  return {
    description,
    amount,
    date,
    category,
    note: text.slice(0, 240),
  };
};

const preprocessImage = async (inputPath) => {
  // Resize, grayscale, denoise, increase contrast, binarize, auto-rotate
  const buffer = await sharp(inputPath)
    .rotate() // auto orientation / mild deskew
    .resize({ width: 1800, withoutEnlargement: false })
    .grayscale()
    .median(1)
    .normalize()
    .sharpen()
    .threshold(180)
    .toFormat('png')
    .toBuffer();
  return buffer;
};

// --- Controller -------------------------------------------------
// POST /api/ocr/receipt
exports.scanReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const imagePath = req.file.path;
  try {
    const preprocessed = await preprocessImage(imagePath);
    const result = await Tesseract.recognize(preprocessed, 'eng', {
      tessedit_char_whitelist:
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,-/₹: ',
      preserve_interword_spaces: '1',
    });
    const parsed = parseReceipt(result.data.text || '');
    res.json({
      success: true,
      data: parsed,
      raw: result.data.text,
    });
  } catch (err) {
    console.error('OCR error', err);
    res.status(500).json({ success: false, message: 'Failed to read receipt' });
  } finally {
    fs.unlink(imagePath, () => {});
  }
};
