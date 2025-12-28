const Expense = require("../models/expenseModel");
const { rewardForSpend } = require("./gamifyController");

// GET all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching expenses",
      error: error.message
    });
  }
};

// POST create expense
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user.id });
    await rewardForSpend(req.user.id, expense.amount);

    return res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Error creating expense",
      error: error.message
    });
  }
};

// PUT update expense
exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Error updating expense",
      error: error.message
    });
  }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    return res.json({
      success: true,
      message: "Expense deleted"
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Error deleting expense",
      error: error.message
    });
  }
};
