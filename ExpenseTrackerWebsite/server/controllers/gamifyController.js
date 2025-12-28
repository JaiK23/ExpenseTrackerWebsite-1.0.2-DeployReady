const { TASKS, addPoints, completeTask, getSummary } = require('../services/gamifyService');

// GET /api/gamify/tasks
exports.listTasks = async (req, res) => {
  res.json({ success: true, data: TASKS });
};

// GET /api/gamify/summary
exports.summary = async (req, res) => {
  const progress = await getSummary(req.user.id);
  res.json({ success: true, data: progress });
};

// POST /api/gamify/complete
exports.complete = async (req, res) => {
  try {
    const { taskId } = req.body;
    const result = await completeTask(req.user.id, taskId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/gamify/spend
exports.rewardForSpend = async (userId, amount) => {
  // Award 1 karma per currency unit spent
  const points = Math.max(1, Math.round(Number(amount || 0)));
  await addPoints(userId, points);
};
