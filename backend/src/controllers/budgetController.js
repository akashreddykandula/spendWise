import User from '../models/User.js';

// 💰 Set monthly budget
export const setMonthlyBudget = async (req, res) => {
  const {monthlyBudget} = req.body;

  const user = await User.findByIdAndUpdate (
    req.user._id,
    {monthlyBudget},
    {new: true}
  );

  res.json ({monthlyBudget: user.monthlyBudget});
};

// 🏷️ Set category budgets
export const setCategoryBudgets = async (req, res) => {
  const {budgets} = req.body; // { Food: 5000, Travel: 3000 }

  const user = await User.findByIdAndUpdate (
    req.user._id,
    {budgets},
    {new: true}
  );

  res.json ({budgets: user.budgets});
};

// 📥 Get budgets
export const getBudgets = async (req, res) => {
  const user = await User.findById (req.user._id).select (
    'monthlyBudget budgets'
  );
  res.json ({
    monthlyBudget: user.monthlyBudget,
    budgets: user.budgets,
  });
};
