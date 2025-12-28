const User = require('../models/userModel');

const LEVEL_STEP = 1000;

const TASKS = [
  { id: 'daily-read', type: 'daily', title: 'Read a book', points: 20 },
  { id: 'weekly-code', type: 'weekly', title: 'Program in a language', points: 100 },
  { id: 'monthly-boss', type: 'monthly', title: 'Develop project / Get certificates', points: 1000 },
];

const canComplete = (user, task) => {
  const now = new Date();
  const { progress } = user;

  if (task.type === 'daily' && progress.lastDailyAt) {
    const last = new Date(progress.lastDailyAt);
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    ) return false;
  }

  if (task.type === 'weekly' && progress.lastWeeklyAt) {
    const last = new Date(progress.lastWeeklyAt);
    const diffDays = (now - last) / (1000 * 60 * 60 * 24);
    if (diffDays < 7) return false;
  }

  if (task.type === 'monthly' && progress.lastMonthlyAt) {
    const last = new Date(progress.lastMonthlyAt);
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth()
    ) return false;
  }

  return true;
};

const addPoints = async (userId, points) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.progress.karma += points;
  user.progress.level = Math.max(1, Math.floor(user.progress.karma / LEVEL_STEP) + 1);
  await user.save();

  return user.progress;
};

const completeTask = async (userId, taskId) => {
  const task = TASKS.find((t) => t.id === taskId);
  if (!task) throw new Error('Task not found');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (!canComplete(user, task)) {
    throw new Error('Task already completed for this period');
  }

  const now = new Date();
  if (task.type === 'daily') user.progress.lastDailyAt = now;
  if (task.type === 'weekly') user.progress.lastWeeklyAt = now;
  if (task.type === 'monthly') user.progress.lastMonthlyAt = now;

  user.progress.karma += task.points;
  user.progress.level = Math.max(1, Math.floor(user.progress.karma / LEVEL_STEP) + 1);

  await user.save();
  return { task, progress: user.progress };
};

const getSummary = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  return user.progress;
};

module.exports = {
  TASKS,
  addPoints,
  completeTask,
  getSummary,
};
