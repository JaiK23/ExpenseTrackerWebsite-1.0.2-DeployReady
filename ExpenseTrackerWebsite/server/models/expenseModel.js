//server/models/expenseModel.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
     type: String,
     required: true,
     trim: true,
     maxlength: 100,
    },

    amount: {
     type: Number,
     required: true,
     min: 0.01,
    },

    category: {
      type: String,
      required: true,
      enum: [
          'Food',
          'Transportation',
          'Entertainment',
          'Shopping',
          'Bills',
          'Healthcare',   // FIXED SPELLING
          'Other',
      ],
    },

    date: {
      type: String,       // <-- IMPORTANT: use string, React sends YYYY-MM-DD
      required: true,
    },

    note: {               // FIXED name: should be note (frontend uses note)
      type: String,
      trim: true,
      maxlength: 500,
    },
},
{ timestamps: true }
);

// Round amount to 2 decimals
expenseSchema.pre('save', function (next) {
    if (this.amount) {
        this.amount = Math.round(this.amount * 100) / 100;
    }
    next();
});

module.exports = mongoose.model('Expense', expenseSchema);
