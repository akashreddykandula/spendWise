import Transaction from '../models/Transaction.js';

// ➕ Add transaction
export const addTransaction = async (req, res) => {
  try {
    const txData = {
      ...req.body,
      user: req.user._id,
    };

    if (req.file) {
      txData.receipt = req.file.path; // Cloudinary URL
    }

    const tx = await Transaction.create (txData);
    res.status (201).json (tx);
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};

// 📥 Get transactions (with filters + pagination)

export const getTransactions = async (req, res) => {
  const tx = await Transaction.find ({user: req.user.id}).sort ({
    createdAt: -1,
  });
  res.json (tx); // 👈 send array directly
};

// ✏️ Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const updateData = {...req.body};

    if (req.file) {
      updateData.receipt = req.file.path;
    }

    const tx = await Transaction.findOneAndUpdate (
      {_id: req.params.id, user: req.user._id},
      updateData,
      {new: true}
    );

    if (!tx) return res.status (404).json ({message: 'Not found'});
    res.json (tx);
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};

// ❌ Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete ({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!tx) return res.status (404).json ({message: 'Not found'});
    res.json ({message: 'Transaction deleted'});
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};
