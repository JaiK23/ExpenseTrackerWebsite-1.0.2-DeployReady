const express = require('express');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET all expenses
router.get('/expenses', getExpenses);

// POST create expense
router.post('/expenses', createExpense);

// PUT update expense
router.put('/expenses/:id', updateExpense);

// DELETE expense
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
