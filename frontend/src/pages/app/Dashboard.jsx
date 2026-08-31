import { useEffect, useState } from "react";
import api from "../../api/axios";
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
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gem,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
} from "lucide-react";

// Modernized Card Component
const Card = ({
  title,
  value,
  icon: Icon,
  gradient,
  badgeText,
  badgeColor,
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 border border-slate-800 shadow-xl bg-gradient-to-br ${gradient} transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl`}
  >
    {/* Ambient Card Background Glow */}
    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </h3>
      </div>
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-white shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
    </div>

    {badgeText && (
      <div className="mt-4 flex items-center gap-1 text-xs">
        <span className={`px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
    )}
  </div>
);

// Custom Chart Tooltip styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color }}
            className="font-medium flex items-center justify-between gap-4"
          >
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold">₹{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState({});
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [alerts, setAlerts] = useState([]);

  // 🔄 Fetch data logic (UNTOUCHED)
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [txRes, budgetRes] = await Promise.all([
          api.get("/transactions"),
          api.get("/budgets"),
        ]);

        if (!mounted) return;

        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);

        setBudgets(budgetRes.data?.budgets || {});

        setMonthlyBudget(budgetRes.data?.monthlyBudget || 0);
      } catch (err) {
        if (mounted) {
          console.error("Dashboard fetch error:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // 🔢 Totals logic (UNTOUCHED)
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = income - expense;
  const savings = balance;

  // 🕒 Recent 5 logic (UNTOUCHED)
  const recent = [...transactions].slice(0, 5);

  // 📈 Line chart data logic (UNTOUCHED)
  const buildChartData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });

      const monthTx = transactions.filter((t) => {
        const td = new Date(t.date);
        return (
          td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear()
        );
      });

      const inc = monthTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      const exp = monthTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      months.push({ name: key, income: inc, expense: exp });
    }
    return months;
  };

  const data = buildChartData();

  // 📊 Pie data logic (UNTOUCHED)
  const expenseByCategory = {};
  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      expenseByCategory[tx.category] =
        (expenseByCategory[tx.category] || 0) + Number(tx.amount || 0);
    }
  });

  const pieData = Object.keys(expenseByCategory).map((cat) => ({
    name: cat,
    value: expenseByCategory[cat],
  }));

  // ⚠️ Alerts logic (UNTOUCHED)
  useEffect(() => {
    const newAlerts = [];
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        totalExpense += Number(tx.amount || 0);

        if (
          budgets[tx.category] &&
          expenseByCategory[tx.category] > budgets[tx.category]
        ) {
          newAlerts.push(
            `⚠️ ${tx.category} budget exceeded by ₹${expenseByCategory[tx.category] - budgets[tx.category]}`,
          );
        }
      }
    });

    if (monthlyBudget && totalExpense > monthlyBudget) {
      newAlerts.push(
        `🚨 Monthly budget exceeded by ₹${totalExpense - monthlyBudget}`,
      );
    }

    setAlerts(newAlerts);
  }, [transactions, budgets, monthlyBudget]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const PIE_COLORS = [
    "#ec4899",
    "#8b5cf6",
    "#10b981",
    "#f97316",
    "#06b6d4",
    "#a855f7",
  ];

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* ⚠️ Alerts Banner */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-3 shadow-lg backdrop-blur-md"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-medium">{a}</span>
            </div>
          ))}
        </div>
      )}

      {/* 👋 Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Financial Overview
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track your income, expenses and savings performance
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {/* 🔢 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card
          title="Total Balance"
          value={`₹${balance.toLocaleString()}`}
          icon={Wallet}
          gradient="from-slate-900 via-purple-950/40 to-slate-900"
          badgeText="Net Worth"
          badgeColor="bg-purple-500/20 text-purple-300"
        />
        <Card
          title="Total Income"
          value={`₹${income.toLocaleString()}`}
          icon={TrendingUp}
          gradient="from-slate-900 via-emerald-950/30 to-slate-900"
          badgeText="Inflow"
          badgeColor="bg-emerald-500/20 text-emerald-300"
        />
        <Card
          title="Total Expense"
          value={`₹${expense.toLocaleString()}`}
          icon={TrendingDown}
          gradient="from-slate-900 via-rose-950/30 to-slate-900"
          badgeText="Outflow"
          badgeColor="bg-rose-500/20 text-rose-300"
        />
        <Card
          title="Savings"
          value={`₹${savings.toLocaleString()}`}
          icon={Gem}
          gradient="from-slate-900 via-blue-950/30 to-slate-900"
          badgeText="Retained"
          badgeColor="bg-blue-500/20 text-blue-300"
        />
      </div>

      {/* 📈 Line Chart + 💸 Recent Transactions Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart Component */}
        <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Income vs Expense
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f43f5e", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Recent Activity
              </h3>
              <span className="text-xs text-slate-400">Latest 5</span>
            </div>

            {recent.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No recent transactions found.
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-2xl p-3.5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 text-sm truncate">
                          {tx.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold text-sm shrink-0 ml-2 ${
                        tx.type === "income"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}₹
                      {Math.abs(tx.amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Pie Chart Category Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Spending by Category
          </h3>
        </div>

        {pieData.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No category spending data available.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📉 Savings Trend Footer Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Savings Summary</h3>
          <p className="text-slate-400 text-sm">
            Your net liquidity position generated from verified income vs
            expenses.
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/60 px-5 py-3 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
            Available Reserve
          </span>
          <span className="text-2xl font-black text-emerald-400">
            ₹{savings.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
