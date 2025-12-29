import Budget from '../models/Budget.js';

// ➕ Create or Update budget
export const setBudget = async (req, res) => {
  const {monthly, categories} = req.body;

  const budget = await Budget.findOneAndUpdate (
    {user: req.user._id},
    {monthly, categories},
    {new: true, upsert: true}
  );

  res.json (budget);
};

// 📥 Get budget
export const getBudget = async (req, res) => {
  const budget = await Budget.findOne ({user: req.user._id});
  res.json (budget || {monthly: 0, categories: {}});
};
