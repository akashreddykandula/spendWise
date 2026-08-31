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
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  AlertTriangle,
  Sparkles,
  Loader2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  ChevronDown,
} from "lucide-react";

const COLORS = [
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f97316",
  "#06b6d4",
  "#a855f7",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ color: entry.color || entry.fill }}
            className="font-medium flex items-center justify-between gap-4"
          >
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold">
              ${Number(entry.value).toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  // 🔗 Fetch logic (UNTOUCHED)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const txRes = await api.get("/transactions");
        setTransactions(Array.isArray(txRes.data) ? txRes.data : []);

        const bRes = await api.get("/budgets");
        setBudgets(bRes.data.budgets || {});
        setMonthlyBudget(bRes.data.monthlyBudget || 0);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 📆 Filter by month/year (UNTOUCHED)
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === Number(month) && d.getFullYear() === Number(year);
  });

  // 🔢 Totals (UNTOUCHED)
  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const savings = income - expense;

  // 🥧 Category pie (UNTOUCHED)
  const catMap = {};
  filtered.forEach((t) => {
    if (t.type === "expense") {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount || 0);
    }
  });
  const pieData = Object.keys(catMap).map((k) => ({
    name: k,
    value: catMap[k],
  }));

  // ⚠️ Overspending alerts (UNTOUCHED)
  const alerts = [];
  Object.keys(catMap).forEach((cat) => {
    if (budgets[cat] && catMap[cat] > budgets[cat]) {
      alerts.push(`⚠️ ${cat} exceeded by $${catMap[cat] - budgets[cat]}`);
    }
  });
  if (monthlyBudget && expense > monthlyBudget) {
    alerts.push(`🚨 Monthly budget exceeded by $${expense - monthlyBudget}`);
  }

  // 📉 Savings trend (last 6 months) (UNTOUCHED)
  const buildSavingsTrend = () => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      const txs = transactions.filter((t) => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });

      const inc = txs
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      const exp = txs
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount || 0), 0);

      arr.push({
        name: d.toLocaleString("default", { month: "short" }),
        savings: inc - exp,
      });
    }
    return arr;
  };

  const savingsTrend = buildSavingsTrend();

  // 📆 Month/year comparison (this vs last month) (UNTOUCHED)
  const prevMonth = new Date(year, month - 1, 1);
  const prevTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === prevMonth.getMonth() &&
      d.getFullYear() === prevMonth.getFullYear()
    );
  });

  const prevExpense = prevTx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expenseDiff =
    prevExpense > 0
      ? (((expense - prevExpense) / prevExpense) * 100).toFixed(1)
      : 0;

  // 🤖 Smart insight (biggest category change) (UNTOUCHED)
  let smartInsight = "No major changes detected.";
  if (prevTx.length && filtered.length) {
    const prevCat = {};
    prevTx.forEach((t) => {
      if (t.type === "expense") {
        prevCat[t.category] =
          (prevCat[t.category] || 0) + Number(t.amount || 0);
      }
    });

    let best = { cat: "", diff: 0 };
    Object.keys(catMap).forEach((cat) => {
      if (prevCat[cat]) {
        const diff = ((catMap[cat] - prevCat[cat]) / prevCat[cat]) * 100;
        if (diff > best.diff) best = { cat, diff };
      }
    });

    if (best.cat) {
      smartInsight = `🤖 ${best.cat} spend up ${best.diff.toFixed(1)}% vs last month`;
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-medium">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Financial Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Deep insights into spending habits, savings patterns, and monthly
            trends
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-2xl text-xs text-purple-300 font-semibold shadow-inner">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>
            {new Date(year, month).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m, i) => (
              <option key={i} value={i} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-40">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="Year"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Income
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              ${income.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Expense
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              ${expense.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Savings
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-400">
              ${savings.toLocaleString()}
            </h3>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Overspending Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-3 backdrop-blur-md shadow-lg"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="font-medium">{a}</span>
            </div>
          ))}
        </div>
      )}

      {/* Smart Insight Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-800/40 rounded-3xl p-5 shadow-2xl flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-white leading-relaxed">
            {smartInsight}
          </p>
          <p className="text-xs text-slate-400">
            Overall expenditure change compared to previous month:{" "}
            <span
              className={`font-semibold ${Number(expenseDiff) > 0 ? "text-rose-400" : "text-emerald-400"}`}
            >
              {expenseDiff}%
            </span>
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <PieIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Expense by Category
            </h3>
          </div>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No expenses recorded for this month.
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={4}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        stroke="#0f172a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "15px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Savings Trend Line Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <LineIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Savings Trend
              </h3>
            </div>
            <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={savingsTrend}
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
                  dataKey="savings"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
