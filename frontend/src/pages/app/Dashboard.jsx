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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Card = ({title, value, icon, gradient}) => (
  <div
    className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient}`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white/80">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-bold mt-1">{value}</h3>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [transactions, setTransactions] = useState ([]);
  const [loading, setLoading] = useState (true);
  const [budgets, setBudgets] = useState ({});
  const [monthlyBudget, setMonthlyBudget] = useState (0);
  const [alerts, setAlerts] = useState ([]);

  // 🔄 Fetch data
  useEffect (() => {
    const fetchData = async () => {
      try {
        const txRes = await api.get ('/transactions');
        setTransactions (Array.isArray (txRes.data) ? txRes.data : []);

        const budgetRes = await api.get ('/budgets');
        setBudgets (budgetRes.data.budgets || {});
        setMonthlyBudget (budgetRes.data.monthlyBudget || 0);
      } catch (err) {
        console.error ('Dashboard fetch error:', err);
      } finally {
        setLoading (false);
      }
    };
    fetchData ();
  }, []);

  // 🔢 Totals
  const income = transactions
    .filter (t => t.type === 'income')
    .reduce ((sum, t) => sum + Number (t.amount || 0), 0);

  const expense = transactions
    .filter (t => t.type === 'expense')
    .reduce ((sum, t) => sum + Number (t.amount || 0), 0);

  const balance = income - expense;
  const savings = balance;

  // 🕒 Recent 5
  const recent = [...transactions].slice (0, 5);

  // 📈 Line chart data
  const buildChartData = () => {
    const months = [];
    const now = new Date ();

    for (let i = 5; i >= 0; i--) {
      const d = new Date (now.getFullYear (), now.getMonth () - i, 1);
      const key = d.toLocaleString ('default', {month: 'short'});

      const monthTx = transactions.filter (t => {
        const td = new Date (t.date);
        return (
          td.getMonth () === d.getMonth () &&
          td.getFullYear () === d.getFullYear ()
        );
      });

      const inc = monthTx
        .filter (t => t.type === 'income')
        .reduce ((s, t) => s + Number (t.amount || 0), 0);

      const exp = monthTx
        .filter (t => t.type === 'expense')
        .reduce ((s, t) => s + Number (t.amount || 0), 0);

      months.push ({name: key, income: inc, expense: exp});
    }
    return months;
  };

  const data = buildChartData ();

  // 📊 Pie data
  const expenseByCategory = {};
  transactions.forEach (tx => {
    if (tx.type === 'expense') {
      expenseByCategory[tx.category] =
        (expenseByCategory[tx.category] || 0) + Number (tx.amount || 0);
    }
  });

  const pieData = Object.keys (expenseByCategory).map (cat => ({
    name: cat,
    value: expenseByCategory[cat],
  }));

  // ⚠️ Alerts
  useEffect (
    () => {
      const newAlerts = [];
      let totalExpense = 0;

      transactions.forEach (tx => {
        if (tx.type === 'expense') {
          totalExpense += Number (tx.amount || 0);

          if (
            budgets[tx.category] &&
            expenseByCategory[tx.category] > budgets[tx.category]
          ) {
            newAlerts.push (
              `⚠️ ${tx.category} budget exceeded by ₹${expenseByCategory[tx.category] - budgets[tx.category]}`
            );
          }
        }
      });

      if (monthlyBudget && totalExpense > monthlyBudget) {
        newAlerts.push (
          `🚨 Monthly budget exceeded by ₹${totalExpense - monthlyBudget}`
        );
      }

      setAlerts (newAlerts);
    },
    [transactions, budgets, monthlyBudget]
  );

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ⚠️ Alerts */}
      {alerts.map ((a, i) => (
        <div
          key={i}
          className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm"
        >
          {a}
        </div>
      ))}

      {/* 👋 Welcome */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold">Overview</h2>
        <p className="text-gray-400 text-sm">
          Track your income, expenses and savings
        </p>
      </div>

      {/* 🔢 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Total Balance"
          value={`₹${balance}`}
          icon="💰"
          gradient="from-pink-500 to-purple-600"
        />
        <Card
          title="Total Income"
          value={`₹${income}`}
          icon="📈"
          gradient="from-emerald-500 to-teal-600"
        />
        <Card
          title="Total Expense"
          value={`₹${expense}`}
          icon="📉"
          gradient="from-red-500 to-pink-600"
        />
        <Card
          title="Savings"
          value={`₹${savings}`}
          icon="💎"
          gradient="from-indigo-500 to-blue-600"
        />
      </div>

      {/* 📈 Charts + 💸 Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="xl:col-span-2 bg-white/5 rounded-2xl p-5 border border-white/10 shadow">
          <h3 className="text-lg font-semibold mb-4">
            Income vs Expense (Last 6 months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f472b6"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          {recent.length === 0
            ? <p className="text-gray-400 text-sm">No transactions yet.</p>
            : <div className="space-y-3">
                {recent.map (tx => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{tx.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date (tx.date).toLocaleDateString ()}
                      </p>
                    </div>
                    <p
                      className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-pink-400'}`}
                    >
                      {tx.type === 'income' ? '+' : '-'}₹
                      {Math.abs (tx.amount)}
                    </p>
                  </div>
                ))}
              </div>}
        </div>
      </div>

      {/* 📊 Pie Chart */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map ((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      ['#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#06b6d4'][
                        i % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📉 Savings Trend */}
      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-5 shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Savings Trend</h3>
          <p className="text-gray-300 text-sm">
            Your current savings based on income vs expense
          </p>
        </div>
        <div className="text-3xl font-bold text-emerald-400">
          ₹{savings}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
