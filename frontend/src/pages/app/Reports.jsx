import { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  FileText,
  Download,
  FileSpreadsheet,
  Loader2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Calendar,
  Filter,
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

const StatCard = ({ title, value, icon: Icon, gradient, badgeText }) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-5 border border-slate-800 shadow-xl bg-gradient-to-br ${gradient} transition-all duration-300 hover:scale-[1.01]`}
  >
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
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-white shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
    </div>

    {badgeText && (
      <div className="mt-4 flex items-center gap-1 text-xs">
        <span className="px-2.5 py-0.5 rounded-full font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300">
          {badgeText}
        </span>
      </div>
    )}
  </div>
);

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch transactions (LOGIC UNTOUCHED)
  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Reports fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  // Filter logic (LOGIC UNTOUCHED)
  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.date);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to)) return false;
    return true;
  });

  // Totals calculations (LOGIC UNTOUCHED)
  const income = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const expense = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const savings = income - expense;

  // Monthly trend calculations (LOGIC UNTOUCHED)
  const buildLineData = () => {
    const map = {};
    filtered.forEach((t) => {
      const d = new Date(t.date);
      const key = d.toLocaleString("default", { month: "short" });
      if (!map[key]) map[key] = { name: key, income: 0, expense: 0 };
      map[key][t.type] += Number(t.amount || 0);
    });
    return Object.values(map);
  };

  const lineData = buildLineData();

  // Category pie calculations (LOGIC UNTOUCHED)
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

  // Export PDF (LOGIC UNTOUCHED)
  const exportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(236, 72, 153); // pink
    doc.text("SpendWise", 14, 18);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Your Expenses Report", 14, 26);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    // Table
    autoTable(doc, {
      startY: 38,
      head: [["Title", "Type", "Category", "Amount (INR)", "Date"]],
      body: filtered.map((t) => [
        t.title,
        t.type,
        t.category,
        `${Number(t.amount).toFixed(2)}`,
        new Date(t.date).toLocaleDateString(),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 92, 246], // purple
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 255],
      },
    });

    // Totals at bottom
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setTextColor(0);

    doc.text(`Total Income: ${income.toFixed(2)} INR`, 14, finalY);
    doc.text(`Total Expense: ${expense.toFixed(2)} INR`, 14, finalY + 8);
    doc.text(`Savings: ${(income - expense).toFixed(2)} INR`, 14, finalY + 16);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "© SpendWise — Smart Expense Tracker-By Akash Kandula",
      14,
      finalY + 28,
    );

    doc.save("spendwise-report.pdf");
  };

  // Export CSV (LOGIC UNTOUCHED)
  const exportCSV = () => {
    const headers = ["Title,Type,Category,Amount,Date"];
    const rows = filtered.map(
      (t) =>
        `${t.title},${t.type},${t.category},${t.amount},${new Date(t.date).toLocaleDateString()}`,
    );
    const csv = [...headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spendwise-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm font-medium">Generating financial reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Financial Reports
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Analyze long-term trends and export detailed financial statements
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-2xl text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Filtered Records: {filtered.length}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Income"
          value={`$${income.toLocaleString()}`}
          icon={TrendingUp}
          gradient="from-slate-900 via-emerald-950/30 to-slate-900"
          badgeText="Inflow"
        />
        <StatCard
          title="Expense"
          value={`$${expense.toLocaleString()}`}
          icon={TrendingDown}
          gradient="from-slate-900 via-rose-950/30 to-slate-900"
          badgeText="Outflow"
        />
        <StatCard
          title="Savings"
          value={`$${savings.toLocaleString()}`}
          icon={PiggyBank}
          gradient="from-slate-900 via-blue-950/30 to-slate-900"
          badgeText="Net Reserves"
        />
        <StatCard
          title="Records"
          value={filtered.length}
          icon={FileText}
          gradient="from-slate-900 via-purple-950/30 to-slate-900"
          badgeText="Transactions"
        />
      </div>

      {/* Filters + Export Control Panel */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl flex flex-col lg:flex-row gap-6 justify-between items-stretch lg:items-center">
        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Filter Range:</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
            />
            <span className="text-xs text-slate-500">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Export Statement:
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={exportPDF}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PDF Report</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={exportCSV}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV File</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <LineIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Income vs Expense Trend
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Filtered Window
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
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

        {/* Category Pie Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <PieIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Expense Distribution
            </h3>
          </div>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No expense records found within selected dates.
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
      </div>
    </div>
  );
};

export default Reports;
