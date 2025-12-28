const User = require('../models/userModel');
const Expense = require('../models/expenseModel');

// GET /api/settings
exports.getSettings = async (req, res) => {
  res.json({ success: true, data: req.user.settings || {} });
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const currentSettings = req.user?.settings?.toObject
      ? req.user.settings.toObject()
      : (req.user?.settings || {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: { ...currentSettings, ...req.body } },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: user.settings });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Unable to update settings' });
  }
};

// DELETE /api/settings/account
exports.deleteAccount = async (req, res) => {
  try {
    await Expense.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to delete account' });
  }
};
