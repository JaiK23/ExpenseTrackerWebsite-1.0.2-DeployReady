const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const settingsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  notifications: { type: Boolean, default: true },
}, { _id: false });

const progressSchema = new mongoose.Schema({
  karma: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastDailyAt: { type: Date },
  lastWeeklyAt: { type: Date },
  lastMonthlyAt: { type: Date },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  settings: { type: settingsSchema, default: () => ({}) },
  progress: { type: progressSchema, default: () => ({}) },
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
