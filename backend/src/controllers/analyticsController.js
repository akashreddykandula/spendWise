import Transaction from '../models/Transaction.js';

export const getOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const start = new Date ();
    start.setDate (1);
    start.setHours (0, 0, 0, 0);

    const end = new Date ();

    // 💰 Income & Expense totals
    const totals = await Transaction.aggregate ([
      {
        $match: {
          user: userId,
          date: {$gte: start, $lte: end},
        },
      },
      {
        $group: {
          _id: '$type',
          total: {$sum: '$amount'},
        },
      },
    ]);

    let totalIncome = 0, totalExpense = 0;
    totals.forEach (t => {
      if (t._id === 'income') totalIncome = t.total;
      if (t._id === 'expense') totalExpense = t.total;
    });

    // 🥧 Category-wise expense
    const byCategory = await Transaction.aggregate ([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: {$gte: start, $lte: end},
        },
      },
      {
        $group: {
          _id: '$category',
          total: {$sum: '$amount'},
        },
      },
      {$sort: {total: -1}},
    ]);

    // 📊 Daily expense
    const daily = await Transaction.aggregate ([
      {
        $match: {
          user: userId,
          type: 'expense',
          date: {$gte: start, $lte: end},
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {format: '%Y-%m-%d', date: '$date'},
          },
          total: {$sum: '$amount'},
        },
      },
      {$sort: {_id: 1}},
    ]);

    const highestCategory = byCategory[0] || null;

    res.json ({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: byCategory.map (c => ({
        category: c._id,
        total: c.total,
      })),
      daily: daily.map (d => ({
        date: d._id,
        total: d.total,
      })),
      highestCategory,
    });
  } catch (err) {
    res.status (500).json ({message: err.message});
  }
};


import User from "../models/User.js";

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // 📆 Month & Year range
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // 📊 Income vs Expense timeline (current month, daily)
    const timeline = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: monthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          income: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 📉 Savings trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const savingsTrend = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          income: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          savings: { $subtract: ["$income", "$expense"] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // 📆 Month vs Year comparison
    const monthTotals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: monthStart, $lte: now } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const yearTotals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: yearStart, $lte: now } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const parseTotals = (arr) => {
      let income = 0, expense = 0;
      arr.forEach(t => {
        if (t._id === "income") income = t.total;
        if (t._id === "expense") expense = t.total;
      });
      return { income, expense };
    };

    const monthComp = parseTotals(monthTotals);
    const yearComp = parseTotals(yearTotals);

    // ⚠️ Overspending detection
    const user = await User.findById(userId);
    let overspending = false;
    let overspentBy = 0;

    if (user?.monthlyBudget > 0) {
      if (monthComp.expense > user.monthlyBudget) {
        overspending = true;
        overspentBy = monthComp.expense - user.monthlyBudget;
      }
    }

    res.json({
      timeline: timeline.map(t => ({
        date: t._id,
        income: t.income,
        expense: t.expense,
      })),
      savingsTrend,
      comparison: {
        month: monthComp,
        year: yearComp,
      },
      overspending: {
        status: overspending,
        overspentBy,
        budget: user?.monthlyBudget || 0,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
