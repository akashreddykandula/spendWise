import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema (
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    paymentMode: {
      type: String,
      default: 'Cash',
    },
    date: {
      type: Date,
      required: true,
    },
    receipt: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {timestamps: true}
);

export default mongoose.model ('Transaction', transactionSchema);
