import {useEffect, useState} from 'react';
import api from '../../api/axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#06b6d4'];

const Analytics = () => {
  const [transactions, setTransactions] = useState ([]);
  const [budgets, setBudgets] = useState ({});
  const [monthlyBudget, setMonthlyBudget] = useState (0);
  const [loading, setLoading] = useState (true);

  const now = new Date ();
  const [month, setMonth] = useState (now.getMonth ());
  const [year, setYear] = useState (now.getFullYear ());

  useEffect (() => {
    const fetchAll = async () => {
      try {
        const txRes = await api.get ('/transactions');
        setTransactions (Array.isArray (txRes.data) ? txRes.data : []);

        const bRes = await api.get ('/budgets');
        setBudgets (bRes.data.budgets || {});
        setMonthlyBudget (bRes.data.monthlyBudget || 0);
      } catch (err) {
        console.error ('Analytics fetch error:', err);
      } finally {
        setLoading (false);
      }
    };
    fetchAll ();
  }, []);

  // 📆 Filter by month/year
  const filtered = transactions.filter (t => {
    const d = new Date (t.date);
    return (
      d.getMonth () === Number (month) && d.getFullYear () === Number (year)
    );
  });

  // 🔢 Totals
  const income = filtered
    .filter (t => t.type === 'income')
    .reduce ((s, t) => s + Number (t.amount || 0), 0);

  const expense = filtered
    .filter (t => t.type === 'expense')
    .reduce ((s, t) => s + Number (t.amount || 0), 0);

  const savings = income - expense;

  // 🥧 Category pie
  const catMap = {};
  filtered.forEach (t => {
    if (t.type === 'expense') {
      catMap[t.category] = (catMap[t.category] || 0) + Number (t.amount || 0);
    }
  });
  const pieData = Object.keys (catMap).map (k => ({
    name: k,
    value: catMap[k],
  }));

  // ⚠️ Overspending alerts
  const alerts = [];
  Object.keys (catMap).forEach (cat => {
    if (budgets[cat] && catMap[cat] > budgets[cat]) {
      alerts.push (`⚠️ ${cat} exceeded by ₹${catMap[cat] - budgets[cat]}`);
    }
  });
  if (monthlyBudget && expense > monthlyBudget) {
    alerts.push (`🚨 Monthly budget exceeded by ₹${expense - monthlyBudget}`);
  }

  // 📉 Savings trend (last 6 months)
  const buildSavingsTrend = () => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date (now.getFullYear (), now.getMonth () - i, 1);
      const m = d.getMonth ();
      const y = d.getFullYear ();

      const txs = transactions.filter (t => {
        const td = new Date (t.date);
        return td.getMonth () === m && td.getFullYear () === y;
      });

      const inc = txs
        .filter (t => t.type === 'income')
        .reduce ((s, t) => s + Number (t.amount || 0), 0);

      const exp = txs
        .filter (t => t.type === 'expense')
        .reduce ((s, t) => s + Number (t.amount || 0), 0);

      arr.push ({
        name: d.toLocaleString ('default', {month: 'short'}),
        savings: inc - exp,
      });
    }
    return arr;
  };

  const savingsTrend = buildSavingsTrend ();

  // 📆 Month/year comparison (this vs last month)
  const prevMonth = new Date (year, month - 1, 1);
  const prevTx = transactions.filter (t => {
    const d = new Date (t.date);
    return (
      d.getMonth () === prevMonth.getMonth () &&
      d.getFullYear () === prevMonth.getFullYear ()
    );
  });

  const prevExpense = prevTx
    .filter (t => t.type === 'expense')
    .reduce ((s, t) => s + Number (t.amount || 0), 0);

  const expenseDiff = prevExpense > 0
    ? ((expense - prevExpense) / prevExpense * 100).toFixed (1)
    : 0;

  // 🤖 Smart insight (biggest category change)
  let smartInsight = 'No major changes detected.';
  if (prevTx.length && filtered.length) {
    const prevCat = {};
    prevTx.forEach (t => {
      if (t.type === 'expense') {
        prevCat[t.category] =
          (prevCat[t.category] || 0) + Number (t.amount || 0);
      }
    });

    let best = {cat: '', diff: 0};
    Object.keys (catMap).forEach (cat => {
      if (prevCat[cat]) {
        const diff = (catMap[cat] - prevCat[cat]) / prevCat[cat] * 100;
        if (diff > best.diff) best = {cat, diff};
      }
    });

    if (best.cat) {
      smartInsight = `🤖 ${best.cat} spend up ${best.diff.toFixed (1)}% vs last month`;
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Analytics</h2>
        <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 text-pink-300 text-sm font-medium border border-pink-500/30">
          📆 Showing: {new Date (year, month).toLocaleString ('default', {
            month: 'long',
            year: 'numeric',
          })}
        </div>

        <p className="text-gray-400 text-sm">
          Smart insights into your finances
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={month}
          onChange={e => setMonth (e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#1b1230] text-white border border-white/10 focus:outline-none"
        >
          {[
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ].map ((m, i) => (
            <option key={i} value={i} className="bg-[#120a1f] text-white">
              {m}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={e => setYear (e.target.value)}
          className="px-4 py-2 rounded-xl bg-white/10 text-white"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <p className="text-gray-400 text-sm">Income</p>
          <h3 className="text-2xl font-bold text-emerald-400">₹{income}</h3>
        </div>
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <p className="text-gray-400 text-sm">Expense</p>
          <h3 className="text-2xl font-bold text-pink-400">₹{expense}</h3>
        </div>
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <p className="text-gray-400 text-sm">Savings</p>
          <h3 className="text-2xl font-bold text-indigo-400">₹{savings}</h3>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 &&
        <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-4 space-y-1">
          {alerts.map ((a, i) => (
            <p key={i} className="text-red-300 text-sm">{a}</p>
          ))}
        </div>}

      {/* Smart insight */}
      <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-2xl p-4">
        <p className="text-indigo-300 text-sm">{smartInsight}</p>
        <p className="text-gray-400 text-xs mt-1">
          Expense change vs last month: {expenseDiff}%
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 h-72">
          <h3 className="font-semibold mb-2">Expense by Category</h3>
          {pieData.length === 0
            ? <p className="text-gray-400 text-sm">No data</p>
            : <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {pieData.map ((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>}
        </div>

        {/* Savings Trend */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 h-72">
          <h3 className="font-semibold mb-2">Savings Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#8b5cf6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
