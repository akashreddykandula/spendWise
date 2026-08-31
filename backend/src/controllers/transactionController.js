import Transaction from "../models/Transaction.js";

// ➕ Add transaction
export const addTransaction = async (req, res) => {
  try {
    const txData = {
      ...req.body,
      user: req.user._id,
    };

    if (req.file) {
      txData.receipt = req.file.path;
    }

    const tx = await Transaction.create(txData);

    res.status(201).json(tx);
  } catch (err) {
    console.error("Add transaction error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// 📥 Get transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(transactions);
  } catch (err) {
    console.error("Get transactions error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ✏️ Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.receipt = req.file.path;
    }

    const tx = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!tx) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(tx);
  } catch (err) {
    console.error("Update transaction error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// ❌ Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!tx) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted",
    });
  } catch (err) {
    console.error("Delete transaction error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};
